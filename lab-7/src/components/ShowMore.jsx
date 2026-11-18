/**
 * Показує перші `step` елементів з `items` і кнопку, що показує наступні.
 *
 * Використання:
 *   <ShowMore items={reviews} step={3}>
 *     {(visibleItems) => <ul>…</ul>}
 *   </ShowMore>
 *
 * Вимоги — у тестах tests/ShowMore.test.jsx.
 */
import { useState } from 'react'

export default function ShowMore({ items, step, children }) {
  const [visibleCount, setVisibleCount] = useState(step)

  const visibleItems = items.slice(0, visibleCount)
  const hiddenCount = Math.max(0, items.length - visibleCount)
  const nextCount = Math.min(step, hiddenCount)

  function handleClick() {
    if (hiddenCount > 0) {
      setVisibleCount((previous) => previous + nextCount)
    } else {
      setVisibleCount(step)
    }
  }
  return (
    <>
      {children(visibleItems)}
      {items.length > step && (
        <button type="button" className="show-more" onClick={handleClick}>
          {hiddenCount > 0 ? `Показати ще ${nextCount}` : 'Згорнути'}
        </button>
      )}
    </>
  )
}
