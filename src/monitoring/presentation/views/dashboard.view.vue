<template>
  <div class="page-shell monitoring-shell">
    <section class="page-hero">
      <div>
        <span class="eyebrow">{{ $t('monitoring.eyebrow') }}</span>
        <h1>{{ $t('monitoring.title') }}</h1>
      </div>

      <div class="hero-metrics">
        <article class="metric-card">
          <span>{{ $t('monitoring.totalSensors') }}</span>
          <strong>{{ sensors.length }}</strong>
        </article>
        <article class="metric-card metric-highlight">
          <span>{{ $t('monitoring.operative') }}</span>
          <strong>{{ operativeCount }}</strong>
        </article>
      </div>
    </section>

    <section class="surface panel-controls">
      <div class="control-group">
        <label for="sensor-search">{{ $t('monitoring.searchLabel') }}</label>
        <input id="sensor-search" v-model="searchQuery" type="search" :placeholder="$t('monitoring.searchPlaceholder')" />
      </div>
      <div class="control-group">
        <label for="sensor-status">{{ $t('monitoring.statusLabel') }}</label>
        <select id="sensor-status" v-model="statusFilter">
          <option value="ALL">{{ $t('monitoring.statusAll') }}</option>
          <option value="OPERATIVE">{{ $t('monitoring.statusOperative') }}</option>
          <option value="MAINTENANCE">{{ $t('monitoring.statusMaintenance') }}</option>
          <option value="INACTIVE">{{ $t('monitoring.statusInactive') }}</option>
        </select>
      </div>
      <div class="control-actions">
        <button class="btn-secondary" @click="resetFilters">{{ $t('monitoring.clearFilters') }}</button>
        <button class="btn-map" @click="showSensorMap = true">{{ $t('monitoring.mapButton') }}</button>
        <button class="btn-firmware" @click="checkFirmwareUpdate">{{ $t('monitoring.firmwareButton') }}</button>
      </div>
    </section>

    <section class="surface table-surface">
      <div v-if="loading" class="state-box">{{ $t('monitoring.loading') }}</div>
      <div v-else-if="errors.length" class="state-box state-error">{{ $t('monitoring.loadError') }}</div>
      <div v-else>
        <div class="table-meta">
          <p>{{ $t('monitoring.showing', { count: filteredSensors.length }) }}</p>
          <p>{{ $t('monitoring.lastUpdate', { date: lastRefreshLabel }) }}</p>
        </div>

        <div class="sensor-grid" v-if="filteredSensors.length">
          <sensor-card
            v-for="sensor in filteredSensors"
            :key="sensor.id"
            :sensor="sensor"
            @update-ping="onUpdatePing"
          />
        </div>

        <div v-else class="state-box">{{ $t('monitoring.noResults') }}</div>
      </div>
    </section>

    <ConfirmDialog
      v-model:visible="showFirmwareDialog"
      :title="$t('monitoring.firmwareDialogTitle')"
      :message="firmwareDialogMessage"
      :confirm-text="$t('monitoring.firmwareConfirmText')"
      :cancel-text="$t('monitoring.firmwareCancelText')"
      @confirm="onFirmwareConfirm"
    />

    <SensorMapDialog
      v-model:visible="showSensorMap"
      :sensors="sensors"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSensorMonitoringStore } from '../../application/sensor-monitoring.store.js';
import { SensorMonitoringApi } from '../../infrastructure/sensor-monitoring-api.js';
import SensorCard from '../components/sensor-card.vue';
import SensorMapDialog from '../components/sensor-map-dialog.vue';
import ConfirmDialog from '../../../shared/presentation/components/confirm-dialog.vue';
import { notify } from '../../../shared/infrastructure/notify.js';

const store = useSensorMonitoringStore();
const { t } = useI18n();

const searchQuery = ref('');
const statusFilter = ref('ALL');
const lastRefreshLabel = ref(t('monitoring.noUpdate'));
const showSensorMap = ref(false);
const showFirmwareDialog = ref(false);
const firmwareDialogMessage = ref('');
const pendingFirmwareVersion = ref('');
const pendingOutdatedSensors = ref([]);

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

