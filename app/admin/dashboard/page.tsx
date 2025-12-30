"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, X, Calendar, Clock, User, Mail, Phone, BarChart3, Users, ArrowLeft, Printer, MessageSquare } from 'lucide-react'

interface Appointment {
  id: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  creditAnalysis?: boolean
  message?: string
  confirmed: boolean
  attendant?: string
  contractDone?: boolean
  confirmedBy?: string
}

interface Employee {
  id: string
  name: string
  password: string
  position?: string
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeName, setEmployeeName] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<string>("")
  const [currentPosition, setCurrentPosition] = useState<string>("")
  const [selectedAttendant, setSelectedAttendant] = useState<string | null>(null)
  const [attendantName, setAttendantName] = useState("")
  const [attendantSuggestions, setAttendantSuggestions] = useState<string[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showContractModal, setShowContractModal] = useState<string | null>(null)

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

  const handleLogin = () => {
    const employee = employees.find(emp => emp.name === employeeName && emp.password === password)
    if (employee) {
      setIsAuthenticated(true)
      setCurrentEmployee(employee.name)
      setCurrentPosition(employee.position || "")
    } else {
      alert("Nome do funcionário ou senha incorretos")
      setPassword("")
      setEmployeeName("")
    }
  }

  const handleAttendantChange = (value: string) => {
    setAttendantName(value)
    if (value.trim()) {
      const suggestions = employees
        .map(emp => emp.name)
        .filter(name => name.toLowerCase().includes(value.toLowerCase()))
      setAttendantSuggestions(suggestions)
    } else {
      setAttendantSuggestions([])
    }
  }

  const toggleConfirm = (id: string) => {
    const updated = appointments.map((apt) => 
      apt.id === id ? { ...apt, confirmed: !apt.confirmed } : apt
    )
    setAppointments(updated)
    localStorage.setItem("appointments", JSON.stringify(updated))
    setSelectedAttendant(null)
    setAttendantName("")
    setAttendantSuggestions([])
  }

  const handleConfirmWithAttendant = (id: string) => {
    const updated = appointments.map((apt) => 
      apt.id === id ? { ...apt, confirmed: true, attendant: attendantName, confirmedBy: currentEmployee } : apt
    )
    setAppointments(updated)
    localStorage.setItem("appointments", JSON.stringify(updated))
    setSelectedAttendant(null)
    setAttendantName("")
    setAttendantSuggestions([])
  }

  const toggleContractDone = (id: string) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, contractDone: !apt.contractDone } : apt
    )
    setAppointments(updated)
    localStorage.setItem("appointments", JSON.stringify(updated))
    setShowContractModal(null)
  }

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter((apt) => apt.id !== id)
    setAppointments(updated)
    localStorage.setItem("appointments", JSON.stringify(updated))
    setDeleteConfirmId(null)
  }

  const printAppointment = (apt: Appointment) => {
    const printWindow = window.open('', '', 'height=400,width=600')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Agendamento - ${apt.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .info { margin: 15px 0; }
              .label { font-weight: bold; color: #333; }
              .value { color: #666; }
              .status { padding: 10px; background-color: ${apt.confirmed ? '#dcfce7' : '#fef2f2'}; margin-top: 20px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Dados do Agendamento</h2>
              <p>Grupo ribeiro</p>
            </div>
            <div class="info">
              <span class="label">Data:</span>
              <span class="value">${apt.date}</span>
            </div>
            <div class="info">
              <span class="label">Horário:</span>
              <span class="value">${apt.time} - ${String(Number.parseInt(apt.time) + 1).padStart(2, "0")}:00</span>
            </div>
            <div class="info">
              <span class="label">Nome:</span>
              <span class="value">${apt.name}</span>
            </div>
            <div class="info">
              <span class="label">Email:</span>
              <span class="value">${apt.email}</span>
            </div>
            <div class="info">
              <span class="label">Telefone:</span>
              <span class="value">${apt.phone}</span>
            </div>
            ${apt.creditAnalysis ? `
              <div class="info">
                <span class="label">Análise de Crédito:</span>
                <span class="value">Solicitada</span>
              </div>
            ` : ''}
            ${apt.message ? `
              <div class="info">
                <span class="label">Mensagem:</span>
                <span class="value">${apt.message}</span>
              </div>
            ` : ''}
            ${apt.attendant ? `
              <div class="info">
                <span class="label">Atendente:</span>
                <span class="value">${apt.attendant}</span>
              </div>
            ` : ''}
            <div class="info">
              <span class="label">Contrato Feito:</span>
              <span class="value">${apt.contractDone ? 'Sim' : 'Não'}</span>
            </div>
            <div class="status">
              <span class="label">Status:</span>
              <span class="value">${apt.confirmed ? 'Presença Confirmada' : 'Aguardando Confirmação'}</span>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const totalAppointments = appointments.length
  const confirmedAppointments = appointments.filter(apt => apt.confirmed).length
  const contractsDone = appointments.filter(apt => apt.contractDone).length
  
  const vendorRank = employees.map(emp => ({
    name: emp.name,
    confirmations: appointments.filter(apt => apt.confirmed && apt.attendant === emp.name).length
  })).sort((a, b) => b.confirmations - a.confirmations)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Painel Administrativo</h1>
          <p className="text-center text-muted-foreground mb-6">Faça login com seus dados de funcionário</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Nome do Funcionário</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Sua Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-primary hover:bg-accent text-white">
              Entrar
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Logado como: <span className="font-semibold">{currentEmployee}</span> ({currentPosition})</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/rank">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Ver Ranking
              </Button>
            </Link>
            <Button
              onClick={() => {
                setIsAuthenticated(false)
                setPassword("")
                setCurrentEmployee("")
                setCurrentPosition("")
              }}
              variant="outline"
            >
              Sair
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Agendamentos</p>
                <p className="text-4xl font-bold text-foreground">{totalAppointments}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Confirmados</p>
                <p className="text-4xl font-bold text-green-600">{confirmedAppointments}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contratos Fechados</p>
                <p className="text-4xl font-bold text-purple-600">{contractsDone}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Taxa Confirmação</p>
                <p className="text-4xl font-bold text-red-600">
                  {totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          {appointments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-lg">Nenhum agendamento no momento</p>
            </Card>
          ) : (
            appointments
              .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
              .map((apt) => {
                const isConfirmedByCurrentEmployee = apt.confirmedBy === currentEmployee
                
                return (
                  <Card
                    key={apt.id}
                    className={`p-6 border-2 ${apt.confirmed ? "border-red-300 bg-red-50" : "border-border"}`}
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p className="font-semibold text-foreground">{apt.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Horário</p>
                            <p className="font-semibold text-foreground">
                              {apt.time} - {String(Number.parseInt(apt.time) + 1).padStart(2, "0")}:00
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-semibold text-foreground">{apt.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold text-foreground">{apt.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <p className="font-semibold text-foreground">{apt.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {apt.confirmed && isConfirmedByCurrentEmployee && (apt.creditAnalysis || apt.message) && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        {apt.creditAnalysis && (
                          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Análise de Crédito</p>
                              <p className="text-sm text-blue-700">Cliente solicitou análise de crédito</p>
                            </div>
                          </div>
                        )}
                        {apt.message && (
                          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-amber-900 mb-1">Mensagem Adicional</p>
                              <p className="text-sm text-amber-700">{apt.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedAttendant === apt.id ? (
                      <div className="mt-6 pt-6 border-t border-border space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Nome do Atendente</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={attendantName}
                              onChange={(e) => handleAttendantChange(e.target.value)}
                              placeholder="Digite o nome de quem atenderá"
                              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {attendantSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-border border-t-0 rounded-b-lg z-10 max-h-40 overflow-y-auto">
                                {attendantSuggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setAttendantName(suggestion)
                                      setAttendantSuggestions([])
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-primary/10 transition"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            onClick={() => {
                              setSelectedAttendant(null)
                              setAttendantSuggestions([])
                            }} 
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleConfirmWithAttendant(apt.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            disabled={!attendantName.trim()}
                          >
                            Confirmar com Atendente
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-6 border-t border-border flex gap-3 justify-end flex-wrap">
                        {!apt.confirmed && (
                          <Button
                            onClick={() => setSelectedAttendant(apt.id)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirmar Presença
                          </Button>
                        )}
                        {apt.confirmed && isConfirmedByCurrentEmployee && (
                          <Button
                            onClick={() => toggleConfirm(apt.id)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                            Desconfirmar
                          </Button>
                        )}
                        {apt.confirmed && isConfirmedByCurrentEmployee && (
                          <Button
                            onClick={() => setShowContractModal(apt.id)}
                            className={`flex items-center gap-2 ${apt.contractDone ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {apt.contractDone ? 'Contrato Feito' : 'Marcar Contrato'}
                          </Button>
                        )}
                        {apt.confirmed && isConfirmedByCurrentEmployee && (
                          <Button
                            onClick={() => printAppointment(apt)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Printer className="w-4 h-4" />
                            Imprimir
                          </Button>
                        )}
                        {currentPosition === "Administrativo" && (
                          <Button 
                            onClick={() => setDeleteConfirmId(apt.id)}
                            className="bg-destructive hover:bg-red-700"
                          >
                            Deletar
                          </Button>
                        )}
                      </div>
                    )}

                    {apt.confirmed && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="font-semibold text-red-700">Presença confirmada - Horário bloqueado</p>
                        {apt.attendant && <p className="text-sm text-red-600">Atendente: {apt.attendant}</p>}
                        {apt.contractDone && <p className="text-sm text-blue-600">Contrato: Fechado</p>}
                      </div>
                    )}
                  </Card>
                )
              })
          )}
        </div>

        {showContractModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-foreground mb-4">Contrato Feito</h3>
              <p className="text-muted-foreground mb-6">
                {appointments.find(a => a.id === showContractModal)?.contractDone 
                  ? 'Deseja remover a marcação de contrato fechado?'
                  : 'Deseja marcar este contrato como fechado?'
                }
              </p>
              <div className="flex gap-3 justify-end">
                <Button 
                  onClick={() => setShowContractModal(null)} 
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => toggleContractDone(showContractModal)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirmar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-foreground mb-4">Confirmar Deleção</h3>
              <p className="text-muted-foreground mb-6">Tem certeza que deseja deletar este agendamento? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3 justify-end">
                <Button 
                  onClick={() => setDeleteConfirmId(null)} 
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => deleteAppointment(deleteConfirmId)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Deletar
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-3">Instruções:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Clique em "Confirmar Presença" e digite o nome de quem atenderá (sugestões aparecem automaticamente)</li>
            <li>Quando confirmado, o horário fica marcado com "✕" vermelho no calendário do cliente</li>
            <li>Apenas o funcionário que confirmou pode desconfirmar, imprimir e marcar contrato</li>
            <li>Após confirmação, clique em "Marcar Contrato" para registrar que o contrato foi fechado</li>
            <li>Clique em "Imprimir" para imprimir os dados do agendamento (inclui contrato feito)</li>
            <li>Somente administradores com cargo "Administrativo" podem deletar agendamentos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
