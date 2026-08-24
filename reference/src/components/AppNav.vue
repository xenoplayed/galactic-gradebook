<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/base/BaseButton.vue'
import AcademyEmblem from '@/components/AcademyEmblem.vue'

const auth = useAuthStore()
const router = useRouter()

// storeToRefs, NICHT `const { currentUser } = auth`:
// beim normalen Destructuring greifst du den Wert einmal ab und die
// Verbindung zum Store ist weg - die Navigation wuerde nie aktualisieren.
// Funktionen (login/logout) darf man dagegen direkt herausnehmen.
const { currentUser, academy, isLecturer, greeting } = storeToRefs(auth)

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="border-b border-line bg-surface/85 backdrop-blur">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2.5">
        <span v-if="academy" class="block h-7 w-7 text-link">
          <AcademyEmblem :academy-id="academy.id" />
        </span>
        <span class="text-sm font-semibold tracking-tight">
          {{ academy?.shortName ?? 'Datapad' }}
        </span>
      </RouterLink>

      <nav v-if="currentUser" class="flex items-center gap-1 text-sm">
        <RouterLink
          :to="isLecturer ? { name: 'lecturer-subjects' } : { name: 'student-dashboard' }"
          class="rounded-card px-3 py-1.5 text-ink-soft hover:bg-surface-2"
          active-class="bg-surface-2 font-medium text-ink"
        >
          {{ isLecturer ? 'Ausbildung' : 'Meine Bewertungen' }}
        </RouterLink>
      </nav>

      <div v-if="currentUser" class="ml-auto flex items-center gap-3">
        <span class="hidden text-sm text-ink-soft sm:inline">
          {{ greeting }}
          <span class="opacity-70">· {{ currentUser.roleLabel }}</span>
        </span>
        <BaseButton variant="ghost" @click="handleLogout">Abmelden</BaseButton>
      </div>
    </div>
  </header>
</template>
