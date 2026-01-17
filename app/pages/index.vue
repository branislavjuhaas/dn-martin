<script setup lang="ts">
import { AppTextDialog, UButton } from '#components';
import type { Debater, Team } from '#shared/types';
import type { TableColumn } from '#ui/components/Table.vue';

/**
 * Dashboard/Home page.
 * Displays the currently active tournament and its registered teams.
 */
definePageMeta({
  middleware: ['auth']
});

useSeoMeta({
  title: 'Dashboard',
  description: 'Prehľad aktuálneho debatného podujatia, registrovaných tímov a členov/-iek.'
});

const overlay = useOverlay();

const { data, refresh } = await useFetch('/api/tournament', {
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
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h('div', { class: 'flex flex-row gap-1' }, [
        h(UButton, {
          square: true,
          icon: 'ph:pencil-simple',
          size: 'sm',
          variant: 'subtle',
          color: 'info',
          onClick: () => editTeam(row.original as Team)
        }),
        h(UButton, {
          square: true,
          icon: 'ph:user-plus',
          size: 'sm',
          variant: 'subtle',
          color: 'success',
          onClick: () => addDebater(row.original as Team)
        }),
        h(UButton, {
          square: true,
          icon: 'ph:trash',
          size: 'sm',
          variant: 'subtle',
          color: 'error',
          onClick: () => removeTeam(row.original as Team)
        })
      ])
  }
];

/**
 * Opens a dialog to rename an existing team.
 * Sends a PATCH request to the API and refreshes data on success.
 */
const editTeam = async (team: Team) => {
  const dialog = overlay.create(AppTextDialog, {
    props: {
      title: 'Pridať nový tím',
      inputLabel: 'Názov tímu',
      text: team.name,
      placeholder: 'Zadajte názov tímu'
    }
  });

  const teamName = (await dialog.open()).toUpperCase();

  const result = await $fetch(`/api/teams/${team.id}`, {
    method: 'PATCH',
    body: {
      name: teamName
    }
  });

  if (result.success) {
    refresh();
  }
};

/**
 * Opens a dialog to add a new team to the current tournament.
 * Sends a POST request to the API and refreshes data on success.
 */
const addTeam = async () => {
  const dialog = overlay.create(AppTextDialog, {
    props: {
      title: 'Pridať nový tím',
      inputLabel: 'Názov tímu',
      text: '',
      placeholder: 'Zadajte názov tímu'
    }
  });

  const teamName = (await dialog.open()).toUpperCase();

  const result = await $fetch('/api/teams', {
    method: 'POST',
    body: {
      name: teamName
    }
  });

  if (result.success) {
    refresh();
  }
};

/**
 * Deletes a team from the tournament.
 * Sends a DELETE request to the API and refreshes data on success.
 */
const removeTeam = async (team: Team) => {
  const result = await $fetch(`/api/teams/${team.id}`, {
    method: 'DELETE'
  });

  if (result.success) {
    refresh();
  }
};

/**
 * Opens a dialog to edit a debater's name.
 * Sends a PATCH request to the API and refreshes data on success.
 */
const editDebater = async (debater: Debater) => {
  const dialog = overlay.create(AppTextDialog, {
    props: {
      title: 'Upraviť meno a priezvisko',
      inputLabel: 'Meno a priezvisko',
      text: `${debater.name} ${debater.surname}`,
      placeholder: 'Zadajte nové meno a priezvisko'
    }
  });

  const fullName = await dialog.open();
  const [name, ...surnameParts] = fullName.split(' ');
  const surname = surnameParts.join(' ');

  const result = await $fetch(`/api/debaters/${debater.id}`, {
    method: 'PATCH',
    body: {
      name,
      surname
    }
  });

  if (result.success) {
    refresh();
  }
};

/**
 * Opens a dialog to add a new debater to a specific team.
 * Sends a POST request to the API and refreshes data on success.
 */
const addDebater = async (team: Team) => {
  const dialog = overlay.create(AppTextDialog, {
    props: {
      title: 'Pridať nového rečníka/-čku',
      inputLabel: 'Meno a priezvisko',
      text: '',
      placeholder: 'Zadajte meno a priezvisko'
    }
  });

  const fullName = await dialog.open();
  const [name, ...surnameParts] = fullName.split(' ');
  const surname = surnameParts.join(' ');

  const result = await $fetch(`/api/teams/${team.id}/debaters`, {
    method: 'POST',
    body: {
      name,
      surname
    }
  });

  if (result.success) {
    refresh();
  }
};

/**
 * Removes a debater from their team.
 * Sends a DELETE request to the API and refreshes data on success.
 */
const removeDebater = async (debater: Debater) => {
  const result = await $fetch(`/api/debaters/${debater.id}`, {
    method: 'DELETE'
  });

  if (result.success) {
    refresh();
  }
};

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
      <div class="flex flex-row justify-end">
        <UButton
          color="primary"
          variant="outline"
          class="mt-4 self-end"
          @click="addTeam"
        >
          Vytvoriť nový tím
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
                  icon="ph:pencil-simple"
                  size="sm"
                  variant="ghost"
                  color="info"
                  @click="editDebater(debater)"
                />
                <UButton
                  square
                  icon="ph:trash"
                  size="sm"
                  variant="ghost"
                  color="error"
                  @click="removeDebater(debater)"
                />
              </div>
            </div>
          </div>
        </template>
      </UTable>
    </UContainer>
  </UPageBody>
</template>
