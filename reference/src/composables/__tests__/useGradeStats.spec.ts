import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useGradeStats } from '@/composables/useGradeStats'
import type { Grade } from '@/types/domain'

describe('useGradeStats', () => {
  it('rechnet ueber eine einfache Liste', () => {
    const stats = useGradeStats([1, 2, 3, null])

    expect(stats.count.value).toBe(3)
    expect(stats.total.value).toBe(4)
    expect(stats.average.value).toBe(2)
    expect(stats.isComplete.value).toBe(false)
  })

  it('reagiert auf Aenderungen an einem ref', () => {
    const grades = ref<(Grade | null)[]>([5, 5])
    const stats = useGradeStats(grades)

    expect(stats.average.value).toBe(5)

    // Das ist der eigentliche Punkt: die Kennzahlen sind computed und
    // aktualisieren sich, wenn sich die Quelle aendert. Haette das Composable
    // ein einfaches Array als Parameter, bliebe der Wert bei 5 stehen.
    grades.value = [1, 1]

    expect(stats.average.value).toBe(1)
    expect(stats.passRate.value).toBe(100)
  })

  it('reagiert auch auf einen Getter', () => {
    const grades = ref<(Grade | null)[]>([4])
    const stats = useGradeStats(() => grades.value)

    grades.value = [4, 5]

    expect(stats.distribution.value).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 })
  })

  it('kommt mit einer leeren Liste klar', () => {
    const stats = useGradeStats([])

    expect(stats.isEmpty.value).toBe(true)
    expect(stats.average.value).toBeNull()
    // peak ist mindestens 1, damit die Division im Diagramm nie durch 0 geht.
    expect(stats.peak.value).toBe(1)
  })
})
