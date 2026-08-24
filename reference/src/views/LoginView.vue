<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { homeRouteFor } from '@/router'
import { academies, lecturers } from '@/data/seed'
import { toUsername } from '@/lib/strings'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import AcademyEmblem from '@/components/AcademyEmblem.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { error } = storeToRefs(auth)

const username = ref('')
const password = ref('')

/**
 * Je Akademie die lehrende Person - daraus entsteht die Liste der Testzugaenge.
 * Abgeleitet statt abgeschrieben: kommt eine Akademie dazu, steht sie hier
 * automatisch mit drin.
 */
const showcase = academies.map((academy) => {
  const lecturer = lecturers.find((person) => person.academyId === academy.id)
  return {
    academy,
    lecturer,
    login: lecturer === undefined ? '' : toUsername(lecturer.lastName),
  }
})

function handleSubmit() {
  if (!auth.login(username.value, password.value)) {
    password.value = ''
    return
  }

  // `redirect` kommt aus dem Guard, wenn jemand direkt eine geschuetzte URL
  // aufgerufen hat. Es ist ein Query-Parameter und damit vom Nutzer
  // beeinflussbar - deshalb wird nur ein projektinterner Pfad akzeptiert.
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    router.push(redirect)
    return
  }

  router.push(homeRouteFor(auth.role!))
}

/** Bequemlichkeit: Klick auf eine Akademiekarte fuellt den Testzugang aus. */
function useLogin(name: string) {
  username.value = name
  password.value = name
  auth.clearError()
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <div class="text-center">
      <h1 class="text-2xl font-semibold tracking-tight">Datapad</h1>
      <p class="mt-1 text-sm text-ink-soft">
        Ausbildungsakten der Galaxis · vier Akademien, ein Zugang
      </p>
    </div>

    <div class="mx-auto max-w-md">
      <BaseCard title="Anmelden" subtitle="Benutzername und Passwort sind jeweils der Nachname.">
        <!--
          `@submit.prevent` = addEventListener('submit', e => { e.preventDefault(); ... }).
          Ein echtes <form> statt eines Buttons mit @click: nur so funktioniert
          Enter im Textfeld, und Passwortmanager erkennen das Formular.
        -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <BaseInput
            v-model="username"
            label="Benutzername"
            autocomplete="username"
            placeholder="z. B. yoda"
            @update:model-value="auth.clearError()"
          />
          <BaseInput
            v-model="password"
            label="Passwort"
            type="password"
            autocomplete="current-password"
            :error="error"
          />
          <BaseButton type="submit" block>Anmelden</BaseButton>
        </form>
      </BaseCard>
    </div>

    <section>
      <h2 class="text-center text-sm font-medium text-ink-soft">
        Die vier Akademien — zum Ausprobieren anklicken
      </h2>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          v-for="entry in showcase"
          :key="entry.academy.id"
          type="button"
          class="rounded-card bg-surface p-4 text-left ring-1 ring-line transition-colors hover:bg-surface-2"
          @click="useLogin(entry.login)"
        >
          <div class="flex items-start gap-3">
            <!--
              Das Wasserzeichen traegt hier NICHT die Akademiefarbe: solange
              niemand angemeldet ist, gilt die neutrale Palette. Sonst saehe der
              Login-Bildschirm nach vier gleichzeitigen Themes aus.
            -->
            <span class="mt-0.5 block h-8 w-8 shrink-0 text-brand-600">
              <AcademyEmblem :academy-id="entry.academy.id" />
            </span>
            <div class="min-w-0">
              <p class="font-medium">{{ entry.academy.name }}</p>
              <p class="mt-0.5 text-xs text-ink-soft italic">„{{ entry.academy.motto }}"</p>
              <p class="mt-2 text-xs text-ink-soft">
                {{ entry.academy.lecturerLabel }}:
                <code class="font-mono">{{ entry.login }}</code>
                <span class="opacity-60"> · Passwort identisch</span>
              </p>
            </div>
          </div>
        </button>
      </div>

      <p class="mt-4 text-center text-xs text-ink-soft">
        Lernende melden sich ebenso an, z. B.
        <code class="font-mono">tano</code>, <code class="font-mono">maul</code>,
        <code class="font-mono">versio</code> oder <code class="font-mono">syndulla</code>.
      </p>
    </section>
  </div>
</template>
