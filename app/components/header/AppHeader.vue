<script setup lang="ts">
const { loggedIn } = useUserSession();
</script>

<template>
  <UHeader :toggle="false">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-8 w-auto" />
      </NuxtLink>
    </template>
    <template #right>
      <AppNav v-if="loggedIn" />
    </template>
  </UHeader>
</template>
