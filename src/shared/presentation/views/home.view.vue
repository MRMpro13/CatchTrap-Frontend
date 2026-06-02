<template>
  <div class="page-shell home-shell">
    <section class="hero-strip">
      <div class="hero-copy">
        <span class="eyebrow">{{ $t('home.eyebrow') }}</span>
        <h1>{{ $t('home.title') }}</h1>
      </div>
      <div class="hero-actions">
        <router-link to="/monitoring" class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          {{ $t('home.monitoring') }}
        </router-link>
        <router-link to="/infractions" class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          {{ $t('home.infractions') }}
        </router-link>
        <router-link to="/analytics" class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
          {{ $t('home.reports') }}
        </router-link>
      </div>
    </section>

    <section class="kpi-row">
      <article class="kpi-card kpi-sensors">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('home.sensorsLabel') }}</span>
          <strong class="kpi-value">{{ totalSensors }}</strong>
          <span class="kpi-sub">
            <span class="badge-dot dot-ok"></span> {{ operativeSensors }}
            <span class="badge-dot dot-warn"></span> {{ maintenanceSensors }}
            <span class="badge-dot dot-bad"></span> {{ inactiveSensors }}
          </span>
        </div>
      </article>

      <article class="kpi-card kpi-infractions">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('home.infractionsLabel') }}</span>
          <strong class="kpi-value">{{ totalInfractions }}</strong>
          <span class="kpi-sub">
            {{ $t('home.pending', { count: pendingInfractions, validated: validatedInfractions }) }}
          </span>
        </div>
      </article>

      <article class="kpi-card kpi-reports">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('home.reportsLabel') }}</span>
          <strong class="kpi-value">{{ totalReports }}</strong>
          <span v-if="latestReport" class="kpi-sub">{{ latestReport.title }}</span>
        </div>
      </article>

      <article class="kpi-card kpi-health">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ $t('home.healthLabel') }}</span>
          <strong class="kpi-value" :class="healthColorClass">{{ Math.round(sensorHealthPercent) }}%</strong>
          <div class="mini-bar">
            <div class="mini-bar-fill" :style="{ width: sensorHealthPercent + '%' }"></div>
          </div>
        </div>
      </article>
    </section>

    <section class="module-row">
      <router-link to="/monitoring" class="module-card module-monitoring">
        <div class="module-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
        </div>
        <div class="module-body">
          <h3>{{ $t('home.moduleMonitoring') }}</h3>
          <p>{{ $t('home.sensorSummary', { total: totalSensors, operative: operativeSensors }) }}</p>
          <span class="module-link">{{ $t('home.goToPanel') }}</span>
        </div>
      </router-link>

      <router-link to="/infractions" class="module-card module-infractions">
        <div class="module-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="module-body">
          <h3>{{ $t('home.moduleInfractions') }}</h3>
          <p>{{ $t('home.pendingReview', { count: pendingInfractions }) }}</p>
          <span class="module-link">{{ $t('home.goToPanel') }}</span>
        </div>
      </router-link>

      <router-link to="/analytics" class="module-card module-analytics">
        <div class="module-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        </div>
        <div class="module-body">
          <h3>{{ $t('home.moduleReports') }}</h3>
          <p v-if="latestReport">{{ $t('home.latestReport', { title: latestReport.title }) }}</p>
          <p v-else>{{ $t('home.reportsGenerated', { count: totalReports }) }}</p>
          <span class="module-link">{{ $t('home.goToPanel') }}</span>
        </div>
      </router-link>

      <router-link to="/citizen" class="module-card module-citizen">
        <div class="module-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="module-body">
          <h3>{{ $t('home.moduleCitizen') }}</h3>
          <p>{{ $t('home.citizenDescription') }}</p>
          <span class="module-link">{{ $t('home.goToPortal') }}</span>
        </div>
      </router-link>
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
  await Promise.all([
    sensorStore.fetchSensors(),
    infractionsStore.fetchInfractions(),
    analyticsStore.fetchReports()
  ]);
});

