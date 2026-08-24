<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/base/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

// storeToRefs, NICHT `const { currentUser } = auth`:
// beim normalen Destructuring greifst du den Wert einmal ab und die
// Verbindung zum Store ist weg - die Navigation wuerde nie aktualisieren.
// Funktionen (login/logout) darf man dagegen direkt herausnehmen.
const { currentUser, isLecturer, greeting } = storeToRefs(auth)

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <RouterLink :to="{ name: 'home' }" class="text-sm font-semibold tracking-tight">
        Datapad
      </RouterLink>

      <nav v-if="currentUser" class="flex items-center gap-1 text-sm">
        <template v-if="isLecturer">
          <RouterLink
            :to="{ name: 'lecturer-subjects' }"
            class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            active-class="bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
          >
            Fächer
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink
            :to="{ name: 'student-dashboard' }"
            class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            active-class="bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
          >
            Meine Noten
          </RouterLink>
        </template>
      </nav>

      <div v-if="currentUser" class="ml-auto flex items-center gap-3">
        <span class="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">
          {{ greeting }}
          <span class="text-slate-400">· {{ currentUser.roleLabel }}</span>
        </span>
        <BaseButton variant="ghost" @click="handleLogout">Abmelden</BaseButton>
      </div>
    </div>
  </header>
</template>
