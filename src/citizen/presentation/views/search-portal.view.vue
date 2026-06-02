<template>
  <div class="page-shell search-portal">
    <section class="page-hero surface">
      <div class="hero-copy">
        <span class="eyebrow">{{ $t('citizen.eyebrow') }}</span>
        <h1>{{ $t('citizen.title') }}</h1>
        <p>{{ $t('citizen.description') }}</p>
      </div>
    </section>

    <section class="surface panel-controls">
      <div class="search-form">
        <div class="control-group search-input-group">
          <label for="plate">{{ $t('citizen.plateLabel') }}</label>
          <input id="plate" v-model="plateQuery" type="text" :placeholder="$t('citizen.platePlaceholder')" @keyup.enter="searchTickets" />
        </div>
        <button class="btn-primary btn-search" @click="searchTickets" :disabled="loading">
          {{ loading ? $t('citizen.searching') : $t('citizen.search') }}
        </button>
      </div>
    </section>

    <section class="results-surface">
      <div v-if="loading" class="state-box">{{ $t('citizen.searchingMessage') }}</div>

      <div v-else-if="errors.length" class="state-box state-error">
        {{ $t('citizen.searchError') }}
      </div>

      <div v-else-if="searched" class="results-container">
        <div class="table-meta mb-3">
          <h3 v-if="tickets.length === 0">{{ $t('citizen.noResults', { plate: lastSearchedPlate }) }}</h3>
          <h3 v-else>{{ $t('citizen.resultsFound', { count: tickets.length, plate: lastSearchedPlate }) }}</h3>
        </div>

        <div class="ticket-grid" v-if="tickets.length">
          <ticket-card
            v-for="ticket in tickets"
            :key="ticket.id"
            :ticket="ticket"
            :processing="processingId === ticket.id"
            @pay="handlePayment"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCitizenPortalStore } from '../../application/citizen-portal.store.js';
import { notify } from '../../../shared/infrastructure/notify.js';
import TicketCard from '../components/ticket-card.vue';

const store = useCitizenPortalStore();
const { t } = useI18n();

const plateQuery = ref('');
const lastSearchedPlate = ref('');
const searched = ref(false);
const processingId = ref('');

const tickets = computed(() => store.tickets);
const loading = computed(() => store.loading);
const errors = computed(() => store.errors);

const searchTickets = async () => {
  const query = plateQuery.value.trim().toUpperCase();
  if (!query) return;

  searched.value = false;
  try {
    await store.searchTickets(query);
    lastSearchedPlate.value = query;
    searched.value = true;

    if (store.tickets.length > 0) {
      if (typeof notify === 'function') notify(t('citizen.ticketsFound'), 'info', t('citizen.searchComplete'));
    }
  } catch (error) {
    console.error('Error in search:', error);
    if (typeof notify === 'function') notify(t('citizen.searchFailed'), 'error', t('citizen.searchErrorTitle'));
  }
};

const handlePayment = async (id) => {
  processingId.value = id;
  try {
    await store.payTicket(id);
    if (typeof notify === 'function') notify(t('citizen.paymentSuccess', { id }), 'success', t('citizen.paymentConfirm'));
  } catch (error) {
    console.error('Payment error:', error);
    if (typeof notify === 'function') notify(t('citizen.paymentError'), 'error', t('citizen.paymentErrorTitle'));
  } finally {
    processingId.value = '';
  }
};
</script>

<style scoped>
.search-portal { padding-bottom: 2rem; max-width: 900px; margin: 0 auto; }
.page-hero { padding: 2rem; text-align: center; margin-bottom: 1.5rem; }
.hero-copy { max-width: 600px; margin: 0 auto; }
.eyebrow { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 999px; background: rgba(10, 100, 255, 0.12); color: var(--brand-primary, #0a64ff); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
.page-hero h1 { margin: 0 0 0.5rem; font-size: 2.2rem; }
.page-hero p { color: var(--text-muted, #64748b); line-height: 1.6; font-size: 1.1rem; }
.surface { background: var(--surface, rgba(255, 255, 255, 0.9)); border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-radius: 24px; box-shadow: var(--shadow-soft, 0 18px 50px rgba(15, 23, 42, 0.08)); }
.panel-controls { padding: 1.5rem; margin-bottom: 2rem; }
.search-form { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.search-input-group { flex: 1; min-width: 250px; }
.control-group { display: flex; flex-direction: column; gap: 0.5rem; }
.control-group label { font-size: 0.95rem; font-weight: 700; color: var(--text-strong, #0f172a); }
.control-group input { width: 100%; border: 2px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-radius: 14px; padding: 1rem 1.25rem; font: inherit; font-size: 1.1rem; background: rgba(255, 255, 255, 0.9); color: var(--text-strong, #0f172a); box-sizing: border-box; transition: border-color 0.2s; }
.control-group input:focus { outline: none; border-color: var(--brand-primary, #0a64ff); }
.btn-primary { border: none; border-radius: 14px; padding: 1rem 2rem; font: inherit; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; background: linear-gradient(135deg, var(--brand-primary, #0a64ff), var(--brand-secondary, #6c5ce7)); color: white; }
.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-search { min-width: 150px; }
.results-surface { margin-top: 1rem; }
.ticket-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
.state-box { text-align: center; padding: 3rem 1rem; color: var(--text-muted, #64748b); font-size: 1.1rem; background: var(--surface, rgba(255, 255, 255, 0.7)); border-radius: 20px; border: 1px dashed var(--border-color, rgba(148, 163, 184, 0.28)); }
.state-error { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
.mb-3 { margin-bottom: 1.5rem; }
.table-meta h3 { margin: 0; color: var(--text-strong, #0f172a); font-size: 1.2rem; }
@media (max-width: 600px) { .search-form { flex-direction: column; align-items: stretch; } .btn-search { width: 100%; } }
</style>