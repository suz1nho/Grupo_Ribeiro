"use client"

import { Card } from "@/components/ui/card"
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from "react"

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const steps = [
    {
      number: "1",
      title: "Agende sua Consulta",
      description: "Escolha o melhor horário para você através do nosso sistema de agendamento online.",
    },
    {
      number: "2",
      title: "Envie seus Documentos",
      description: "Prepare os documentos necessários e nos envie de forma segura e digital.",
    },
    {
      number: "3",
      title: "Análise de Crédito",
      description: "Nossa equipe analisa seu perfil gratuitamente em até 24 horas.",
    },
    {
      number: "4",
      title: "Aproveite seu Consórcio",
      description: "Receba a aprovação e comece a realizar seus sonhos com segurança.",
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 opacity-0" style={{
          animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
        }}>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Como Funciona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Processo simples e transparente em 4 passos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative opacity-0" style={{
              animation: isVisible ? `fadeInUp 0.6s ease-out forwards ${index * 0.15}s` : 'none'
            }}>
              <Card className="p-6 h-full bg-card border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group hover:scale-105 duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
