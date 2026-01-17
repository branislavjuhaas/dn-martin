<script setup>
import AppHeader from '~/components/header/AppHeader.vue';
</script>

<template>
  <UApp>
    <AppHeader />

    <UPage>
      <UMain class="flex flex-col items-center justify-center">
        <NuxtPage />
      </UMain>
    </UPage>

    <AppFooter />
  </UApp>
</template>
