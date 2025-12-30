"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trash2, Plus } from 'lucide-react'

interface Employee {
  id: string
  name: string
  phone: string
  email: string
  cpf: string
  birthDate: string
  emergencyContact: string
  address: string
  position: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    birthDate: "",
    emergencyContact: "",
    address: "",
    position: ""
  })

  const positions = ["Administrador", "Consultor", "Gerente", "Diretor", "Administrativo"]

  useEffect(() => {
    const saved = localStorage.getItem("employees")
    if (saved) {
      setEmployees(JSON.parse(saved))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddEmployee = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.cpf.trim()) {
      alert("Por favor, preencha os campos obrigatórios")
      return
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...formData
    }

    const updated = [...employees, newEmployee]
    setEmployees(updated)
    localStorage.setItem("employees", JSON.stringify(updated))
    
    setFormData({
      name: "",
      phone: "",
      email: "",
      cpf: "",
      birthDate: "",
      emergencyContact: "",
      address: "",
      position: ""
    })
    setShowForm(false)
  }

  const deleteEmployee = (id: string) => {
    const updated = employees.filter(emp => emp.id !== id)
    setEmployees(updated)
    localStorage.setItem("employees", JSON.stringify(updated))
    setDeleteConfirmId(null)
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Gestão de Funcionários</h1>
              <p className="text-muted-foreground">Total: {employees.length} funcionários</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Funcionário
          </Button>
        </div>

        {showForm && (
          <Card className="p-8 mb-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-foreground mb-6">Cadastrar Novo Funcionário</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite o nome completo"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Telefone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(XX) XXXXX-XXXX"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="XXX.XXX.XXX-XX"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Contato de Emergência</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Nome e telefone"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, bairro, cidade"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Cargo</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um cargo</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                onClick={() => setShowForm(false)} 
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddEmployee}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Adicionar Funcionário
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-4">
          {employees.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-lg">Nenhum funcionário cadastrado</p>
            </Card>
          ) : (
            employees.map(emp => (
              <Card key={emp.id} className="p-6 border-2">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{emp.name}</h3>
                    <div className="space-y-2">
                      <p><span className="font-semibold text-muted-foreground">Cargo:</span> {emp.position || "—"}</p>
                      <p><span className="font-semibold text-muted-foreground">CPF:</span> {emp.cpf}</p>
                      <p><span className="font-semibold text-muted-foreground">Data de Nascimento:</span> {emp.birthDate || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p><span className="font-semibold text-muted-foreground">Telefone:</span> {emp.phone}</p>
                    <p><span className="font-semibold text-muted-foreground">Email:</span> {emp.email}</p>
                    <p><span className="font-semibold text-muted-foreground">Contato de Emergência:</span> {emp.emergencyContact || "—"}</p>
                    <p><span className="font-semibold text-muted-foreground">Endereço:</span> {emp.address || "—"}</p>
                  </div>
                </div>

                {deleteConfirmId === emp.id ? (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="p-6 max-w-sm w-full">
                      <h3 className="text-lg font-bold text-foreground mb-4">Confirmar Deleção</h3>
                      <p className="text-muted-foreground mb-6">Tem certeza que deseja deletar {emp.name}? Esta ação não pode ser desfeita.</p>
                      <div className="flex gap-3 justify-end">
                        <Button 
                          onClick={() => setDeleteConfirmId(null)} 
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => deleteEmployee(emp.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Deletar
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      onClick={() => setDeleteConfirmId(emp.id)}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
