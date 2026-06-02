<template>
  <div class="ticket-card">
    <div class="ticket-card__header">
      <p class="ticket-id"><strong>N° Ticket:</strong> {{ ticket.id }}</p>
      <span :class="['status-pill', ticket.status.toLowerCase()]">
        {{ ticket.status === 'UNPAID' ? 'Pendiente de pago' : 'Pagado' }}
      </span>
    </div>
    <div class="ticket-card__body">
      <p><strong>Fecha Emisión:</strong> {{ formattedDate }}</p>
      <p><strong>Monto:</strong> S/. {{ ticket.amount.toFixed(2) }}</p>
    </div>
    <div class="ticket-card__footer">
      <button v-if="ticket.status === 'UNPAID'" class="btn-pay" @click="$emit('pay', ticket.id)" :disabled="processing">
        {{ processing ? 'Procesando...' : 'Pagar Online' }}
      </button>
      <button v-if="ticket.status === 'PAID'" class="btn-download" @click="downloadReceipt">
        Descargar Recibo
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { notify } from '../../../shared/infrastructure/notify.js';

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  processing: {
    type: Boolean,
    default: false
  }
});

defineEmits(['pay']);

const formattedDate = computed(() => {
  return props.ticket.issuedAt ? new Date(props.ticket.issuedAt).toLocaleString() : '—';
});

const downloadReceipt = () => {
  notify(`Descargando comprobante de pago para el ticket ${props.ticket.id}.`, 'info', 'Descarga Iniciada');
};
</script>

<style scoped>
.ticket-card { border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); border-left: 4px solid #ef4444; padding: 1.25rem; margin-bottom: 1rem; background-color: rgba(255,255,255,0.92); border-radius: 12px; box-shadow: var(--shadow-soft, 0 18px 50px rgba(15, 23, 42, 0.08)); transition: transform 0.2s ease; }
.ticket-card:hover { transform: translateY(-2px); }
.ticket-card__header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.28)); padding-bottom: 0.75rem; }
.ticket-id { margin: 0; font-size: 1.1rem; }
.ticket-card__body p { margin: 0.35rem 0; color: var(--text-muted, #64748b); }
.ticket-card__footer { margin-top: 1rem; text-align: right; display: flex; justify-content: flex-end; gap: 0.5rem; }
.status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.35rem 0.7rem; border-radius: 999px; font-size: 0.85rem; font-weight: 700; }
.unpaid { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.paid { background: rgba(34, 197, 94, 0.12); color: #22c55e; border-left-color: #22c55e !important; }
.ticket-card:has(.paid) { border-left-color: #22c55e; }
.btn-pay { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 12px; cursor: pointer; font-weight: 700; transition: transform 0.2s ease, opacity 0.2s ease; }
.btn-pay:hover { transform: translateY(-1px); }
.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-download { background: rgba(10, 100, 255, 0.1); color: var(--brand-primary, #0a64ff); border: none; padding: 0.75rem 1.25rem; border-radius: 12px; cursor: pointer; font-weight: 700; transition: opacity 0.2s ease; }
.btn-download:hover { opacity: 0.85; }
</style>