const sensorMonitoringApi = new SensorMonitoringApi();

const checkFirmwareUpdate = async () => {
  try {
    const response = await sensorMonitoringApi.getLatestFirmwareVersion();
    const latestVersion = response.data[0]?.version;
    const outdatedSensors = sensors.value.filter(s => compareVersions(s.firmware, latestVersion) < 0);

    if (outdatedSensors.length === 0) {
      notify(t('monitoring.firmwareAllUpToDate'), 'success', t('monitoring.firmwareNotifyTitle'));
      return;
    }

    pendingFirmwareVersion.value = latestVersion;
    pendingOutdatedSensors.value = outdatedSensors;
    firmwareDialogMessage.value = t('monitoring.firmwareDialogMessage', { count: outdatedSensors.length, version: latestVersion });
    showFirmwareDialog.value = true;
  } catch {
    notify(t('monitoring.firmwareCheckError'), 'error', t('monitoring.firmwareNotifyTitle'));
  }
};

const onFirmwareConfirm = async () => {
  const version = pendingFirmwareVersion.value;
  const outdated = pendingOutdatedSensors.value;
  const total = outdated.length;
  let updated = 0;

  for (const sensor of outdated) {
    try {
      await sensorMonitoringApi.patchSensor(sensor.id, { ...sensor, firmware: version });
      updated++;
    } catch {
      notify(t('monitoring.firmwareUpdateError', { id: sensor.id }), 'error', t('monitoring.firmwareNotifyTitle'));
    }
  }

  pendingFirmwareVersion.value = '';
  pendingOutdatedSensors.value = [];
  await store.fetchSensors();
  notify(t('monitoring.firmwareUpdateResult', { updated, total, version }), updated === total ? 'success' : 'info', t('monitoring.firmwareNotifyTitle'));
};

const onUpdatePing = async (sensorId) => {
  const sensor = sensors.value.find(s => s.id === sensorId);
  if (!sensor) return;

  try {
    await sensorMonitoringApi.patchSensor(sensorId, { ...sensor, lastPing: new Date().toISOString() });
    await store.fetchSensors();
    notify(t('monitoring.nodeUpdated', { id: sensorId }), 'success', t('monitoring.updateNodeNotifyTitle'));
  } catch {
    notify(t('monitoring.nodeUpdateError', { id: sensorId }), 'error', t('monitoring.updateNodeNotifyTitle'));
  }
};

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

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
.btn-primary, .btn-secondary, .btn-firmware, .btn-map { border: none; border-radius: 14px; padding: 0.9rem 1rem; font: inherit; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
.btn-primary:hover, .btn-secondary:hover, .btn-firmware:hover, .btn-map:hover { transform: translateY(-1px); }
.btn-primary { background: linear-gradient(135deg, var(--brand-primary, #0a64ff), var(--brand-secondary, #6c5ce7)); color: white; }
.btn-secondary { background: rgba(10, 100, 255, 0.1); color: var(--brand-primary, #0a64ff); }
.btn-firmware { background: linear-gradient(135deg, #0a9b61, #059669); color: white; }
.btn-map { background: linear-gradient(135deg, #0a64ff, #6c5ce7); color: white; }
.table-surface { padding: 1.25rem; }
.table-meta { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; color: var(--text-muted, #64748b); }
.sensor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.state-box { text-align: center; padding: 2rem 1rem; color: var(--text-muted, #64748b); }
.state-error { color: #b42318; }
@media (max-width: 1024px) { .page-hero, .panel-controls, .table-meta { grid-template-columns: 1fr; flex-direction: column; } .hero-metrics { width: 100%; grid-template-columns: 1fr 1fr; } .panel-controls { grid-template-columns: 1fr; } .control-actions { align-items: stretch; } .btn-primary, .btn-secondary { width: 100%; } }
</style>