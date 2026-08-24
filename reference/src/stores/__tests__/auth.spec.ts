import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Ohne das teilen sich alle Tests denselben Store bzw. denselben
    // localStorage - und der zweite Test wuerde am Zustand des ersten haengen.
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('startet abgemeldet', () => {
    const auth = useAuthStore()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.currentUser).toBeNull()
    expect(auth.role).toBeNull()
    expect(auth.academy).toBeNull()
  })

  it('meldet eine lehrende Person an', () => {
    const auth = useAuthStore()

    expect(auth.login('yoda', 'yoda')).toBe(true)
    expect(auth.isLecturer).toBe(true)
    expect(auth.greeting).toBe('Hallo Yoda')
    expect(auth.academy?.id).toBe('jedi')
  })

  it('meldet Lernende an und liefert die Akademie mit', () => {
    const auth = useAuthStore()

    expect(auth.login('maul', 'maul')).toBe(true)
    expect(auth.isStudent).toBe(true)
    expect(auth.academy?.id).toBe('sith')
    // Die Bezeichnung kommt aus der Akademie, nicht aus dem Namen.
    expect(auth.currentUser?.roleLabel).toBe('Akolyth')
  })

  it.each([
    ['yoda', 'jedi'],
    ['bane', 'sith'],
    ['thrawn', 'empire'],
    ['organa', 'rebels'],
  ])('ordnet %s der Akademie %s zu', (login, academyId) => {
    const auth = useAuthStore()

    expect(auth.login(login, login)).toBe(true)
    expect(auth.academy?.id).toBe(academyId)
  })

  it('normalisiert Akzente im Nachnamen', () => {
    const auth = useAuthStore()

    // Elana Sabé -> sabe. Gross-/Kleinschreibung und Akzent sind egal.
    expect(auth.login('Sabé', 'sabe')).toBe(true)
    expect(auth.currentUser?.id).toBe('s40')
    expect(auth.academy?.id).toBe('rebels')
  })

  it('lehnt ein falsches Passwort ab', () => {
    const auth = useAuthStore()

    expect(auth.login('yoda', 'geheim')).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toMatch(/falsch/i)
  })

  it('verraet nicht, ob es den Benutzer gibt', () => {
    const auth = useAuthStore()

    auth.login('yoda', 'falsch')
    const knownUserError = auth.error
    auth.login('gibtsnicht', 'gibtsnicht')

    expect(auth.error).toBe(knownUserError)
  })

  it('meldet ab', () => {
    const auth = useAuthStore()
    auth.login('yoda', 'yoda')

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.currentUser).toBeNull()
    expect(auth.academy).toBeNull()
  })

  it('persistiert nur die ID', async () => {
    const auth = useAuthStore()
    auth.login('yoda', 'yoda')

    // `watch` feuert nicht sofort, sondern gebuendelt im naechsten Tick.
    // Ohne dieses await lieferte localStorage noch null - eine Stolperfalle,
    // die in Tests staendig auftaucht, im Browser aber nie auffaellt.
    await nextTick()

    expect(window.localStorage.getItem('datapad.session')).toBe('"d01"')
    // Weder Name noch Akademie landen im Storage - beides wird abgeleitet.
    expect(window.localStorage.getItem('datapad.session')).not.toContain('jedi')
  })
})
