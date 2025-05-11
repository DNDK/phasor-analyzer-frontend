<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
  const layout = route.meta.layout || 'DefaultLayout'
  return layout === 'DefaultLayout' ? DefaultLayout : DefaultLayout
})
</script>

<template>
  <component :is="layoutComponent">
    <RouterView />
  </component>
</template>
