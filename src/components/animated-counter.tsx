"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

interface AnimatedCounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  title: string
  description?: string
  icon?: React.ReactNode
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  title,
  description,
  icon,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef<number>(0)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      const startTime = Date.now()
      const timer = setInterval(() => {
        const timePassed = Date.now() - startTime
        const progress = Math.min(timePassed / duration, 1)

        // Easing function for smoother animation
        const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

        countRef.current = Math.floor(easedProgress * end)
        setCount(countRef.current)

        if (progress === 1) {
          clearInterval(timer)
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [inView, end, duration])

  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
      {icon && <div className="mb-4 text-blue-600">{icon}</div>}
      <div className="text-4xl font-bold text-blue-600 mb-2">
        {prefix}
        {count}
        {suffix}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600 text-sm">{description}</p>}
    </div>
  )
}
