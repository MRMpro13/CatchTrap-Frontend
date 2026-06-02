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
            <div class="action-group">
              <button class="btn-evidence" @click="openMap(infraction)">
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

    <MapDialog
      v-model:visible="showMap"
      :latitude="selectedLat"
      :longitude="selectedLng"
      :plate="selectedPlate"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MapDialog from './map-dialog.vue';

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

const showMap = ref(false);
const selectedLat = ref(null);
const selectedLng = ref(null);
const selectedPlate = ref('');

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

const getExcess = (infraction) => Math.max(0, (infraction.speed || 0) - (infraction.limit || 0));

const getSeverityClass = (infraction) => {
  const excess = getExcess(infraction);
  if (excess >= 25) return 'critical';
  if (excess >= 10) return 'high';
  if (excess > 0) return 'medium';
  return 'low';
};

const openMap = (infraction) => {
  selectedLat.value = infraction.latitude;
  selectedLng.value = infraction.longitude;
  selectedPlate.value = infraction.plate;
  showMap.value = true;
};
</script>

<style scoped>
.table-wrapper { overflow: auto; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 18px; }
.infractions-table { width: 100%; border-collapse: collapse; min-width: 950px; }
.infractions-table th, .infractions-table td { padding: 0.95rem 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.28); text-align: left; vertical-align: middle; }
.infractions-table th { background: rgba(10, 100, 255, 0.05); color: #0f172a; font-size: 0.9rem; }
.infractions-table tr:last-child td { border-bottom: none; }
.plate-box { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.35rem 0.6rem; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 1.1rem; display: inline-block; letter-spacing: 1px; color: #1e293b; }
.action-group { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
.btn-validate, .btn-reject, .btn-evidence { border: none; border-radius: 14px; padding: 0.75rem 0.95rem; font: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
.btn-validate:hover, .btn-reject:hover, .btn-evidence:hover { transform: translateY(-1px); }
.btn-evidence { background: rgba(148, 163, 184, 0.2); color: #475569; }
.btn-validate { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.btn-reject { background: rgba(244, 67, 54, 0.12); color: #d43c32; }
.btn-validate:disabled, .btn-reject:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.35rem 0.7rem; border-radius: 999px; font-size: 0.85rem; font-weight: 700; }
.badge.low { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.badge.medium { background: rgba(255, 183, 77, 0.18); color: #b36a00; }
.badge.high { background: rgba(251, 146, 60, 0.14); color: #c2410c; }
.badge.critical { background: rgba(244, 67, 54, 0.14); color: #c62828; }
</style>
