import {defineStore} from "pinia";
import {ref, computed} from "vue";
import {AnalyticsApi} from "../infrastructure/analytics-api.js";
import {Report} from "../domain/model/report.entity.js";

const analyticsApi = new AnalyticsApi();
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
      const response = await analyticsApi.getInfractions();
      const allInfractions = response.data instanceof Array ? response.data : response.data['infractions'] || [];

      const monthlyGroups = {};
      allInfractions.forEach(inf => {
        const date = new Date(inf.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyGroups[key]) monthlyGroups[key] = [];
        monthlyGroups[key].push(inf);
      });

      reports.value = Object.entries(monthlyGroups)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, items]) => {
          const [year, monthNum] = month.split('-');
          return new Report({
            id: `REP-${month}`,
            title: `Reporte ${MONTH_NAMES[parseInt(monthNum) - 1]} ${year}`,
            date: `${year}-${monthNum}-01`,
            totalInfractions: items.length
          });
        });
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