import {defineStore} from "pinia";
import {ref, computed} from "vue";
import {SensorMonitoringApi} from "../infrastructure/sensor-monitoring-api.js";
import {SensorAssembler} from "../infrastructure/sensor.assembler.js";

const sensorMonitoringApi = new SensorMonitoringApi();

export const useSensorMonitoringStore = defineStore('monitoring', () => {
  const sensors = ref([]);
  const errors = ref([]);
  const loading = ref(false);

  const operativeCount = computed(() => {
    return sensors.value.filter((sensor) => sensor.status === 'OPERATIVE').length;
  });

  async function fetchSensors() {
    loading.value = true;
    errors.value = [];
    try {
      const response = await sensorMonitoringApi.getAllSensors();
      sensors.value = SensorAssembler.toEntitiesFromResponse(response);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  return {
    sensors,
    errors,
    loading,
    operativeCount,
    fetchSensors
  };
});