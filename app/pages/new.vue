<script setup lang="ts">
import { UButton } from '#components';
import type { Debater, Team, TournamentInput } from '#shared/types';
import type { TableColumn } from '#ui/components/Table.vue';
import * as XLSX from 'xlsx';

definePageMeta({
  middleware: ['auth']
});

const tournament = ref<TournamentInput>({
  tournament_id: '',
  tournament_name: '',
  teams: []
});

/**
 * Handles file upload and parses Excel data.
 *
 * Logic:
 * 1. Reads the first sheet of the uploaded workbook.
 * 2. Iterates rows to find Team Name (Col 0).
 * 3. Extracts Debater Name (Col 1) and Surname (Col 2).
 *    - If Col 2 is empty, assumes Col 1 contains full name and attempts to split it.
 */
const onFileChange = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames?.[0];
  if (!firstSheetName) {
    console.warn('No sheets found in workbook');
    return;
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Array<Array<string>>;

  // console.log(rows); // Debbuging

  let team = '';
  const teams: Team[] = [];

  for (const row of rows) {
    // If column A has a value, update the current team context
    if (row[0]) {
      team = row[0];
    }

    if (team === '') {
      throw createError({
        status: 400,
        statusMessage: 'Invalid file format: Team name missing'
      });
    }

    const existingTeam = teams.find(t => t.name === team);

    const col1 = String(row[1] ?? '').trim();
    const col2 = row[2] ?? undefined;

    let nameVal = '';
    let surnameVal = '';

    // Handle Name/Surname splitting logic
    if (col2) {
      nameVal = col1;
      surnameVal = String(col2);
    } else {
      // Fallback: Split full name by spaces. Last part becomes surname.
      const parts = col1.split(/\s+/).filter(Boolean);
      nameVal = parts.slice(0, -1).join(' ') || parts[0] || '';
      surnameVal = parts.slice(-1).join('') || '';
    }

    const debater = {
      id: Date.now() + Math.floor(Math.random() * 1e6),
      name: nameVal,
      surname: surnameVal,
      team
    };

    if (existingTeam) {
      existingTeam.debaters.push(debater);
    } else {
      teams.push({
        name: team,
        debaters: [debater]
      });
    }
  }

  tournament.value.teams = teams;
};

const columns: TableColumn<Team>[] = [
  {
    id: 'expand',
    accessorKey: 'Tímy',
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

/**
 * POST the new tournament data to the API.
 */
const createEvent = async () => {
  const result = await $fetch('/api/tournament', {
    method: 'POST',
    body: tournament.value
  });

  if (!result.success) {
    throw createError({
      status: result.statusCode || 500,
      statusMessage: 'Podujatie sa nepodarilo vytvoriť'
    });
  }

  await navigateTo('/');
};

const expanded = ref({});

const state = reactive<{ file?: File }>({
  file: undefined
});
</script>

<template>
  <UPageBody>
    <UContainer>
      <div class="flex flex-row items-center justify-between gap-4 mb-8">
        <h1>
          Vytvoriť nové podujatie
        </h1>
        <UFileUpload v-slot="{ open, removeFile }" v-model="state.file" accept=".xlsx" @update:model-value="onFileChange">
          <UButton variant="subtle" icon="ph:microsoft-excel-logo" color="primary" label="Nahrať dokument" @click="open()">
            Nahrať súbor
          </UButton>

          <p v-if="state.file" class="text-xs text-muted mt-1.5">
            {{ state.file.name }}

            <UButton
              label="Remove"
              color="error"
              variant="link"
              size="xs"
              class="p-0"
              @click="removeFile()"
            />
          </p>
        </UFileUpload>
      </div>
      <UFormField label="ID podujatia (napr. SS271)" class="w-full mb-4" :ui="{ label: 'ml-4' }">
        <UInput v-model="tournament.tournament_id" placeholder="Zadajte id podujatia" class="w-full" />
      </UFormField>
      <UFormField label="Názov podujatia" class="w-full mb-4" :ui="{ label: 'ml-4' }">
        <UInput v-model="tournament.tournament_name" placeholder="Zadajte názov podujatia" class="w-full" />
      </UFormField>
      <UTable
        v-model:expanded="expanded"
        :data="tournament?.teams"
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
      <UButton
        color="primary"
        variant="solid"
        class="mt-4"
        block
        :disabled="!tournament.tournament_name || !tournament.tournament_id || tournament.teams.length === 0"
        @click="createEvent"
      >
        Vytvoriť podujatie
      </UButton>
    </UContainer>
  </UPageBody>
</template>
