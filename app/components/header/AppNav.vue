<script setup lang="ts">
const { user, clear } = useUserSession();

const navItems = ref([
  [
    {
      label: 'Vytvoriť podujatie',
      to: '/new',
      icon: 'ph:plus-square'
    },
    {
      label: 'Panel správy Fastballot',
      to: 'https://fastballot.sk/admin/index.php',
      icon: 'ph:nut'
    }
  ],
  [
    {
      label: 'Odhlásiť sa',
      icon: 'ph:plugs',
      color: 'error',
      onSelect: () => {
        clear();
        navigateTo('/auth');
      }
    }
  ]
]);
</script>

<template>
  <UFieldGroup>
    <UButton
      to="https://fastballot.sk/profile.php"
      color="neutral"
      variant="outline"
      icon="ph:identification-card"
    >
      {{ user.name }}
    </UButton>
    <UDropdownMenu
      :items="navItems"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8
      }"
    >
      <UButton
        icon="ph:sort-ascending"
        color="neutral"
        variant="outline"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
