/**
 * Логіка «Показати ще» без розмітки.
 *
 * Використання:
 *   const { visibleItems, hiddenCount, showMore, collapse } = useShowMore(items, 4)
 *
 * Вимоги — у тестах tests/useShowMore.test.jsx.
 */
import { useState } from 'react'

export function useShowMore(items, step = 3) {
  const [visibleCount, setVisibleCount] = useState(step)
  const visibleItems = items.slice(0, visibleCount)
  const hiddenCount = items.length - visibleItems.length

  function showMore() {
    setVisibleCount((previous) => Math.min(items.length, previous + step))
  }

  function collapse() {
    setVisibleCount(step)
  }

  return { visibleItems, hiddenCount, showMore, collapse }
}
