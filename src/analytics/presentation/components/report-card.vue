<template>
  <article class="report-card">
    <div class="report-card__header">
      <span class="eyebrow small">{{ report.id }}</span>
      <button class="btn-download" @click="$emit('download', report)">Descargar PDF</button>
    </div>
    <h3>{{ report.title }}</h3>
    <p><strong>Fecha:</strong> {{ report.date }}</p>
    <p><strong>Total de infracciones:</strong> {{ report.totalInfractions }}</p>
  </article>
</template>

<script setup>
defineProps({
  report: {
    type: Object,
    required: true
  }
});
defineEmits(['download']);
</script>

<style scoped>
.report-card { border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 20px; padding: 1rem; background: rgba(255,255,255,0.92); box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); transition: transform 0.2s ease; }
.report-card:hover { transform: translateY(-2px); }
.report-card__header { display: flex; justify-content: space-between; gap: 1rem; align-items: start; margin-bottom: 0.9rem; }
.report-card h3 { margin: 0 0 0.5rem; }
.report-card p { margin: 0.35rem 0; color: #64748b; }
.btn-download { border: none; border-radius: 14px; padding: 0.75rem 0.95rem; font: inherit; font-weight: 700; cursor: pointer; background: rgba(10, 100, 255, 0.1); color: #0a64ff; transition: opacity 0.2s ease; }
.btn-download:hover { opacity: 0.85; }
.eyebrow { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 999px; background: rgba(10, 100, 255, 0.12); color: #0a64ff; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.eyebrow.small { font-size: 0.72rem; }
</style>