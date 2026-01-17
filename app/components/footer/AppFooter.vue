<script setup lang="ts">
import { version } from '~~/package.json';

/**
 * Link to project repository used for the footer GitHub button.
 */
const source = 'https://github.com/branislavjuhaas/dn-martin';
</script>

<template>
  <USeparator class="-mb-[1px]" />
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Copyright © 2024 - 2026 Branislav Juhás
      </p>
    </template>

    <template #right>
      <UBadge
        variant="subtle"
        class="mr-1"
      >
        v{{ version }}
      </UBadge>
      <UColorModeButton />
      <UButton
        icon="ph:github-logo"
        color="neutral"
        variant="ghost"
        :to="source"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
