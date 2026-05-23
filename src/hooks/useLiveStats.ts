import { useState, useEffect } from "react"

export function useLiveStats() {
  const [liveDrivers, setLiveDrivers] = useState(12)
  const [liveCars, setLiveCars] = useState(4)
  const [liveCongonhasRuns, setLiveCongonhasRuns] = useState(27)

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDrivers(prev => Math.max(8, Math.min(22, prev + (Math.random() > 0.5 ? 1 : -1))))
      setLiveCongonhasRuns(prev => Math.max(15, Math.min(45, prev + (Math.random() > 0.6 ? 2 : -2))))
      if (Math.random() > 0.85) {
        setLiveCars(prev => Math.max(2, Math.min(6, prev + (Math.random() > 0.5 ? 1 : -1))))
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return { liveDrivers, liveCars, liveCongonhasRuns }
}