const totalSensors = computed(() => sensorStore.sensors.length);
const operativeSensors = computed(() => sensorStore.operativeCount);
const maintenanceSensors = computed(() => sensorStore.sensors.filter(s => s.status === 'MAINTENANCE').length);
const inactiveSensors = computed(() => sensorStore.sensors.filter(s => s.status === 'INACTIVE').length);
const sensorHealthPercent = computed(() => {
  if (totalSensors.value === 0) return 0;
  return (operativeSensors.value / totalSensors.value) * 100;
});
const healthColorClass = computed(() => {
  const pct = sensorHealthPercent.value;
  if (pct >= 75) return 'text-ok';
  if (pct >= 50) return 'text-warn';
  return 'text-bad';
});

const totalInfractions = computed(() => infractionsStore.infractions.length);
const pendingInfractions = computed(() => infractionsStore.infractions.filter(i => i.status === 'PENDING_VALIDATION').length);
const validatedInfractions = computed(() => infractionsStore.infractions.filter(i => i.status === 'VALIDATED').length);
const rejectedInfractions = computed(() => infractionsStore.infractions.filter(i => i.status === 'REJECTED').length);

const totalReports = computed(() => analyticsStore.reports.length);
const latestReport = computed(() => analyticsStore.reports[0] || null);
</script>

<style scoped>
.home-shell {
  display: grid;
  gap: 1.5rem;
  padding-bottom: 2.5rem;
}

/* ─── Hero strip ─── */
.hero-strip {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.eyebrow {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(10, 100, 255, 0.12);
  color: #0a64ff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0.75rem 0 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.2;
  color: #0f172a;
}

.hero-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 1.1rem;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #0a64ff, #6c5ce7);
  color: white;
  box-shadow: 0 12px 24px rgba(10, 100, 255, 0.18);
}

.btn-secondary {
  background: rgba(10, 100, 255, 0.08);
  color: #0a64ff;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
}

/* ─── KPI row ─── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  flex-shrink: 0;
}

.kpi-sensors .kpi-icon { background: rgba(10, 100, 255, 0.1); color: #0a64ff; }
.kpi-infractions .kpi-icon { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.kpi-reports .kpi-icon { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.kpi-health .kpi-icon { background: rgba(108, 92, 231, 0.1); color: #6c5ce7; }

.kpi-body {
  min-width: 0;
}

.kpi-label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.kpi-value {
  display: block;
  margin-top: 0.15rem;
  font-size: 1.7rem;
  line-height: 1.1;
  color: #0f172a;
}

.kpi-sub {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-ok { color: #0a9b61 !important; }
.text-warn { color: #d97706 !important; }
.text-bad { color: #c62828 !important; }

.badge-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  vertical-align: middle;
  margin: 0 0.15rem 0 0.35rem;
}

.badge-dot:first-of-type { margin-left: 0; }
.dot-ok { background: #0a9b61; }
.dot-warn { background: #b36a00; }
.dot-bad { background: #c62828; }

.mini-bar {
  width: 100%;
  height: 6px;
  background: rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #10b981);
  border-radius: 999px;
  transition: width 0.5s ease;
}

/* ─── Module cards row ─── */
.module-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.module-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.module-monitoring { background: linear-gradient(145deg, rgba(10, 100, 255, 0.06), rgba(255,255,255,0.85)); }
.module-infractions { background: linear-gradient(145deg, rgba(245, 158, 11, 0.06), rgba(255,255,255,0.85)); }
.module-analytics { background: linear-gradient(145deg, rgba(10, 167, 103, 0.06), rgba(255,255,255,0.85)); }
.module-citizen { background: linear-gradient(145deg, rgba(108, 92, 231, 0.06), rgba(255,255,255,0.85)); }

.module-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.1);
  border-color: rgba(148, 163, 184, 0.4);
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
}

.module-monitoring .module-icon { background: rgba(10, 100, 255, 0.1); color: #0a64ff; }
.module-infractions .module-icon { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.module-analytics .module-icon { background: rgba(10, 167, 103, 0.12); color: #0a9b61; }
.module-citizen .module-icon { background: rgba(108, 92, 231, 0.1); color: #6c5ce7; }

.module-body h3 {
  margin: 0 0 0.3rem;
  font-size: 1.05rem;
  color: #0f172a;
}

.module-body p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.module-link {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0a64ff;
}

.module-card:hover .module-link {
  text-decoration: underline;
}

/* ─── Responsive ─── */
@media (max-width: 1100px) {
  .kpi-row, .module-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-strip {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-row, .module-row {
    grid-template-columns: 1fr;
  }

  .kpi-card, .module-card {
    padding: 1rem;
  }
}
</style>
