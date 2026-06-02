import {defineStore} from "pinia";
import {ref} from "vue";
import {CitizenPortalApi} from "../infrastructure/citizen-portal-api.js";
import {TicketAssembler} from "../infrastructure/ticket.assembler.js";

const citizenApi = new CitizenPortalApi();

export const useCitizenPortalStore = defineStore('citizen', () => {
  const tickets = ref([]);
  const errors = ref([]);
  const loading = ref(false);

  async function searchTickets(plate) {
    loading.value = true;
    errors.value = [];
    try {
      const response = await citizenApi.searchTicketsByPlate(plate);
      tickets.value = TicketAssembler.toEntitiesFromResponse(response);
    } catch (error) {
      errors.value.push(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function payTicket(id) {
    try {
      await citizenApi.payTicket(id);
      const ticketIndex = tickets.value.findIndex(t => t.id === id);
      if (ticketIndex !== -1) {
        tickets.value[ticketIndex].status = 'PAID';
      }
    } catch (error) {
      errors.value.push(error);
      throw error;
    }
  }

  return {
    tickets,
    errors,
    loading,
    searchTickets,
    payTicket
  };
});