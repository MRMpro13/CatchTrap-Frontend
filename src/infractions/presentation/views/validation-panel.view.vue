<template>
  <div class="page-shell validation-shell">
    <section class="page-hero surface">
      <div class="hero-copy">
        <span class="eyebrow">{{ $t('infractions.eyebrow') }}</span>
        <h1>{{ $t('infractions.title') }}</h1>
        <p>{{ $t('infractions.description') }}</p>
      </div>

      <div class="hero-metrics">
        <article class="metric-card">
          <span>{{ $t('infractions.pending') }}</span>
          <strong>{{ totalInfractions }}</strong>
        </article>
        <article class="metric-card metric-highlight">
          <span>{{ $t('infractions.page') }}</span>
          <strong>{{ currentPage }} / {{ totalPages }}</strong>
        </article>
      </div>
    </section>

    <section class="surface panel-controls">
      <div class="control-group">
        <label for="search">{{ $t('infractions.searchLabel') }}</label>
        <input id="search" v-model="searchQuery" type="search" :placeholder="$t('infractions.searchPlaceholder')" />
      </div>

      <div class="control-group">
        <label for="severity">{{ $t('infractions.severityLabel') }}</label>
        <select id="severity" v-model="severityFilter">
          <option value="ALL">{{ $t('infractions.severityAll') }}</option>
          <option value="medium">{{ $t('infractions.severityMedium') }}</option>
          <option value="high">{{ $t('infractions.severityHigh') }}</option>
          <option value="critical">{{ $t('infractions.severityCritical') }}</option>
        </select>
      </div>

      <div class="control-actions">
        <button class="btn-secondary" @click="resetFilters">{{ $t('infractions.clearFilters') }}</button>
        <button class="btn-primary" @click="fetchInfractions">{{ $t('infractions.refresh') }}</button>
      </div>
    </section>

    <section class="surface table-surface">
      <div v-if="loading" class="state-box">{{ $t('infractions.loading') }}</div>
      <div v-else-if="errorMessage" class="state-box state-error">{{ errorMessage }}</div>
      <div v-else>
        <div class="table-meta">
          <p>{{ $t('infractions.showing', { count: paginatedInfractions.length, total: visibleInfractions.length }) }}</p>
          <p class="muted">{{ $t('infractions.lastUpdate', { date: lastRefreshLabel }) }}</p>
        </div>

        <infraction-table
          v-if="paginatedInfractions.length"
          :infractions="paginatedInfractions"
          :processing-id="processingId"
          @validate="validate"
        />
        <div v-else class="state-box">{{ $t('infractions.noResults') }}</div>

        <div class="pagination" v-if="totalPages > 1">
          <button class="btn-secondary" :disabled="currentPage === 1" @click="currentPage--">{{ $t('infractions.previous') }}</button>
          <span>{{ $t('infractions.pageOf', { current: currentPage, total: totalPages }) }}</span>
          <button class="btn-secondary" :disabled="currentPage === totalPages" @click="currentPage++">{{ $t('infractions.next') }}</button>
        </div>
      </div>
    </section>

    <section class="surface activity-card">
      <div class="card-header">
        <h2>{{ $t('infractions.activityTitle') }}</h2>
      </div>

      <div class="activity-controls">
        <div class="control-group">
          <label for="activity-search">{{ $t('infractions.activitySearchLabel') }}</label>
          <input id="activity-search" v-model="activitySearch" type="search" :placeholder="$t('infractions.searchPlaceholder')" />
        </div>
        <div class="control-group">
          <label for="activity-status">{{ $t('infractions.activityStatusLabel') }}</label>
          <select id="activity-status" v-model="activityStatusFilter">
            <option value="ALL">{{ $t('infractions.activityAll') }}</option>
            <option value="VALIDATED">{{ $t('infractions.activityValidated') }}</option>
            <option value="REJECTED">{{ $t('infractions.activityRejected') }}</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper" v-if="filteredActivity.length">
        <table class="activity-table">
          <thead>
            <tr>
              <th>{{ $t('infractions.tableId') }}</th>
              <th>{{ $t('infractions.tablePlate') }}</th>
              <th>{{ $t('infractions.tableSpeed') }}</th>
              <th>{{ $t('infractions.tableLimit') }}</th>
              <th>{{ $t('infractions.tableExcess') }}</th>
              <th>{{ $t('infractions.tableDateTime') }}</th>
              <th>{{ $t('infractions.tableStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredActivity" :key="item.id">
              <td><strong>{{ item.id }}</strong></td>
              <td><span class="plate-box">{{ item.plate }}</span></td>
              <td>{{ item.speed }} km/h</td>
              <td>{{ item.limit }} km/h</td>
              <td><span :class="['badge', getSeverityClass(item)]">{{ getExcess(item) }} km/h</span></td>
              <td>{{ formatDate(item.timestamp) }}</td>
              <td>
                <span :class="['status-pill', item.status.toLowerCase()]">
                  {{ formatStatus(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="state-box subtle">
        {{ $t('infractions.noActivity') }}
      </div>
    </section>

    <section v-if="toasts.length" class="surface toast-card">
      <div class="toast-list">
        <article v-for="toast in toasts" :key="toast.id" :class="['toast-item', toast.type]">
          <strong v-if="toast.title">{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInfractionsStore } from '../../application/infractions.store.js';
import { notify } from '../../../shared/infrastructure/notify.js';
import InfractionTable from '../components/infraction-table.vue';

const store = useInfractionsStore();
const { t } = useI18n();

const visibleInfractions = ref([]);
const errorMessage = ref('');
const searchQuery = ref('');
const severityFilter = ref('ALL');
const activitySearch = ref('');
const activityStatusFilter = ref('ALL');
const currentPage = ref(1);
const pageSize = 5;
const processingId = ref('');
const toasts = ref([]);
const activityLog = ref([]);
const lastRefreshLabel = ref(t('infractions.noUpdate'));

const totalInfractions = computed(() => visibleInfractions.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(visibleInfractions.value.length / pageSize)));
const paginatedInfractions = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return visibleInfractions.value.slice(start, start + pageSize);
});
const loading = computed(() => store.loading);

watch([searchQuery, severityFilter], () => {
  currentPage.value = 1;
  refreshVisibleInfractions();
});

onMounted(async () => {
  await fetchInfractions();
});

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

const formatStatus = (status) => {
  const labels = {
    PENDING_VALIDATION: t('infractions.statusPending'),
    VALIDATED: t('infractions.statusValidated'),
    REJECTED: t('infractions.statusRejected')
  };
  return labels[status] || status || t('infractions.statusUnknown');
};

const getExcess = (infraction) => Math.max(0, (infraction.speed || 0) - (infraction.limit || 0));

const getSeverityClass = (infraction) => {
  const excess = getExcess(infraction);
  if (excess >= 25) return 'critical';
  if (excess >= 10) return 'high';
  if (excess > 0) return 'medium';
  return 'low';
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
    const matchesStatus = infraction.status === 'PENDING_VALIDATION';
    const matchesSeverity = severityFilter.value === 'ALL' || getSeverityClass(infraction) === severityFilter.value;
    return matchesSearch && matchesStatus && matchesSeverity;
  });
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
};

const filteredActivity = computed(() => {
  const search = activitySearch.value.trim().toLowerCase();
  return activityLog.value.filter((item) => {
    const matchesSearch = !search || item.id.toLowerCase().includes(search) || item.plate.toLowerCase().includes(search);
    const matchesStatus = activityStatusFilter.value === 'ALL' || item.status === activityStatusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const fetchInfractions = async () => {
  errorMessage.value = '';
  await store.fetchInfractions();
  if (store.errors.length) {
    errorMessage.value = t('infractions.fetchError');
    pushToast(t('infractions.fetchErrorToast'), 'error', t('infractions.loadErrorTitle'));
  } else {
    store.infractions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    refreshVisibleInfractions();
    loadActivityLog();
    lastRefreshLabel.value = t('infractions.updatedAt', { date: new Date().toLocaleString() });
  }
};

const loadActivityLog = () => {
  const processed = store.infractions.filter(i => i.status !== 'PENDING_VALIDATION');
  activityLog.value = processed.map(i => ({ ...i }));
};

const resetFilters = () => {
  searchQuery.value = '';
  severityFilter.value = 'ALL';
  currentPage.value = 1;
  refreshVisibleInfractions();
  pushToast(t('infractions.filtersReset'), 'success', t('infractions.panelReady'));
};

const validate = async (id, status) => {
  processingId.value = id;
  try {
    const result = await store.processValidation(id, status);
    const infraction = store.infractions.find(i => i.id === id);
    const label = formatStatus(status);
    const details = infraction
      ? t('infractions.validationDetail', { id, plate: infraction.plate, speed: infraction.speed })
      : `${t('infractions.tableId')} ${id}.`;

    if (infraction) {
      activityLog.value.unshift({ ...infraction, status });
    }

    if (result.ticket) {
      pushToast(t('infractions.validatedTicket', { id, ticketId: result.ticket.id, amount: Number(result.ticket.amount).toFixed(2) }), 'success', t('infractions.ticketGenerated'));
    } else {
      pushToast(t('infractions.statusUpdated', { id, status: label }), 'info', t('infractions.updateDone'));
    }
    await fetchInfractions();
  } catch (error) {
    console.error('Error validating infraction:', error);
    pushToast(t('infractions.validationError'), 'error', t('infractions.operationFailed'));
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
.activity-controls { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.activity-controls .control-group { display: flex; flex-direction: column; gap: 0.35rem; min-width: 200px; flex: 1; }
.activity-controls .control-group label { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
.activity-controls .control-group input, .activity-controls .control-group select { width: 100%; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 12px; padding: 0.65rem 0.85rem; font: inherit; font-size: 0.9rem; background: rgba(255, 255, 255, 0.9); color: #0f172a; box-sizing: border-box; }
.activity-card .table-wrapper { overflow: auto; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 18px; }
.activity-card .activity-table { width: 100%; border-collapse: collapse; min-width: 850px; }
.activity-card .activity-table th, .activity-card .activity-table td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.28); text-align: left; vertical-align: middle; }
.activity-card .activity-table th { background: rgba(10, 100, 255, 0.05); color: #0f172a; font-size: 0.9rem; }
.activity-card .activity-table tr:last-child td { border-bottom: none; }
.activity-card .plate-box { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.25rem 0.5rem; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 1rem; display: inline-block; letter-spacing: 1px; color: #1e293b; }
.activity-card .badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; }
.activity-card .badge.low { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.activity-card .badge.medium { background: rgba(255, 183, 77, 0.18); color: #b36a00; }
.activity-card .badge.high { background: rgba(251, 146, 60, 0.14); color: #c2410c; }
.activity-card .badge.critical { background: rgba(244, 67, 54, 0.14); color: #c62828; }
.activity-card .status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.3rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; }
.activity-card .status-pill.validated { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.activity-card .status-pill.rejected { background: rgba(244, 67, 54, 0.12); color: #c62828; }

.toast-card { margin-top: 1rem; padding: 1rem 1.25rem; }
.toast-list { display: grid; gap: 0.6rem; }
.toast-item { padding: 0.85rem 1rem; border-radius: 16px; border: 1px solid transparent; background: rgba(255, 255, 255, 0.92); }
.toast-item strong { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; }
.toast-item p { margin: 0; font-size: 0.9rem; }
.toast-item.success { border-color: rgba(10, 167, 103, 0.25); color: #0a7f4f; }
.toast-item.error { border-color: rgba(244, 67, 54, 0.25); color: #b42318; }
.toast-item.info { border-color: rgba(10, 100, 255, 0.2); color: #0f172a; }

.card-header { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.card-header h2 { margin: 0; }
.subtle { background: rgba(10, 100, 255, 0.04); border-radius: 18px; }
@media (max-width: 1024px) { .page-hero, .panel-controls, .card-header, .table-meta { grid-template-columns: 1fr; flex-direction: column; } .hero-metrics { width: 100%; grid-template-columns: 1fr 1fr; } .panel-controls { grid-template-columns: 1fr; } .control-actions { align-items: stretch; } .btn-primary, .btn-secondary { width: 100%; } }
</style>