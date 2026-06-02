<template>
  <div class="page-shell validation-shell">
    <section class="page-hero surface">
      <div class="hero-copy">
        <span class="eyebrow">Fiscalización en tiempo real</span>
        <h1>Panel de Validación de Infracciones</h1>
        <p>
          Revisa, filtra y procesa infracciones pendientes con una experiencia clara para pruebas del frontend.
        </p>
      </div>

      <div class="hero-metrics">
        <article class="metric-card">
          <span>Pendientes</span>
          <strong>{{ totalInfractions }}</strong>
        </article>
        <article class="metric-card metric-highlight">
          <span>Página</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
        </article>
      </div>
    </section>

    <section class="surface panel-controls">
      <div class="control-group">
        <label for="search">Buscar por placa o ID</label>
        <input id="search" v-model="searchQuery" type="search" placeholder="Ej: ABC-123 o INF-001" />
      </div>

      <div class="control-group">
        <label for="status">Filtrar por estado</label>
        <select id="status" v-model="statusFilter">
          <option value="ALL">Todos</option>
          <option value="PENDING_VALIDATION">Pendientes</option>
          <option value="VALIDATED">Validadas</option>
          <option value="REJECTED">Descartadas</option>
        </select>
      </div>

      <div class="control-actions">
        <button class="btn-secondary" @click="resetFilters">Limpiar filtros</button>
        <button class="btn-primary" @click="fetchInfractions">Actualizar</button>
      </div>
    </section>

    <section class="surface table-surface">
      <div v-if="loading" class="state-box">Cargando infracciones...</div>
      <div v-else-if="errorMessage" class="state-box state-error">{{ errorMessage }}</div>
      <div v-else>
        <div class="table-meta">
          <p>Mostrando {{ paginatedInfractions.length }} de {{ visibleInfractions.length }} registros.</p>
          <p class="muted">Última actualización: {{ lastRefreshLabel }}</p>
        </div>

        <infraction-table
          v-if="paginatedInfractions.length"
          :infractions="paginatedInfractions"
          :processing-id="processingId"
          @validate="validate"
        />
        <div v-else class="state-box">No hay infracciones que coincidan con los filtros aplicados.</div>

        <div class="pagination" v-if="totalPages > 1">
          <button class="btn-secondary" :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <button class="btn-secondary" :disabled="currentPage === totalPages" @click="currentPage++">Siguiente</button>
        </div>
      </div>
    </section>

    <section class="surface activity-card">
      <div class="card-header">
        <h2>Última actividad</h2>
        <span>{{ lastRefreshLabel }}</span>
      </div>

      <div class="toast-list" v-if="toasts.length">
        <article v-for="toast in toasts" :key="toast.id" :class="['toast-item', toast.type]">
          <strong v-if="toast.title">{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </article>
      </div>

      <div v-else class="state-box subtle">
        Aún no hay notificaciones. Valida o descarta una infracción para ver el flujo completo.
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useInfractionsStore } from '../../application/infractions.store.js';
import { notify } from '../../../shared/infrastructure/notify.js';
import InfractionTable from '../components/infraction-table.vue';

const store = useInfractionsStore();

const visibleInfractions = ref([]);
const errorMessage = ref('');
const searchQuery = ref('');
const statusFilter = ref('ALL');
const currentPage = ref(1);
const pageSize = 5;
const processingId = ref('');
const toasts = ref([]);
const lastRefreshLabel = ref('Sin actualizaciones aún');

const totalInfractions = computed(() => visibleInfractions.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(visibleInfractions.value.length / pageSize)));
const paginatedInfractions = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return visibleInfractions.value.slice(start, start + pageSize);
});
const loading = computed(() => store.loading);

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
  refreshVisibleInfractions();
});

onMounted(async () => {
  await fetchInfractions();
});

const formatStatus = (status) => {
  const labels = {
    PENDING_VALIDATION: 'Pendiente',
    VALIDATED: 'Validada',
    REJECTED: 'Descartada'
  };
  return labels[status] || status || 'Sin estado';
};

const pushToast = (message, type = 'info', title = '') => {
  const toast = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, message, type, title };
  toasts.value.unshift(toast);
  toasts.value = toasts.value.slice(0, 4);
  if (typeof notify === 'function') notify(message, type, title);

  setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== toast.id);
  }, 4500);
};

