<template>
  <div class="page-shell monitoring-shell">
    <section class="page-hero">
      <div>
        <span class="eyebrow">Monitoreo operativo</span>
        <h1>Dashboard de Sensores</h1>
        <p>Visualiza el estado de la red y su disponibilidad antes de pasar a backend real.</p>
      </div>

      <div class="hero-metrics">
        <article class="metric-card">
          <span>Total sensores</span>
          <strong>{{ sensors.length }}</strong>
        </article>
        <article class="metric-card metric-highlight">
          <span>Operativos</span>
          <strong>{{ operativeCount }}</strong>
        </article>
      </div>
    </section>

    <section class="surface panel-controls">
      <div class="control-group">
        <label for="sensor-search">Buscar sensor</label>
        <input id="sensor-search" v-model="searchQuery" type="search" placeholder="ID, ubicación o estado" />
      </div>
      <div class="control-group">
        <label for="sensor-status">Estado</label>
        <select id="sensor-status" v-model="statusFilter">
          <option value="ALL">Todos</option>
          <option value="OPERATIVE">Operativo</option>
          <option value="MAINTENANCE">Mantenimiento</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="FAULT">Con falla</option>
        </select>
      </div>
      <div class="control-actions">
        <button class="btn-secondary" @click="resetFilters">Limpiar</button>
        <button class="btn-primary" @click="loadSensors">Refrescar</button>
      </div>
    </section>

    <section class="surface table-surface">
      <div v-if="loading" class="state-box">Cargando sensores...</div>
      <div v-else-if="errors.length" class="state-box state-error">Ocurrió un error al cargar los sensores.</div>
      <div v-else>
        <div class="table-meta">
          <p>Mostrando {{ filteredSensors.length }} sensores.</p>
          <p>Última actualización: {{ lastRefreshLabel }}</p>
        </div>

        <div class="sensor-grid" v-if="filteredSensors.length">
          <sensor-card
            v-for="sensor in filteredSensors"
            :key="sensor.id"
            :sensor="sensor"
          />
        </div>

        <div v-else class="state-box">No hay sensores que coincidan con los filtros.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSensorMonitoringStore } from '../../application/sensor-monitoring.store.js';
import SensorCard from '../components/sensor-card.vue';

const store = useSensorMonitoringStore();

const searchQuery = ref('');
const statusFilter = ref('ALL');
const lastRefreshLabel = ref('Sin actualización');

const sensors = computed(() => store.sensors);
const loading = computed(() => store.loading);
const errors = computed(() => store.errors);
const operativeCount = computed(() => store.operativeCount);

const filteredSensors = computed(() => {
  const search = searchQuery.value.trim().toLowerCase();
  return sensors.value.filter((sensor) => {
    const matchesSearch = !search
      || sensor.id.toLowerCase().includes(search)
      || sensor.location.toLowerCase().includes(search)
      || sensor.status.toLowerCase().includes(search);
    const matchesStatus = statusFilter.value === 'ALL' || sensor.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const loadSensors = async () => {
  await store.fetchSensors();
  if (store.errors.length === 0) {
    lastRefreshLabel.value = new Date().toLocaleString();
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'ALL';
};

onMounted(async () => {
  await loadSensors();
});
</script>

<style scoped>
.monitoring-shell { padding-bottom: 2rem; }
.page-hero { display: flex; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; }
.eyebrow { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 999px; background: rgba(10, 100, 255, 0.12); color: var(--brand-primary, #0a64ff); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.page-hero h1 { margin: 0.75rem 0 0.5rem; }
.page-hero p { color: var(--text-muted, #64748b); line-height: 1.6; }
.hero-metrics { display: grid; grid-template-columns: repeat(2, minmax(140px, 1fr)); gap: 1rem; min-width: 300px; }
.metric-card { background: rgba(255, 255, 255, 0.7); border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-radius: 20px; padding: 1rem 1.2rem; box-shadow: var(--shadow-soft, 0 18px 50px rgba(15, 23, 42, 0.08)); }
.metric-card span { display: block; color: var(--text-muted, #64748b); font-size: 0.9rem; }
.metric-card strong { display: block; margin-top: 0.35rem; font-size: 2rem; color: var(--text-strong, #0f172a); }
.metric-highlight { background: linear-gradient(135deg, rgba(10, 100, 255, 0.14), rgba(108, 92, 231, 0.14)); }
.surface { background: var(--surface, rgba(255, 255, 255, 0.9)); border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-radius: 24px; box-shadow: var(--shadow-soft, 0 18px 50px rgba(15, 23, 42, 0.08)); }
.panel-controls { display: grid; grid-template-columns: 1.5fr 1fr auto; gap: 1rem; padding: 1.25rem; margin-bottom: 1.25rem; }
.control-group { display: flex; flex-direction: column; gap: 0.45rem; }
.control-group label { font-size: 0.9rem; font-weight: 700; color: var(--text-strong, #0f172a); }
.control-group input, .control-group select { width: 100%; border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-radius: 14px; padding: 0.9rem 1rem; font: inherit; background: rgba(255, 255, 255, 0.9); color: var(--text-strong, #0f172a); box-sizing: border-box; }
.control-actions { display: flex; gap: 0.75rem; align-items: end; flex-wrap: wrap; }
.btn-primary, .btn-secondary { border: none; border-radius: 14px; padding: 0.9rem 1rem; font: inherit; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
.btn-primary:hover, .btn-secondary:hover { transform: translateY(-1px); }
.btn-primary { background: linear-gradient(135deg, var(--brand-primary, #0a64ff), var(--brand-secondary, #6c5ce7)); color: white; }
.btn-secondary { background: rgba(10, 100, 255, 0.1); color: var(--brand-primary, #0a64ff); }
.table-surface { padding: 1.25rem; }
.table-meta { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; color: var(--text-muted, #64748b); }
.sensor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.state-box { text-align: center; padding: 2rem 1rem; color: var(--text-muted, #64748b); }
.state-error { color: #b42318; }
@media (max-width: 1024px) { .page-hero, .panel-controls, .table-meta { grid-template-columns: 1fr; flex-direction: column; } .hero-metrics { width: 100%; grid-template-columns: 1fr 1fr; } .panel-controls { grid-template-columns: 1fr; } .control-actions { align-items: stretch; } .btn-primary, .btn-secondary { width: 100%; } }
</style>