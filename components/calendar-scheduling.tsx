"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Appointment {
  id: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  creditAnalysis: boolean
  message: string
  confirmed: boolean
}

const HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export default function CalendarScheduling() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [step, setStep] = useState<"calendar" | "time" | "form">("calendar")
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", creditAnalysis: false, message: "" })
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const saved = localStorage.getItem("appointments")
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
  }, [])

  const saveAppointments = (data: Appointment[]) => {
    setAppointments(data)
    localStorage.setItem("appointments", JSON.stringify(data))
  }

  const isTimeBooked = (date: string, time: string) => {
    return appointments.some((apt) => apt.date === date && apt.time === time)
  }

  const isTimeConfirmed = (date: string, time: string) => {
    return appointments.some((apt) => apt.date === date && apt.time === time && apt.confirmed)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setStep("time")
  }

  const handleTimeSelect = (time: string) => {
    if (!isTimeBooked(selectedDate, time)) {
      setSelectedTime(time)
      setStep("form")
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      setStatus("error")
      return
    }

    const newAppointment: Appointment = {
      id: `${selectedDate}-${selectedTime}-${Date.now()}`,
      date: selectedDate,
      time: selectedTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      creditAnalysis: formData.creditAnalysis,
      message: formData.message,
      confirmed: false,
    }

    saveAppointments([...appointments, newAppointment])
    setStatus("success")

    setTimeout(() => {
      setStep("calendar")
      setSelectedDate("")
      setSelectedTime("")
      setFormData({ name: "", email: "", phone: "", creditAnalysis: false, message: "" })
      setStatus("idle")
    }, 3000)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getMinDate = () => {
    return new Date()
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Dias em branco antes do mês começar
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const isDateDisabled = (day: number) => {
    if (!day) return true
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const minDate = getMinDate()
    const maxDate = getMaxDate()
    return date < minDate || date > maxDate
  }

  const formatDateForSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toISOString().split("T")[0]
  }

  const calendarDays = generateCalendarDays()
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

  return (
    <section id="scheduling" className="py-20 px-4 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Agende Seu Atendimento</h2>
          <p className="text-lg text-muted-foreground">
            Selecione uma data e horário disponível para sua consultoria gratuita
          </p>
        </div>

        {step === "calendar" && (
          <Card className="p-8 bg-white border-border/50 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Selecione uma Data</h3>
            </div>

            <div className="bg-white rounded-lg border border-border p-6">
              {/* Header do calendário com navegação */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-semibold text-foreground">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do calendário */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (day) {
                        handleDateSelect(formatDateForSelect(day))
                      }
                    }}
                    disabled={isDateDisabled(day || 0)}
                    className={`p-3 rounded-lg font-semibold transition ${
                      !day
                        ? "bg-transparent"
                        : isDateDisabled(day)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-primary text-white hover:bg-accent cursor-pointer"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Selecione uma data de hoje até os próximos 30 dias
              </p>
            </div>
          </Card>
        )}

        {step === "time" && (
          <Card className="p-8 bg-white border-border/50 shadow-lg">
            <div className="mb-6">
              <Button onClick={() => setStep("calendar")} variant="outline" className="mb-4">
                ← Voltar
              </Button>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Selecione um Horário para {selectedDate}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {HOURS.map((hour) => {
                const booked = isTimeBooked(selectedDate, hour)
                const confirmed = isTimeConfirmed(selectedDate, hour)
                return (
                  <button
                    key={hour}
                    onClick={() => handleTimeSelect(hour)}
                    disabled={booked}
                    className={`py-3 px-4 rounded-lg font-semibold transition relative ${
                      booked
                        ? "bg-red-100 text-red-500 cursor-not-allowed opacity-50"
                        : "bg-primary text-white hover:bg-accent"
                    }`}
                  >
                    {hour} - {String(Number.parseInt(hour) + 1).padStart(2, "0")}:00
                    {confirmed && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        ✕
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Horários com <span className="font-bold">✕ vermelho</span> estão bloqueados (aguardando confirmação do
              administrador)
            </p>
          </Card>
        )}

        {step === "form" && (
          <Card className="p-8 bg-white border-border/50 shadow-lg">
            <div className="mb-6">
              <Button onClick={() => setStep("time")} variant="outline" className="mb-4">
                ← Voltar
              </Button>
              <h3 className="text-2xl font-bold text-foreground mb-2">Confirmação de Agendamento</h3>
              <p className="text-muted-foreground">
                Data: <span className="font-bold">{selectedDate}</span> | Horário:{" "}
                <span className="font-bold">
                  {selectedTime} - {String(Number.parseInt(selectedTime) + 1).padStart(2, "0")}:00
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Telefone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    placeholder="(XX) XXXXX-XXXX"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="creditAnalysis"
                  name="creditAnalysis"
                  checked={formData.creditAnalysis}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="creditAnalysis" className="text-sm font-semibold text-foreground cursor-pointer">
                  Solicitar Análise de Crédito
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Mensagem Adicional</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Conte-nos mais sobre suas necessidades..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {status === "success" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Agendamento Realizado com Sucesso!</p>
                    <p className="text-sm">Você receberá uma confirmação em breve.</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Erro ao Agendar</p>
                    <p className="text-sm">Por favor, preencha todos os campos obrigatórios.</p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-accent text-white font-semibold py-3">
                Confirmar Agendamento
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Precisamos dos seus dados para entrar em contato. Seus dados são confidenciais e seguros.
              </p>
            </form>
          </Card>
        )}
      </div>
    </section>
  )
}
