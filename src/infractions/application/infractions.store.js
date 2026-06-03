import {defineStore} from "pinia";
import {ref, computed} from "vue";
import {InfractionsApi} from "../infrastructure/infractions-api.js";
import {InfractionAssembler} from "../infrastructure/infraction.assembler.js";

const infractionsApi = new InfractionsApi();

export const useInfractionsStore = defineStore('infractions', () => {
  const infractions = ref([]);
  const errors = ref([]);
  const loading = ref(false);

  async function fetchInfractions() {
    loading.value = true;
    errors.value = [];
    try {
      const response = await infractionsApi.getAllInfractions();
      infractions.value = InfractionAssembler.toEntitiesFromResponse(response);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  async function processValidation(id, status) {
    try {
      const infraction = infractions.value.find(i => i.id === id);
      if (!infraction) throw new Error("Infraction not found");

      const updated = await infractionsApi.updateInfraction(id, { ...infraction, status });
      infraction.status = updated.data.status;

      if (status === 'VALIDATED') {
        const over = Math.max(0, (infraction.speed || 0) - (infraction.limit || 0));
        const amount = Number((over * 10).toFixed(2));
        const ticket = {
          id: `TICK-${Date.now()}`,
          infractionId: infraction.id,
          plate: infraction.plate,
          amount,
          status: 'UNPAID',
          issuedAt: new Date().toISOString()
        };
        const ticketResp = await infractionsApi.createTicket(ticket);
        return { infraction, ticket: ticketResp.data };
      }
      return { infraction };
    } catch (error) {
      errors.value.push(error);
      throw error;
    }
  }

  return {
    infractions,
    errors,
    loading,
    fetchInfractions,
    processValidation
  };
});