const refreshVisibleInfractions = () => {
  const search = searchQuery.value.trim().toLowerCase();
  visibleInfractions.value = (store.infractions || []).filter((infraction) => {
    const matchesSearch = !search || infraction.id.toLowerCase().includes(search) || infraction.plate.toLowerCase().includes(search);
    const matchesStatus = statusFilter.value === 'ALL' || infraction.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
};

const fetchInfractions = async () => {
  errorMessage.value = '';
  await store.fetchInfractions();
  if (store.errors.length) {
    errorMessage.value = 'No fue posible cargar las infracciones desde el mock server.';
    pushToast('No se pudieron cargar las infracciones.', 'error', 'Error de carga');
  } else {
    store.infractions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    refreshVisibleInfractions();
    lastRefreshLabel.value = `Actualizado el ${new Date().toLocaleString()}`;
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'ALL';
  currentPage.value = 1;
  refreshVisibleInfractions();
  pushToast('Filtros restablecidos.', 'success', 'Panel listo');
};

const validate = async (id, status) => {
  processingId.value = id;
  try {
    const result = await store.processValidation(id, status);
    if (result.ticket) {
      pushToast(`Infracción ${id} validada. Ticket ${result.ticket.id} por S/. ${Number(result.ticket.amount).toFixed(2)}.`, 'success', 'Ticket generado');
    } else {
      pushToast(`Infracción ${id} actualizada a estado ${formatStatus(status)}.`, 'info', 'Actualización realizada');
    }
    await fetchInfractions();
  } catch (error) {
    console.error('Error validating infraction:', error);
    pushToast('Ocurrió un error al procesar la validación.', 'error', 'Operación fallida');
  } finally {
    processingId.value = '';
  }
};
</script>

<style scoped>
.validation-shell { padding-bottom: 2rem; }
.page-hero { display: flex; justify-content: space-between; gap: 1.5rem; align-items: stretch; margin-bottom: 1.5rem; padding: 1.5rem; }
.hero-copy { flex: 1; }
.eyebrow { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 999px; background: rgba(10, 100, 255, 0.12); color: #0a64ff; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.page-hero h1 { margin: 0.75rem 0 0.5rem; }
.page-hero p { max-width: 70ch; color: #64748b; line-height: 1.6; }
.hero-metrics { display: grid; grid-template-columns: repeat(2, minmax(140px, 1fr)); gap: 1rem; min-width: 300px; }
.metric-card { background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 20px; padding: 1rem 1.2rem; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
.metric-card span { display: block; color: #64748b; font-size: 0.9rem; }
.metric-card strong { display: block; margin-top: 0.35rem; font-size: 2rem; color: #0f172a; }
.metric-highlight { background: linear-gradient(135deg, rgba(10, 100, 255, 0.14), rgba(108, 92, 231, 0.14)); }
.surface { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 24px; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
.panel-controls { display: grid; grid-template-columns: 1.5fr 1fr auto; gap: 1rem; padding: 1.25rem; margin-bottom: 1.25rem; }
.control-group { display: flex; flex-direction: column; gap: 0.45rem; }
.control-group label { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
.control-group input, .control-group select { width: 100%; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 14px; padding: 0.9rem 1rem; font: inherit; background: rgba(255, 255, 255, 0.9); color: #0f172a; box-sizing: border-box; }
.control-actions { display: flex; gap: 0.75rem; align-items: end; flex-wrap: wrap; }
.btn-primary, .btn-secondary { border: none; border-radius: 14px; padding: 0.9rem 1rem; font: inherit; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
.btn-primary:hover, .btn-secondary:hover { transform: translateY(-1px); }
.btn-primary { background: linear-gradient(135deg, #0a64ff, #6c5ce7); color: white; }
.btn-secondary { background: rgba(10, 100, 255, 0.1); color: #0a64ff; }
.table-surface { padding: 1.25rem; }
.table-meta { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; color: #64748b; }
.state-box { text-align: center; padding: 2rem 1rem; color: #64748b; }
.state-error { color: #b42318; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; }
.activity-card { margin-top: 1.25rem; padding: 1.25rem; }
.card-header { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.card-header h2 { margin: 0; }
.card-header span { color: #64748b; font-size: 0.95rem; }
.toast-list { display: grid; gap: 0.75rem; }
.toast-item { padding: 1rem 1.1rem; border-radius: 16px; border: 1px solid transparent; background: rgba(255, 255, 255, 0.92); }
.toast-item strong { display: block; margin-bottom: 0.25rem; }
.toast-item.success { border-color: rgba(10, 167, 103, 0.25); color: #0a7f4f; }
.toast-item.error { border-color: rgba(244, 67, 54, 0.25); color: #b42318; }
.toast-item.info { border-color: rgba(10, 100, 255, 0.2); color: #0f172a; }
.subtle { background: rgba(10, 100, 255, 0.04); border-radius: 18px; }
@media (max-width: 1024px) { .page-hero, .panel-controls, .card-header, .table-meta { grid-template-columns: 1fr; flex-direction: column; } .hero-metrics { width: 100%; grid-template-columns: 1fr 1fr; } .panel-controls { grid-template-columns: 1fr; } .control-actions { align-items: stretch; } .btn-primary, .btn-secondary { width: 100%; } }
</style>