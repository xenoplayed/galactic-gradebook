<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/base/BaseCard.vue'
import EmptyState from '@/components/base/EmptyState.vue'
</script>

<template>
  <BaseCard>
    <EmptyState title="Seite nicht gefunden" description="Diese Adresse gibt es hier nicht.">
      <RouterLink :to="{ name: 'home' }" class="text-sm font-medium text-link hover:underline">
        Zur Startseite
      </RouterLink>
    </EmptyState>
  </BaseCard>
</template>
