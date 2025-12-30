"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, ArrowLeft, Trophy, Award, Zap } from 'lucide-react'

interface Appointment {
  id: string
  confirmed: boolean
  attendant?: string
  contractDone?: boolean
}

interface Employee {
  id: string
  name: string
}

export default function RankPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("appointments")
    const savedEmployees = localStorage.getItem("employees")
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    }
  }, [])

  const vendorRank = employees.map(emp => ({
    name: emp.name,
    confirmations: appointments.filter(apt => apt.confirmed && apt.attendant === emp.name).length,
    contracts: appointments.filter(apt => apt.contractDone && apt.attendant === emp.name).length
  })).sort((a, b) => b.confirmations - a.confirmations)

  const totalConfirmed = appointments.filter(apt => apt.confirmed).length
  const totalContracts = appointments.filter(apt => apt.contractDone).length

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Ranking de Funcionários</h1>
              <p className="text-muted-foreground">Desempenho de confirmações e contratos</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90 mb-1">Total de Confirmações</p>
                <p className="text-5xl font-bold">{totalConfirmed}</p>
              </div>
              <BarChart3 className="w-16 h-16 opacity-30" />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90 mb-1">Total de Contratos Fechados</p>
                <p className="text-5xl font-bold">{totalContracts}</p>
              </div>
              <Trophy className="w-16 h-16 opacity-30" />
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          {vendorRank.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">Nenhum funcionário cadastrado ainda</p>
            </Card>
          ) : vendorRank.filter(v => v.confirmations > 0).length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">Nenhuma confirmação registrada ainda</p>
            </Card>
          ) : (
            vendorRank.map((vendor, idx) => (
              <Card key={idx} className={`p-6 border-2 transition-all ${
                idx === 0 ? 'bg-yellow-50 border-yellow-300' :
                idx === 1 ? 'bg-gray-50 border-gray-300' :
                idx === 2 ? 'bg-orange-50 border-orange-300' :
                'border-border'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-16 h-16">
                      {idx === 0 && <Trophy className="w-12 h-12 text-yellow-500" />}
                      {idx === 1 && <Award className="w-12 h-12 text-gray-500" />}
                      {idx === 2 && <Zap className="w-12 h-12 text-orange-500" />}
                      {idx > 2 && <span className="text-4xl font-bold text-muted-foreground">#{idx + 1}</span>}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">Posição {idx + 1}</p>
                      <h3 className="text-3xl font-bold text-foreground">{vendor.name}</h3>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Confirmações</p>
                      <p className="text-4xl font-bold text-primary">{vendor.confirmations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contratos Fechados</p>
                      <p className="text-2xl font-bold text-purple-600">{vendor.contracts}</p>
                    </div>
                  </div>
                </div>

                {idx === 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-700">Maior número de confirmações!</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <h3 className="font-semibold text-foreground mb-2">Informações do Ranking</h3>
          <p className="text-muted-foreground">Este ranking mostra a quantidade de agendamentos confirmados e contratos fechados por cada funcionário.</p>
        </div>
      </div>
    </div>
  )
}
