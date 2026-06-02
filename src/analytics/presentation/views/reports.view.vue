<template>
  <div class="page-shell reports-shell">
    <section class="page-hero">
      <div>
        <span class="eyebrow">Analítica y simulación</span>
        <h1>Reportes Estadísticos</h1>
      </div>

      <div class="hero-metrics">
        <article class="metric-card">
          <span>Reportes</span>
          <strong>{{ reports.length }}</strong>
        </article>
        <article class="metric-card metric-highlight">
          <span>Infracciones registradas</span>
          <strong>{{ totalInfractions }}</strong>
        </article>
      </div>
    </section>

    <section class="surface reports-surface">
      <div v-if="loading" class="state-box">Cargando reportes...</div>
      <div v-else-if="errors.length" class="state-box state-error">Ocurrió un error al cargar los reportes.</div>
      <div v-else-if="reports.length === 0" class="state-box">No hay reportes disponibles.</div>
      <div v-else class="reports-grid">
        <report-card
          v-for="report in reports"
          :key="report.id"
          :report="report"
          @download="handleDownload"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAnalyticsStore } from '../../application/analytics.store.js';
import ReportCard from '../components/report-card.vue';

const store = useAnalyticsStore();

const reports = computed(() => store.reports);
const loading = computed(() => store.loading);
const errors = computed(() => store.errors);
const totalInfractions = computed(() => store.totalInfractions);

onMounted(async () => {
  await store.fetchReports();
});

const handleDownload = (report) => {
  // In a real app, this would trigger a file download or API call
  console.log(`Downloading report ${report.id}`);
  alert(`Descargando reporte: ${report.title}`);
};
</script>

<style scoped>
.reports-shell { padding-bottom: 2rem; }
.page-hero { display: flex; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; }
.eyebrow { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 999px; background: rgba(10, 100, 255, 0.12); color: #0a64ff; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.page-hero h1 { margin: 0.75rem 0 0.5rem; }
.page-hero p { color: #64748b; line-height: 1.6; }
.hero-metrics { display: grid; grid-template-columns: repeat(2, minmax(140px, 1fr)); gap: 1rem; min-width: 300px; }
.metric-card { background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 20px; padding: 1rem 1.2rem; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
.metric-card span { display: block; color: #64748b; font-size: 0.9rem; }
.metric-card strong { display: block; margin-top: 0.35rem; font-size: 2rem; color: #0f172a; }
.metric-highlight { background: linear-gradient(135deg, rgba(10, 100, 255, 0.14), rgba(108, 92, 231, 0.14)); }
.surface { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 24px; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
.reports-surface { padding: 1.25rem; }
.reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.state-box { text-align: center; padding: 2rem 1rem; color: #64748b; }
.state-error { color: #ef4444; }
@media (max-width: 1024px) { .page-hero { grid-template-columns: 1fr; flex-direction: column; } .hero-metrics { width: 100%; grid-template-columns: 1fr 1fr; } }
</style>