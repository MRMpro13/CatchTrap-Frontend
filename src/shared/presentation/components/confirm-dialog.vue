<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="onCancel">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div class="modal-header">
            <div class="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86l-8.09 14.02a1.86 1.86 0 001.62 2.62h16.36a1.86 1.86 0 001.62-2.62l-8.09-14.02a1.86 1.86 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 id="confirm-title">{{ title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="onCancel">{{ cancelText }}</button>
            <button class="btn btn-confirm" @click="onConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Aceptar' },
  cancelText: { type: String, default: 'Cancelar' }
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const onConfirm = () => {
  emit('confirm');
  emit('update:visible', false);
};

const onCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
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
  max-width: 420px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.5rem 0;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-strong, #0f172a);
}

.modal-body {
  padding: 1rem 1.5rem 1.5rem;
}

.modal-body p {
  margin: 0;
  color: var(--text-muted, #64748b);
  line-height: 1.6;
  font-size: 0.95rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.btn {
  flex: 1;
  border: none;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-cancel {
  background: rgba(10, 100, 255, 0.1);
  color: var(--brand-primary, #0a64ff);
}

.btn-confirm {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: white;
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
