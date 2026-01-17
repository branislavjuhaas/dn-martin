<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

definePageMeta({
  middleware: ['anonymous']
});

const { fetch } = useUserSession();

useSeoMeta({
  title: 'Prihlásenie',
  description: 'Prihláste sa do svojho účtu Fastballot zadaním svojho prihlasovacieho mena a hesla.'
});

/**
 * Login form field configuration
 */
const fields: AuthFormField[] = [{
  name: 'username',
  type: 'text',
  label: 'Používateľské meno',
  placeholder: 'Zadajte svoj email',
  required: true
}, {
  name: 'password',
  label: 'Heslo',
  type: 'password',
  placeholder: 'Zadajte svoje heslo',
  required: true
}];

/**
 * Validation schema for the login form
 */
const schema = z.object({
  username: z.string('Zadajte používateľské meno'),
  password: z.string('Zadajte heslo')
});

type Schema = z.output<typeof schema>;

const error = ref<string | null>(null);

/**
 * Handle login submission.
 * Helper returns proper error messages for specific status codes.
 */
async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const result = await $fetch<{ success: boolean; statusCode: number; statusMessage?: string }>('/api/auth', {
    method: 'POST',
    body: payload.data
  });

  switch (result.statusCode || 500) {
    case 200:
      await fetch();
      error.value = null;
      await navigateTo('/');
      break;
    case 401:
      error.value = 'Neplatné prihlasovacie údaje. Skúste to znova.';
      break;
    case 403:
      error.value = 'Váš účet nemá potrebné oprávnenie na prístup.';
      break;
    default:
      error.value = 'Nastala neočakávaná chyba. Skúste to znova neskôr.';
      break;
  }
}
</script>

<template>
  <div class="flex flex-col my-auto items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Prihlásenie účtom Fastballot"
        description="Zadajte svoj email a heslo pre prihlásenie"
        :submit="{ label: 'Prihlásiť sa' }"
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="error" color="error" icon="ph:exclamation-mark-triangle" class="mb-4">
            {{ error }}
          </UAlert>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
