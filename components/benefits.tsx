"use client"

import { Card } from "@/components/ui/card"
import { Shield, Zap, CreditCard, Users, TrendingUp, Award } from 'lucide-react'
import { useEffect, useRef, useState } from "react"

export default function Benefits() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const benefits = [
    {
      icon: Shield,
      title: "Análise de Crédito Grátis",
      description: "Avaliamos seu perfil sem custo e sem compromisso.",
    },
    {
      icon: Zap,
      title: "Aprovação Rápida",
      description: "Processo ágil com resposta em até 24 horas.",
    },
    {
      icon: CreditCard,
      title: "Parcelas Flexíveis",
      description: "Adapte o pagamento ao seu orçamento.",
    },
    {
      icon: Users,
      title: "Atendimento Personalizado",
      description: "Equipe especializada pronta para ajudar você.",
    },
    {
      icon: TrendingUp,
      title: "Melhor Investimento",
      description: "Valorize seu patrimônio com segurança.",
    },
    {
      icon: Award,
      title: "50+ Anos de Mercado",
      description: "Experiência e tradição que você pode confiar.",
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
    <section id="benefits" ref={sectionRef} className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 opacity-0" style={{
          animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
        }}>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Por Que Escolher o Grupo Ribeiro?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Somos especialistas em consórcios com décadas de experiência e milhares de clientes satisfeitos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 bg-card border-border/50 hover:border-primary/30 group opacity-0 hover:scale-105"
                style={{
                  animation: isVisible ? `scaleIn 0.6s ease-out forwards ${index * 0.1}s` : 'none'
                }}
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
