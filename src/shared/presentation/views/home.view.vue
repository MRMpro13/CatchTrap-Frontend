<template>
  <div class="page-shell home-shell">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="eyebrow">Dashboard Global</span>
        <h1>Resumen General CatchTrap</h1>
        <p>
          Vista de alto nivel del estado del sistema inteligente de detección y control de tráfico.
          Desde aquí puedes monitorear rápidamente el pulso de la ciudad.
        </p>

        <div class="hero-actions">
          <router-link to="/monitoring" class="btn-primary">Ir a Monitoreo (Detalle)</router-link>
          <router-link to="/infractions" class="btn-secondary">Validar Infracciones</router-link>
        </div>
      </div>

      <div class="hero-visual">
        <div class="visual-panel">
          <span>Salud de la Red</span>
          <strong>{{ operativeSensors }} / {{ totalSensors }} Sensores</strong>
          <p>Operando en tiempo real.</p>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: sensorHealthPercent + '%' }"></div>
          </div>
        </div>

        <div class="mini-grid">
          <article>
            <span>Infracciones Totales</span>
            <strong>{{ totalInfractions }}</strong>
            <router-link to="/infractions" class="shortcut-link">Revisar &rarr;</router-link>
          </article>
          <article>
            <span>Pendientes Validación</span>
            <strong class="text-warning">{{ pendingInfractions }}</strong>
          </article>
          <article>
            <span>Reportes Generados</span>
            <strong>{{ totalReports }}</strong>
            <router-link to="/analytics" class="shortcut-link">Ver analítica &rarr;</router-link>
          </article>
          <article>
            <span>Portal Ciudadano</span>
            <strong>Activo</strong>
            <router-link to="/citizen" class="shortcut-link">Consultar multas &rarr;</router-link>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useSensorMonitoringStore } from '../../../monitoring/application/sensor-monitoring.store';
import { useInfractionsStore } from '../../../infractions/application/infractions.store';
import { useAnalyticsStore } from '../../../analytics/application/analytics.store';

const sensorStore = useSensorMonitoringStore();
const infractionsStore = useInfractionsStore();
const analyticsStore = useAnalyticsStore();

onMounted(async () => {
  // Load data for the global dashboard
  await Promise.all([
    sensorStore.fetchSensors(),
    infractionsStore.fetchInfractions(),
    analyticsStore.fetchReports()
  ]);
});

// Metrics
const totalSensors = computed(() => sensorStore.sensors.length);
const operativeSensors = computed(() => sensorStore.operativeCount);
const sensorHealthPercent = computed(() => {
  if (totalSensors.value === 0) return 0;
  return (operativeSensors.value / totalSensors.value) * 100;
});

const totalInfractions = computed(() => infractionsStore.infractions.length);
const pendingInfractions = computed(() => {
  return infractionsStore.infractions.filter(i => i.status === 'PENDING_VALIDATION').length;
});

const totalReports = computed(() => analyticsStore.reports.length);
</script>

<style scoped>
.home-shell {
  display: grid;
  gap: 1.25rem;
  padding-bottom: 2rem;
}

.hero-card {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: linear-gradient(135deg, rgba(255,255,255,0.92), rgba(244,248,255,0.9));
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(10, 100, 255, 0.12);
  color: var(--brand-primary, #0a64ff);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0.85rem 0 0.75rem;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
}

.hero-copy p {
  color: var(--text-muted, #64748b);
  line-height: 1.7;
  max-width: 65ch;
  font-size: 1.1rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.15rem;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand-primary, #0a64ff), var(--brand-secondary, #6c5ce7));
  color: white;
  box-shadow: 0 16px 28px rgba(10, 100, 255, 0.2);
}

.btn-secondary {
  background: rgba(10, 100, 255, 0.1);
  color: var(--brand-primary, #0a64ff);
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
}

.hero-visual {
  display: grid;
  gap: 1rem;
}

.visual-panel,
.mini-grid article {
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.visual-panel {
  padding: 1.5rem;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #10b981);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.visual-panel span,
.mini-grid span {
  display: block;
  color: var(--text-muted, #64748b);
  font-size: 0.9rem;
}

.visual-panel strong,
.mini-grid strong {
  display: block;
  margin-top: 0.35rem;
  color: var(--text-strong, #0f172a);
  font-size: 1.5rem;
}

.text-warning {
  color: #f59e0b !important;
}

.visual-panel p {
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.mini-grid article {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.shortcut-link {
  margin-top: auto;
  padding-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--brand-primary, #0a64ff);
  text-decoration: none;
  font-weight: 700;
}

.shortcut-link:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .hero-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mini-grid {
    grid-template-columns: 1fr;
  }
}
</style>