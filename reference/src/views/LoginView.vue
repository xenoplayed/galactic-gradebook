<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { homeRouteFor } from '@/router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { error } = storeToRefs(auth)

const username = ref('')
const password = ref('')

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
</script>

<template>
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
          placeholder="z. B. weber"
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

      <div
        class="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
      >
        <p class="font-medium text-slate-700 dark:text-slate-300">Testzugänge</p>
        <p class="mt-1">
          Dozentin: <code class="font-mono">weber</code> / <code class="font-mono">weber</code>
        </p>
        <p>
          Studentin: <code class="font-mono">mueller</code> / <code class="font-mono">mueller</code>
        </p>
      </div>
    </BaseCard>
  </div>
</template>
