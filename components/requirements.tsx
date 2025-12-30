"use client"

import { Card } from "@/components/ui/card"
import { FileText, CreditCard, MapPin, DollarSign } from 'lucide-react'

export default function Requirements() {
  const requirements = [
    {
      icon: FileText,
      label: "CPF e RG ou CNH",
      description: "Documentos de identificação válidos",
    },
    {
      icon: MapPin,
      label: "Comprovante de Endereço",
      description: "Recente (até 90 dias)",
    },
    {
      icon: DollarSign,
      label: "Comprovante de Renda",
      description: "Holerite, extrato ou declaração",
    },
    {
      icon: CreditCard,
      label: "Dados Bancários",
      description: "Para débito automático das parcelas",
    },
  ]

  return (
    <section id="requirements" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Documentos Necessários</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tenha estes documentos em mãos para agilizar sua análise de crédito
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {requirements.map((req, index) => {
            const Icon = req.icon
            return (
              <Card key={index} className="p-6 bg-card border-border/50 hover:border-primary/30 transition text-center group">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{req.label}</h3>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
