<script lang="ts" setup>
interface TextDialogProps {
  title?: string;
  description?: string;
  text?: string;
  inputLabel?: string;
  inputDescription?: string;
  placeholder?: string;
}

const props = defineProps<TextDialogProps>();

const text = ref(props.text || '');

const emits = defineEmits<{
  close: [value: string];
}>();
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UFormField :label="props.inputLabel" :description="props.inputDescription" class="w-full">
        <UInput v-model="text" :placeholder="props.placeholder" class="w-full" />
      </UFormField>
    </template>
    <template #footer>
      <UButton label="Zavrieť" color="neutral" variant="outline" @click="emits('close', props.text || '')" />
      <UButton label="Potvrdiť" color="neutral" @click="emits('close', text)" />
    </template>
  </UModal>
</template>
