<template>
  <header class="toolbar surface">
    <div class="brand">
      <router-link to="/" class="logo">CatchTrap</router-link>
      <span class="brand-tag">Frontend sandbox</span>
    </div>

    <nav class="nav-links">
      <router-link to="/" exact-active-class="is-active">Inicio</router-link>
      <router-link to="/monitoring" active-class="is-active">Monitoreo</router-link>
      <router-link to="/infractions" active-class="is-active">Infracciones</router-link>
      <router-link to="/citizen" active-class="is-active">Ciudadano</router-link>
      <router-link to="/analytics" active-class="is-active">Reportes</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'TheToolbar'
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin: 1rem 0 0.25rem;
  border-radius: 24px;
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28));
  background: rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow-soft, 0 18px 50px rgba(15, 23, 42, 0.08));
  backdrop-filter: blur(18px);
  position: sticky;
  top: 0.75rem;
  z-index: 30;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.logo {
  text-decoration: none;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-strong, #0f172a);
}

.brand-tag {
  font-size: 0.82rem;
  color: var(--text-muted, #64748b);
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted, #64748b);
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-weight: 700;
  transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.nav-links a:hover {
  transform: translateY(-1px);
  color: var(--text-strong, #0f172a);
  background: rgba(10, 100, 255, 0.08);
}

.nav-links a.is-active {
  color: white;
  background: linear-gradient(135deg, var(--brand-primary, #0a64ff), var(--brand-secondary, #6c5ce7));
}

@media (max-width: 768px) {
  .toolbar {
    position: static;
    flex-direction: column;
    align-items: stretch;
  }

  .nav-links a {
    text-align: center;
    flex: 1 1 calc(50% - 0.5rem);
  }
}
</style>