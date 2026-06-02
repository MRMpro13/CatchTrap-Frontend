<template>
  <div class="table-wrapper" v-if="infractions.length">
    <table class="infractions-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Placa</th>
          <th>Velocidad</th>
          <th>Límite</th>
          <th>Exceso</th>
          <th>Fecha/Hora</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="infraction in infractions" :key="infraction.id">
          <td><strong>{{ infraction.id }}</strong></td>
          <td>
            <div class="plate-box">{{ infraction.plate }}</div>
          </td>
          <td>{{ infraction.speed }} km/h</td>
          <td>{{ infraction.limit }} km/h</td>
          <td><span :class="['badge', getSeverityClass(infraction)]">{{ getExcess(infraction) }} km/h</span></td>
          <td>{{ formatDate(infraction.timestamp) }}</td>
          <td>
            <span :class="['status-pill', (infraction.status || '').toLowerCase()]">
              {{ formatStatus(infraction.status) }}
            </span>
          </td>
          <td>
            <div class="action-group">
              <button class="btn-evidence" @click="showEvidence(infraction)">
                Evidencia
              </button>
              <button class="btn-validate" :disabled="processingId === infraction.id" @click="$emit('validate', infraction.id, 'VALIDATED')">
                {{ processingId === infraction.id ? 'Procesando...' : 'Validar' }}
              </button>
              <button class="btn-reject" :disabled="processingId === infraction.id" @click="$emit('validate', infraction.id, 'REJECTED')">
                Descartar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { notify } from '../../../shared/infrastructure/notify.js';

defineProps({
  infractions: {
    type: Array,
    required: true
  },
  processingId: {
    type: String,
    default: ''
  }
});

defineEmits(['validate']);

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

const formatStatus = (status) => {
  const labels = {
    PENDING_VALIDATION: 'Pendiente',
    VALIDATED: 'Validada',
    REJECTED: 'Descartada'
  };
  return labels[status] || status || 'Sin estado';
};

const getExcess = (infraction) => Math.max(0, (infraction.speed || 0) - (infraction.limit || 0));

const getSeverityClass = (infraction) => {
  const excess = getExcess(infraction);
  if (excess >= 25) return 'critical';
  if (excess >= 10) return 'high';
  if (excess > 0) return 'medium';
  return 'low';
};

const showEvidence = (infraction) => {
  notify(`Mostrando telemetría y foto del vehículo ${infraction.plate} capturado a ${infraction.speed}km/h.`, 'info', 'Evidencia Fotográfica');
};
</script>

<style scoped>
.table-wrapper { overflow: auto; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 18px; }
.infractions-table { width: 100%; border-collapse: collapse; min-width: 1050px; }
.infractions-table th, .infractions-table td { padding: 0.95rem 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.28); text-align: left; vertical-align: middle; }
.infractions-table th { background: rgba(10, 100, 255, 0.05); color: #0f172a; font-size: 0.9rem; }
.infractions-table tr:last-child td { border-bottom: none; }
.plate-box { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.35rem 0.6rem; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 1.1rem; display: inline-block; letter-spacing: 1px; color: #1e293b; }
.action-group { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: stretch; }
.btn-validate, .btn-reject, .btn-evidence { border: none; border-radius: 14px; padding: 0.75rem 0.95rem; font: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
.btn-validate:hover, .btn-reject:hover, .btn-evidence:hover { transform: translateY(-1px); }
.btn-evidence { background: rgba(148, 163, 184, 0.2); color: #475569; }
.btn-validate { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.btn-reject { background: rgba(244, 67, 54, 0.12); color: #d43c32; }
.btn-validate:disabled, .btn-reject:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.badge, .status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.35rem 0.7rem; border-radius: 999px; font-size: 0.85rem; font-weight: 700; }
.badge.low { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.badge.medium { background: rgba(255, 183, 77, 0.18); color: #b36a00; }
.badge.high, .badge.critical { background: rgba(244, 67, 54, 0.14); color: #c62828; }
.status-pill.pending_validation { background: rgba(10, 100, 255, 0.12); color: #0a64ff; }
.status-pill.validated { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.status-pill.rejected { background: rgba(244, 67, 54, 0.12); color: #c62828; }
</style>