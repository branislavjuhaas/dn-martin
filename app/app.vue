<script setup>
import AppHeader from '~/components/header/AppHeader.vue';
</script>

<template>
  <UApp>
    <AppHeader />

    <UPage>
      <UMain>
        <NuxtPage />
      </UMain>
    </UPage>

    <AppFooter />
  </UApp>
</template>
