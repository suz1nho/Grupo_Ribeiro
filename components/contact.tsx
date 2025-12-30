"use client"

import { MapPin, Phone, Instagram } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-4 bg-primary text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-lg text-white/80">Estamos prontos para atender você</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Localização</h3>
            <p className="text-white/80">
              Gênesis Office
              <br />
              Sala 709
              <br />
              Anápolis - GO
            </p>
            <a
              href="https://maps.app.goo.gl/gS2XaxnD2e7ZUDGg6"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-semibold"
            >
              Ver no Mapa →
            </a>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fale Conosco</h3>
            <p className="text-white/80 mb-2">Atendimento de segunda a sexta</p>
            <a
              href="https://wa.me/5562992670853"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary/80 font-semibold"
            >
              +55 62 9267-0853
            </a>
            <p className="text-white/60 text-sm mt-2">Falar com Anderson</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <Instagram className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Redes Sociais</h3>
            <p className="text-white/80 mb-4">Acompanhe nossas atualizações</p>
            <a
              href="https://instagram.com/ribeiro_representacoes_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-secondary/90 transition"
            >
              <Instagram className="w-5 h-5" />
              ribeiro_representacoes_
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
