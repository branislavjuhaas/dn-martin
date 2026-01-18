<script setup lang="ts">
import type { NuxtError } from '#app';
import AppHeader from '~/components/header/AppHeader.vue';

defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <UApp>
    <AppHeader />

    <UError :error="error" />

    <AppFooter />
  </UApp>
</template>
