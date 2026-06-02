<template>
  <div class="app-container">
    <the-toolbar></the-toolbar>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <app-toast-center />
  </div>
</template>

<script>
import Toolbar from './shared/presentation/components/toolbar.vue';
import AppToastCenter from './shared/presentation/components/app-toast-center.vue';

export default {
  name: 'App',
  components: {
    TheToolbar: Toolbar,
    AppToastCenter
  }
}
</script>

<style>
@import './style.css';

body {
  margin: 0;
  font-family: var(--font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
  background:
    radial-gradient(circle at top left, rgba(10, 100, 255, 0.08), transparent 35%),
    linear-gradient(180deg, #f8fbff 0%, #eef3ff 100%);
  color: var(--text-strong, #0f172a);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.25rem 0 2rem;
  box-sizing: border-box;
}
</style>