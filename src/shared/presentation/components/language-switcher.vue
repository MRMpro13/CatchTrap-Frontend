<template>
  <button class="lang-btn" @click="toggleLanguage">
    {{ locale === 'es' ? 'EN' : 'ES' }}
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function toggleLanguage() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}
</script>

<style scoped>
.lang-btn {
  all: unset;
  cursor: pointer;
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--text-muted, #64748b);
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease;
  margin-left: 0.5rem;
}

.lang-btn:hover {
  transform: translateY(-1px);
  color: var(--text-strong, #0f172a);
  background: rgba(10, 100, 255, 0.08);
  border-color: rgba(10, 100, 255, 0.3);
}

@media (max-width: 768px) {
  .lang-btn {
    margin-left: 0;
    align-self: center;
    margin-top: 0.25rem;
  }
}
</style>
