<template>
  <div class="toast-center" aria-live="polite" aria-atomic="true">
    <transition-group name="toast-fade" tag="div" class="toast-stack">
      <article v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <div class="toast__content">
          <strong v-if="toast.title">{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast__close" type="button" @click="removeToast(toast.id)">×</button>
      </article>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'AppToastCenter',
  data() {
    return {
      toasts: []
    }
  },
  mounted() {
    this.handler = (event) => {
      const detail = event?.detail || {};
      const toast = {
        id: detail.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message: detail.message || '',
        type: detail.type || 'info',
        title: detail.title || ''
      };

      this.toasts.unshift(toast);
      this.toasts = this.toasts.slice(0, 4);

      window.setTimeout(() => this.removeToast(toast.id), 4200);
    };

    window.addEventListener('catchtrap:notify', this.handler);
  },
  beforeUnmount() {
    window.removeEventListener('catchtrap:notify', this.handler);
  },
  methods: {
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    }
  }
}
</script>

<style scoped>
.toast-center {
  position: fixed;
  inset: 1rem 1rem auto auto;
  z-index: 60;
  pointer-events: none;
}

.toast-stack {
  display: grid;
  gap: 0.75rem;
}

.toast {
  pointer-events: auto;
  min-width: min(360px, calc(100vw - 2rem));
  padding: 1rem 1rem 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28));
  background: rgba(15, 23, 42, 0.92);
  color: white;
  box-shadow: var(--shadow-lg, 0 24px 60px rgba(15, 23, 42, 0.18));
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  backdrop-filter: blur(12px);
}

.toast strong {
  display: block;
  margin-bottom: 0.25rem;
}

.toast p {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
}

.toast.success {
  border-color: rgba(34, 197, 94, 0.35);
}

.toast.error {
  border-color: rgba(239, 68, 68, 0.35);
}

.toast.info {
  border-color: rgba(59, 130, 246, 0.35);
}

.toast__close {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .toast-center {
    inset: auto 0.75rem 0.75rem;
  }

  .toast {
    min-width: unset;
  }
}
</style>