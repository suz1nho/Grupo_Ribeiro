"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, Users, Lock } from 'lucide-react'

export default function AdminMainPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ADMIN_PASSWORD = "admin"

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert("Senha incorreta")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-foreground mb-6 text-center">Acesso Admin</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-primary hover:bg-accent text-white">
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Painel Admin - Grupo Ribeiro</h1>
          <p className="text-muted-foreground text-lg">Selecione a opção desejada</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Link href="/admin/employees/register">
            <Card className="p-8 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center gap-4">
                <Users className="w-12 h-12 text-blue-600" />
                <h2 className="text-2xl font-bold text-foreground">Cadastrar Funcionários</h2>
                <p className="text-muted-foreground">Adicione novos funcionários ao sistema com acesso protegido por senha</p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/dashboard">
            <Card className="p-8 cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center gap-4">
                <Lock className="w-12 h-12 text-purple-600" />
                <h2 className="text-2xl font-bold text-foreground">Painel Administrativo</h2>
                <p className="text-muted-foreground">Acesso ao painel de gerenciamento usando sua senha de funcionário</p>
              </div>
            </Card>
          </Link>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              setIsAuthenticated(false)
              setPassword("")
            }}
            variant="outline"
            className="px-8"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
