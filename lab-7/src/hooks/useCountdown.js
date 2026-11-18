/**
 * Зворотний відлік від `totalSeconds` до нуля, по секунді.
 *
 * Використання:
 *   const { secondsLeft, isRunning, start, pause, reset } = useCountdown(180)
 *
 * Вимоги — у тестах tests/useCountdown.test.jsx.
 */
import { useEffect, useState } from 'react'

export function useCountdown(totalSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)

  const isCountingDown = isRunning && secondsLeft > 0

  useEffect(() => {
    if (!isCountingDown) return

    const intervalId = setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1))
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [isCountingDown])

  function start() {
    if (secondsLeft > 0) {
      setIsRunning(true)
    }
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }

  return {
    secondsLeft,
    isRunning: isCountingDown,
    start,
    pause,
    reset,
  }
}
