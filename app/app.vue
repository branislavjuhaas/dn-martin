<script setup>
import AppHeader from '~/components/header/AppHeader.vue';
</script>

<template>
  <UApp>
    <AppHeader />

    <UMain class="pt-16">
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
