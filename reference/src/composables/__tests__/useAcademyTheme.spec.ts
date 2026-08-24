import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick } from 'vue'
import { useAcademyPreview, useAcademyTheme } from '@/composables/useAcademyTheme'
import { useAuthStore } from '@/stores/auth'

/**
 * `useAcademyTheme` registriert Watcher. Ausserhalb einer Komponente brauchen
 * die einen Scope, sonst warnt Vue und die Watcher werden nie aufgeraeumt.
 */
function runTheme() {
  const scope = effectScope()
  scope.run(() => useAcademyTheme())
  return scope
}

describe('useAcademyTheme', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    delete document.documentElement.dataset.academy
    useAcademyPreview().previewAcademyId.value = 'jedi'
  })

  it('startet abgemeldet mit der Vorschau', async () => {
    runTheme()
    await nextTick()

    expect(document.documentElement.dataset.academy).toBe('jedi')
  })

  it('folgt der Auswahl auf dem Anmeldebildschirm', async () => {
    runTheme()
    const { previewAcademyId } = useAcademyPreview()

    previewAcademyId.value = 'empire'
    await nextTick()

    expect(document.documentElement.dataset.academy).toBe('empire')
  })

  it('die echte Akademie schlaegt die Vorschau', async () => {
    runTheme()
    const auth = useAuthStore()

    // Jedi vorgemerkt, aber als Sith-Akolyth angemeldet.
    auth.login('maul', 'maul')
    await nextTick()

    expect(document.documentElement.dataset.academy).toBe('sith')
  })

  it('bleibt nach dem Abmelden bei der zuletzt echten Akademie', async () => {
    runTheme()
    const auth = useAuthStore()
    auth.login('thrawn', 'thrawn')
    await nextTick()

    auth.logout()
    await nextTick()

    // Ohne dieses Merken waere das Abmelden ein optischer Sprung zurueck
    // auf Jedi.
    expect(document.documentElement.dataset.academy).toBe('empire')
    expect(useAcademyPreview().previewAcademyId.value).toBe('empire')
  })

  it('teilt den Vorschau-Zustand zwischen allen Aufrufern', () => {
    // Der ref steht ausserhalb der Funktion - deshalb ist es derselbe.
    const a = useAcademyPreview()
    const b = useAcademyPreview()

    a.previewAcademyId.value = 'rebels'

    expect(b.previewAcademyId.value).toBe('rebels')
  })
})
