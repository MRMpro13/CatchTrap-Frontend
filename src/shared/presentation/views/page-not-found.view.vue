<template>
  <div class="not-found">
    <h1>404</h1>
    <p>{{ $t('page-not-found.title') }}</p>
    <router-link to="/">{{ $t('page-not-found.go-home') }}</router-link>
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