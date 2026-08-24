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
  })

  it('meldet die Dozentin an', () => {
    const auth = useAuthStore()

    expect(auth.login('weber', 'weber')).toBe(true)
    expect(auth.isLecturer).toBe(true)
    expect(auth.currentUser?.firstName).toBe('Martina')
    expect(auth.greeting).toBe('Hallo Martina')
  })

  it('meldet Studierende an', () => {
    const auth = useAuthStore()

    expect(auth.login('mueller', 'mueller')).toBe(true)
    expect(auth.isStudent).toBe(true)
    expect(auth.currentUser?.roleLabel).toBe('Studentin')
  })

  it('akzeptiert den Nachnamen in jeder Schreibweise', () => {
    const auth = useAuthStore()

    // toUsername normalisiert beide Seiten - "Müller" und "MUELLER" landen gleich.
    expect(auth.login('Müller', 'müller')).toBe(true)
    expect(auth.currentUser?.id).toBe('s13')
  })

  it('lehnt ein falsches Passwort ab', () => {
    const auth = useAuthStore()

    expect(auth.login('weber', 'geheim')).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toMatch(/falsch/i)
  })

  it('verraet nicht, ob es den Benutzer gibt', () => {
    const auth = useAuthStore()

    auth.login('weber', 'falsch')
    const knownUserError = auth.error
    auth.login('gibtsnicht', 'gibtsnicht')

    expect(auth.error).toBe(knownUserError)
  })

  it('meldet ab', () => {
    const auth = useAuthStore()
    auth.login('weber', 'weber')

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.currentUser).toBeNull()
  })

  it('persistiert nur die ID', async () => {
    const auth = useAuthStore()
    auth.login('weber', 'weber')

    // `watch` feuert nicht sofort, sondern gebuendelt im naechsten Tick.
    // Ohne dieses await lieferte localStorage noch null - eine Stolperfalle,
    // die in Tests staendig auftaucht, im Browser aber nie auffaellt.
    await nextTick()

    expect(window.localStorage.getItem('datapad.session')).toBe('"d01"')
    // Das ganze User-Objekt landet bewusst NICHT im Storage.
    expect(window.localStorage.getItem('datapad.session')).not.toContain('Martina')
  })
})
