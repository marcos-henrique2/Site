import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Printer className="w-5 h-5 text-primary" />
              </div>
              <span className="font-space font-bold text-lg">
                Print<span className="text-primary">3D</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Impressão 3D de alta qualidade. Peças personalizadas, protótipos e produtos exclusivos.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider">Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Início</Link>
              <Link to="/produtos" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Produtos</Link>
              <Link to="/categorias" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Categorias</Link>
              <Link to="/contato" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider">Materiais</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>PLA</p>
              <p>ABS</p>
              <p>PETG</p>
              <p>Resina</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>contato@print3d.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Print3D. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}