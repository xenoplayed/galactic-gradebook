<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAcademyPreview } from '@/composables/useAcademyTheme'
import { useAcademyLabels } from '@/composables/useAcademyLabels'
import BaseButton from '@/components/base/BaseButton.vue'
import AcademyEmblem from '@/components/AcademyEmblem.vue'
import LanguageSelect from '@/components/LanguageSelect.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

// storeToRefs, NICHT `const { currentUser } = auth`:
// beim normalen Destructuring greifst du den Wert einmal ab und die
// Verbindung zum Store ist weg - die Navigation wuerde nie aktualisieren.
const { currentUser, academy, isLecturer } = storeToRefs(auth)
const { previewAcademyId } = useAcademyPreview()

/** Angemeldet die echte Akademie, sonst die vorgemerkte - wie beim Theme. */
const shownAcademyId = computed(() => academy.value?.id ?? previewAcademyId.value)
const labels = useAcademyLabels(shownAcademyId)

const greeting = computed(() =>
  currentUser.value === null ? '' : t('login.greeting', { name: currentUser.value.firstName }),
)

const roleLabel = computed(() => {
  if (currentUser.value === null) return ''
  return isLecturer.value ? labels.lecturerLabel.value : labels.studentLabel(1)
})

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="border-b border-line bg-surface/85 backdrop-blur">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2.5">
        <span class="block h-7 w-7 text-link">
          <AcademyEmblem :academy-id="shownAcademyId" />
        </span>
        <span class="text-sm font-semibold tracking-tight">
          {{ currentUser ? labels.shortName.value : t('app.name') }}
        </span>
      </RouterLink>

      <nav v-if="currentUser" class="flex items-center gap-1 text-sm">
        <RouterLink
          :to="isLecturer ? { name: 'lecturer-subjects' } : { name: 'student-dashboard' }"
          class="rounded-card px-3 py-1.5 text-ink-soft hover:bg-surface-2"
          active-class="bg-surface-2 font-medium text-ink"
        >
          {{ isLecturer ? t('nav.training') : t('nav.myAssessments') }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <span v-if="currentUser" class="hidden text-sm text-ink-soft sm:inline">
          {{ greeting }}
          <span class="opacity-70">· {{ roleLabel }}</span>
        </span>
        <!-- Immer sichtbar, also auch vor der Anmeldung. -->
        <LanguageSelect />
        <BaseButton v-if="currentUser" variant="ghost" @click="handleLogout">
          {{ t('nav.signOut') }}
        </BaseButton>
      </div>
    </div>
  </header>
</template>
