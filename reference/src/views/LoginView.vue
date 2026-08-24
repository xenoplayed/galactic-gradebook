<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useGradesStore } from '@/stores/grades'
import { useAcademyPreview } from '@/composables/useAcademyTheme'
import { homeRouteFor } from '@/router'
import { academies, accessEntriesFor } from '@/data/seed'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseDialog from '@/components/base/BaseDialog.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import AcademyEmblem from '@/components/AcademyEmblem.vue'

const auth = useAuthStore()
const gradesStore = useGradesStore()
const router = useRouter()
const route = useRoute()
const { error } = storeToRefs(auth)

// Geteilter Zustand aus dem Composable: dieselbe Auswahl, die das Theme
// umschaltet. Deshalb reicht hier ein v-model - das Umfaerben passiert
// woanders von selbst.
const { previewAcademyId } = useAcademyPreview()

const username = ref('')
const password = ref('')
const accessOpen = ref(false)

const selectedAcademy = computed(() => academies.require(previewAcademyId.value))

const accessEntries = computed(() => accessEntriesFor(previewAcademyId.value))

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

/** Uebernimmt einen Zugang aus der Liste in beide Felder. */
function pickLogin(login: string) {
  username.value = login
  password.value = login
  auth.clearError()
  accessOpen.value = false
}

function resetData() {
  const confirmed = window.confirm(
    'Alle eingetragenen Bewertungen werden auf den Auslieferungszustand zurückgesetzt. Fortfahren?',
  )
  if (confirmed) gradesStore.resetAll()
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

    <!--
      Echte Radio-Buttons statt <button role="radio">: Gruppierung,
      Pfeiltastennavigation und Fokusverhalten kommen damit vom Browser.
      Sichtbar ist nur das <label>, der Eingabeknopf liegt per sr-only daneben.
    -->
    <fieldset>
      <legend class="mb-3 w-full text-center text-sm font-medium text-ink-soft">
        Akademie wählen — das Erscheinungsbild wechselt sofort
      </legend>

      <div class="grid gap-3 sm:grid-cols-2">
        <label
          v-for="academy in academies.all()"
          :key="academy.id"
          class="flex cursor-pointer items-start gap-3 rounded-card bg-surface p-4 ring-1 transition-colors"
          :class="
            previewAcademyId === academy.id ? 'ring-2 ring-link' : 'ring-line hover:bg-surface-2'
          "
        >
          <input
            v-model="previewAcademyId"
            type="radio"
            name="academy"
            :value="academy.id"
            class="sr-only"
          />
          <span
            class="mt-0.5 block h-8 w-8 shrink-0"
            :class="previewAcademyId === academy.id ? 'text-link' : 'text-ink-soft'"
          >
            <AcademyEmblem :academy-id="academy.id" />
          </span>
          <span class="min-w-0">
            <span class="block font-medium">{{ academy.name }}</span>
            <span class="mt-0.5 block text-xs text-ink-soft italic">„{{ academy.motto }}"</span>
          </span>
        </label>
      </div>
    </fieldset>

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

        <div class="mt-4 border-t border-line pt-4">
          <BaseButton variant="secondary" block @click="accessOpen = true">
            Zugänge von {{ selectedAcademy.shortName }} anzeigen
          </BaseButton>
        </div>
      </BaseCard>

      <p class="mt-6 text-center text-xs text-ink-soft">
        Alle Bewertungen liegen nur in diesem Browser.
        <button type="button" class="underline hover:text-ink" @click="resetData">
          Testdaten zurücksetzen
        </button>
      </p>
    </div>

    <BaseDialog
      v-model="accessOpen"
      :title="`Zugänge — ${selectedAcademy.name}`"
      :description="`Auswählen trägt Benutzername und Passwort ein. Beides ist der Nachname, kleingeschrieben.`"
    >
      <ul class="divide-y divide-line">
        <li v-for="entry in accessEntries" :key="entry.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 py-2.5 text-left hover:text-link"
            @click="pickLogin(entry.login)"
          >
            <span class="min-w-0 truncate" :class="entry.isLecturer && 'font-medium'">
              {{ entry.display }}
            </span>
            <code class="shrink-0 font-mono text-xs text-ink-soft">{{ entry.login }}</code>
          </button>
        </li>
      </ul>
    </BaseDialog>
  </div>
</template>
