"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface HeroProps {
  scrollY: number
}

export default function Hero({ scrollY }: HeroProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl transition-transform duration-1000"
          style={{
            transform: mounted ? 'scale(1)' : 'scale(0)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl transition-transform duration-1000 delay-300"
          style={{
            transform: mounted ? 'scale(1)' : 'scale(0)',
            animation: 'pulse 4s ease-in-out infinite 2s'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 opacity-0 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Análise de crédito 100% gratuita
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Realize Seus Sonhos com <span className="text-primary">Consórcio</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Adquira seu bem com segurança e tranquilidade. Mais de 50 anos de experiência no mercado,
            ajudando você a conquistar seus objetivos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a href="#scheduling">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 text-base h-12 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Agendar Consulta Gratuita
              </Button>
            </a>
            <a href="#benefits">
              <Button size="lg" variant="outline" className="px-8 text-base h-12 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Conhecer Benefícios
              </Button>
            </a>
          </div>

          <div className="pt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-2 transition-all duration-300 hover:text-primary hover:scale-110">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span>Sem burocracia</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-300 hover:text-primary hover:scale-110">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span>Processo rápido</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-300 hover:text-primary hover:scale-110">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span>100% seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
