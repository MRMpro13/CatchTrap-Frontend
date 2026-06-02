<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <router-link to="/">Volver al inicio</router-link>
  </div>
</template>

<script>
export default {
  name: 'PageNotFoundView'
}
</script>

<style scoped>
.not-found {
  padding: 2rem;
  text-align: center;
}
</style>