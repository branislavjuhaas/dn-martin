<script setup lang="ts">
import { UButton } from '#components';
import type { Debater, Team } from '#shared/types';
import type { TableColumn } from '#ui/components/Table.vue';

/**
 * Dashboard/Home page.
 * Displays the currently active tournament and its registered teams.
 */
definePageMeta({
  middleware: ['auth']
});

const { data } = await useFetch('/api/tournament', {
  method: 'GET'
});

/**
 * Table column definitions for the Team list.
 * Includes expander logic and a custom cell formatter for debater names.
 */
const columns: TableColumn<Team>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        'color': 'neutral',
        'variant': 'ghost',
        'icon': 'i-lucide-chevron-down',
        'square': true,
        'aria-label': 'Expand',
        'ui': {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        'onClick': () => row.toggleExpanded()
      })
  },
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'name',
    header: 'Názov tímu'
  },
  {
    accessorKey: 'debaters',
    header: 'Členovia/-ky tímu',
    cell: ({ row }: { row: any }) => {
      const debaters = (row.getValue('debaters') ?? []) as Debater[];
      return Array.isArray(debaters)
        ? debaters.map(d => `${d.name} ${d.surname}`).join(', ')
        : String(debaters ?? '');
    }
  }
];

const expanded = ref({});
</script>

<template>
  <UPageBody>
    <UContainer>
      <UBadge color="primary" variant="subtle" class="mb-1">
        Práve prebieha
      </UBadge>
      <div class="flex flex-row items-center justify-between gap-4 mb-8">
        <h1>
          {{ data?.tournament?.tournament_name }}
        </h1>
        <UButton icon="ph:plus-square" color="primary" variant="subtle" to="/new">
          Vytvoriť podujatie
        </UButton>
      </div>
      <UTable
        v-model:expanded="expanded"
        :data="data?.tournament?.teams"
        :columns="columns"
        :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
        class="flex-1"
      >
        <template #expanded="{ row }">
          <div class="flex flex-col gap-2">
            <div v-for="debater in row.getValue('debaters') as Debater[]" :key="debater.id" class="flex flex-row justify-between">
              <span>{{ debater.name }} {{ debater.surname }}</span> <div class="flex flex-row gap-1">
                <UButton
                  square
                  icon="ph:trash"
                  size="sm"
                  variant="ghost"
                  color="error"
                  disabled
                />
                <UButton
                  square
                  icon="ph:pencil-simple"
                  size="sm"
                  variant="ghost"
                  color="info"
                  disabled
                />
              </div>
            </div>
          </div>
        </template>
      </UTable>
    </UContainer>
  </UPageBody>
</template>
