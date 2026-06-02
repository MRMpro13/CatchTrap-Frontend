<template>
  <article class="sensor-card">
    <div class="sensor-card__header">
      <h3>{{ sensor.id }}</h3>
      <span :class="['status-pill', sensor.status.toLowerCase()]">{{ sensor.status }}</span>
    </div>

    <div class="sensor-card__body">
      <p><strong>{{ $t('sensorCard.location') }}:</strong> {{ sensor.location }}</p>
      <p><strong>{{ $t('sensorCard.lastPing') }}:</strong> {{ formatDate(sensor.lastPing) }}</p>
      <p><strong>{{ $t('sensorCard.battery') }}:</strong>
        <span :class="{'text-danger': sensor.battery < 20}">{{ sensor.battery }}%</span>
      </p>
      <p><strong>{{ $t('sensorCard.firmware') }}:</strong> v{{ sensor.firmware }}</p>
    </div>

    <div class="sensor-card__footer">
      <button class="btn-action" @click="handleAction('reboot')" :disabled="sensor.status === 'INACTIVE'">
        {{ $t('sensorCard.updateNode') }}
      </button>
    </div>
  </article>
</template>

<script setup>


const props = defineProps({
  sensor: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-ping']);

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

const handleAction = () => {
  emit('update-ping', props.sensor.id);
};
</script>

<style scoped>
.sensor-card { border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-radius: 20px; padding: 1.25rem; background: rgba(255,255,255,0.95); box-shadow: var(--shadow-soft, 0 18px 50px rgba(15, 23, 42, 0.08)); transition: transform 0.2s ease; display: flex; flex-direction: column; }
.sensor-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md, 0 22px 60px rgba(15, 23, 42, 0.12)); }
.sensor-card__header { display: flex; justify-content: space-between; gap: 1rem; align-items: start; margin-bottom: 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 0.75rem; }
.sensor-card h3 { margin: 0; font-size: 1.2rem; }
.sensor-card__body p { margin: 0.4rem 0; color: var(--text-muted, #64748b); font-size: 0.95rem; }
.sensor-card__body strong { color: var(--text-strong, #0f172a); }
.text-danger { color: #ef4444; font-weight: bold; }
.status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.35rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; }
.operative { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.maintenance { background: rgba(255, 183, 77, 0.18); color: #b36a00; }
.inactive { background: rgba(244, 67, 54, 0.12); color: #c62828; }

.sensor-card__footer { margin-top: auto; padding-top: 1.25rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn-action { flex: 1; border: none; border-radius: 12px; padding: 0.65rem; font: inherit; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: opacity 0.2s ease; background: rgba(10, 100, 255, 0.1); color: var(--brand-primary, #0a64ff); }
.btn-action:hover { opacity: 0.8; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
</style>