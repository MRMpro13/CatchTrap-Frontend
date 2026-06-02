import {defineStore} from "pinia";
import {ref, computed} from "vue";
import {AnalyticsApi} from "../infrastructure/analytics-api.js";
import {ReportAssembler} from "../infrastructure/report.assembler.js";

const analyticsApi = new AnalyticsApi();

export const useAnalyticsStore = defineStore('analytics', () => {
  const reports = ref([]);
  const errors = ref([]);
  const loading = ref(false);

  const totalInfractions = computed(() => {
    return reports.value.reduce((acc, report) => acc + (report.totalInfractions || 0), 0);
  });

  async function fetchReports() {
    loading.value = true;
    errors.value = [];
    try {
      const response = await analyticsApi.getReports();
      reports.value = ReportAssembler.toEntitiesFromResponse(response);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  return {
    reports,
    errors,
    loading,
    totalInfractions,
    fetchReports
  };
});