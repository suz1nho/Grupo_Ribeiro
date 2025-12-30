"use client"

import { useEffect, useRef, useState } from "react"

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({ years: 0, clients: 0, approval: 0, hours: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  const stats = [
    {
      value: "50+",
      targetValue: 50,
      label: "Anos de Experiência",
      key: "years" as const,
    },
    {
      value: "10k+",
      targetValue: 10,
      label: "Clientes Satisfeitos",
      key: "clients" as const,
      suffix: "k+"
    },
    {
      value: "98%",
      targetValue: 98,
      label: "Taxa de Aprovação",
      key: "approval" as const,
      suffix: "%"
    },
    {
      value: "24h",
      targetValue: 24,
      label: "Análise Rápida",
      key: "hours" as const,
      suffix: "h"
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    stats.forEach((stat) => {
      let currentStep = 0
      const increment = stat.targetValue / steps

      const timer = setInterval(() => {
        currentStep++
        setCounts((prev) => ({
          ...prev,
          [stat.key]: Math.min(Math.floor(increment * currentStep), stat.targetValue),
        }))

        if (currentStep >= steps) {
          clearInterval(timer)
        }
      }, stepDuration)
    })
  }, [isVisible])

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center opacity-0"
              style={{
                animation: isVisible ? `fadeInUp 0.6s ease-out forwards ${index * 0.15}s` : 'none'
              }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.key === "clients" ? `${counts[stat.key]}k+` :
                 stat.key === "approval" ? `${counts[stat.key]}%` :
                 stat.key === "hours" ? `${counts[stat.key]}h` :
                 `${counts[stat.key]}+`}
              </div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
