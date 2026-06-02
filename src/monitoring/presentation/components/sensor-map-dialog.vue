<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="onClose">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3>Ubicación de Sensores</h3>
          </div>
          <div class="modal-body">
            <div ref="mapContainer" class="map-container"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-close" @click="onClose">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const props = defineProps({
  visible: { type: Boolean, default: false },
  sensors: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visible', 'close']);

const mapContainer = ref(null);
let mapInstance = null;

const onClose = () => {
  emit('close');
  emit('update:visible', false);
};

watch(() => props.visible, async (show) => {
  if (show && props.sensors.length) {
    await nextTick();
    initMap();
  } else if (!show) {
    destroyMap();
  }
});

function getStatusColor(status) {
  switch (status) {
    case 'OPERATIVE': return '#0a9b61';
    case 'MAINTENANCE': return '#b36a00';
    case 'INACTIVE': return '#c62828';
    default: return '#0a64ff';
  }
}

function initMap() {
  destroyMap();

  const valid = props.sensors.filter(s => s.latitude != null && s.longitude != null);
  if (!valid.length) return;

  const bounds = L.latLngBounds(valid.map(s => [s.latitude, s.longitude]));
  mapInstance = L.map(mapContainer.value).fitBounds(bounds, { padding: [40, 40] });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  valid.forEach(s => {
    const color = getStatusColor(s.status);
    const icon = L.divIcon({
      className: 'sensor-marker',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    L.marker([s.latitude, s.longitude], { icon })
      .addTo(mapInstance)
      .bindPopup(`
        <strong>${s.id}</strong><br/>
        ${s.location}<br/>
        <span style="color:${color}">${s.status}</span> &middot; ${s.battery}% &middot; v${s.firmware}
      `);
  });

  setTimeout(() => mapInstance?.invalidateSize(), 250);
}

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
}

onBeforeUnmount(destroyMap);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 800px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 0;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(10, 100, 255, 0.1);
  color: var(--brand-primary, #0a64ff);
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-strong, #0f172a);
}

.modal-body {
  padding: 1rem 1rem 0;
}

.map-container {
  width: 100%;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
}

.btn-close {
  min-width: 120px;
  border: none;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  background: rgba(10, 100, 255, 0.1);
  color: var(--brand-primary, #0a64ff);
}

.btn-close:hover {
  transform: translateY(-1px);
}

.btn-close:active {
  transform: translateY(0);
}

.modal-enter-active {
  transition: opacity 0.25s ease;
}

.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-leave-active .modal-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}

.modal-leave-to .modal-card {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}
</style>

<style>
.sensor-marker {
  background: transparent !important;
  border: none !important;
}

.map-container .leaflet-popup-content-wrapper {
  border-radius: 12px;
  font-family: inherit;
}

.map-container .leaflet-popup-content {
  margin: 0.6rem 0.8rem;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
