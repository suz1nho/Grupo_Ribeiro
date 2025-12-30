"use client"

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-bold mb-4">Grupo ribeiro</h4>
            <p className="text-white/60">
              Especialistas em consórcios com experiência e comprometimento com seus clientes.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <a href="#benefits" className="hover:text-white transition">
                  Benefícios
                </a>
              </li>
              <li>
                <a href="#requirements" className="hover:text-white transition">
                  Documentos
                </a>
              </li>
              <li>
                <a href="#scheduling" className="hover:text-white transition">
                  Agendar
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <p className="text-center text-white/60">© 2025 Grupo ribeiro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
