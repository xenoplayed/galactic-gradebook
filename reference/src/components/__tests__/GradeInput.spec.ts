import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GradeInput from '@/components/GradeInput.vue'
import type { Grade } from '@/types/domain'

function mountInput(modelValue: Grade | null = null) {
  return mount(GradeInput, {
    props: { modelValue, label: 'Note für Testperson' },
  })
}

describe('GradeInput', () => {
  it('zeigt den uebergebenen Wert an', () => {
    const wrapper = mountInput(3)

    expect(wrapper.get('input').element.value).toBe('3')
  })

  it('zeigt eine fehlende Note als leeres Feld', () => {
    expect(mountInput(null).get('input').element.value).toBe('')
  })

  it('meldet eine gueltige Eingabe nach oben', async () => {
    const wrapper = mountInput(null)

    await wrapper.get('input').setValue('2')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('meldet ein geleertes Feld als null', async () => {
    const wrapper = mountInput(4)

    await wrapper.get('input').setValue('')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('gibt ungueltige Eingaben NICHT nach oben weiter', async () => {
    const wrapper = mountInput(2)

    await wrapper.get('input').setValue('9')

    // Der Fehler wird angezeigt, aber das Modell bleibt gueltig - das ist die
    // zentrale Zusage dieser Komponente.
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('nur 1–5')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('uebernimmt Aenderungen von aussen', async () => {
    const wrapper = mountInput(1)

    // Passiert real beim Klick auf "Zufällig ausfüllen" und beim Fachwechsel.
    await wrapper.setProps({ modelValue: 5 })

    expect(wrapper.get('input').element.value).toBe('5')
  })
})
