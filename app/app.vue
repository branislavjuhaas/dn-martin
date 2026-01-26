<script setup>
import AppHeader from '~/components/header/AppHeader.vue';
import { sk } from '@nuxt/ui/locale';
</script>

<template>
  <UApp :locale="sk">
    <AppHeader />

    <UPage>
      <UMain>
        <NuxtPage />
      </UMain>
    </UPage>

    <AppFooter />
  </UApp>
</template>
