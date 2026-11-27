/**
 * Ред'юсер вищого порядку: отримує ред'юсер і повертає новий, який веде
 * історію змін. Стан нового ред'юсера — історія:
 *
 *   { past: [...], present, future: [...] }
 *
 * present — стан, з яким працює reducer; past — попередні стани, від
 * найстарішого до останнього; future — скасовані стани, які можна
 * повторити, від найближчого.
 *
 * Дії:
 *   { type: 'undo' }  повертає попередній стан
 *   { type: 'redo' }  повторює скасовану дію
 *   будь-яка інша дія йде в reducer разом із present. Якщо reducer
 *   повернув той самий стан, історія не змінюється.
 *
 * Історія зберігає не більше limit кроків. Як і будь-який ред'юсер, новий
 * ред'юсер не змінює історію, яку отримав.
 *
 * Використання на прикладі лічильника:
 *   const undoableCounter = withUndo(counterReducer)
 *   undoableCounter(createHistory(0), { type: 'incremented' })
 *   // { past: [0], present: 1, future: [] }
 *
 * Поки що кидає помилку. Вимоги — у тестах tests/withUndo.test.js і
 * tests/HistoryButtons.test.jsx.
 */
export function withUndo(reducer, limit = 20) {
  return function undoableReducer(history, action) {
    if (action.type === 'undo') {
      if (history.past.length === 0) return history

      const previous = history.past[history.past.length - 1]
      const newPast = history.past.slice(0, -1)
      const newFuture = [history.present, ...history.future]

      return {
        past: newPast,
        present: previous,
        future: newFuture,
      }
    }

    if (action.type === 'redo') {
      if (history.future.length === 0) return history

      const next = history.future[0]
      const newFuture = history.future.slice(1)
      const newPast = [...history.past, history.present]

      return {
        past: newPast,
        present: next,
        future: newFuture,
      }
    }

    const nextPresent = reducer(history.present, action)
    if (nextPresent === history.present) {
      return history
    }

    const newPast = [...history.past, history.present]
    return {
      past:
        newPast.length > limit
          ? newPast.slice(newPast.length - limit)
          : newPast,
      present: nextPresent,
      future: [],
    }
  }
}

/** Історія, з якої починають: present і порожні past та future. */
export function createHistory(present) {
  return {
    past: [],
    present,
    future: [],
  }
}
