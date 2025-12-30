"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Grupo Ribeiro Logo" width={40} height={40} className="w-10 h-10" />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#benefits" className="text-foreground hover:text-primary transition">
            Benefícios
          </a>
          <a href="#requirements" className="text-foreground hover:text-primary transition">
            Documentos
          </a>
          <a href="#scheduling" className="text-foreground hover:text-primary transition">
            Agendar
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition">
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#scheduling">
            <Button className="bg-primary hover:bg-accent text-white">Agende Agora</Button>
          </a>
          <a href="/admin">
            <Button variant="outline">Admin</Button>
          </a>
        </div>
      </div>
    </header>
  )
}
