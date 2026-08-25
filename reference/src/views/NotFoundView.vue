<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/base/BaseCard.vue'
import EmptyState from '@/components/base/EmptyState.vue'

const { t } = useI18n()
</script>

<template>
  <BaseCard>
    <EmptyState :title="t('common.notFoundTitle')" :description="t('common.notFoundBody')">
      <RouterLink :to="{ name: 'home' }" class="text-sm font-medium text-link hover:underline">
        {{ t('common.toStart') }}
      </RouterLink>
    </EmptyState>
  </BaseCard>
</template>
