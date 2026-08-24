import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseDialog from '@/components/base/BaseDialog.vue'

function mountDialog(modelValue = false) {
  return mount(BaseDialog, {
    props: { modelValue, title: 'Zugänge' },
    slots: { default: '<p>Inhalt</p>' },
    attachTo: document.body,
  })
}

describe('BaseDialog', () => {
  it('startet geschlossen', () => {
    expect(mountDialog(false).get('dialog').element.open).toBe(false)
  })

  it('oeffnet, wenn das Model auf true geht', async () => {
    const wrapper = mountDialog(false)

    await wrapper.setProps({ modelValue: true })

    expect(wrapper.get('dialog').element.open).toBe(true)
  })

  it('schliesst wieder', async () => {
    const wrapper = mountDialog(false)
    await wrapper.setProps({ modelValue: true })

    await wrapper.setProps({ modelValue: false })

    expect(wrapper.get('dialog').element.open).toBe(false)
  })

  it('meldet zurueck, wenn der Browser selbst schliesst', async () => {
    // Das ist der Fall, der ohne @close-Handler stillschweigend kaputtgeht:
    // Escape schliesst das native <dialog>, ohne dass Vue etwas mitbekommt.
    // Das Model bliebe auf true stehen - und ein erneuter Klick auf den
    // oeffnenden Knopf taete nichts.
    const wrapper = mountDialog(true)

    wrapper.get('dialog').element.dispatchEvent(new Event('close'))

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('schliesst beim Klick auf die Abdunklung', async () => {
    const wrapper = mountDialog(true)

    // Ein Klick auf das <dialog> selbst ist ein Klick daneben - der Inhalt
    // liegt in Kindelementen.
    await wrapper.get('dialog').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('laesst Klicks im Inhalt in Ruhe', async () => {
    const wrapper = mountDialog(true)

    await wrapper.get('p').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('zeigt Titel und Slot-Inhalt', () => {
    const wrapper = mountDialog(true)

    expect(wrapper.text()).toContain('Zugänge')
    expect(wrapper.text()).toContain('Inhalt')
  })
})
