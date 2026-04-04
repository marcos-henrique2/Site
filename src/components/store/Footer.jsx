import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Coluna 1: Sobre a Loja */}
          <div>
            <h3 className="text-xl font-bold font-space text-primary mb-4">Mallki Print</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Especialistas em materializar ideias através da impressão 3D em PLA e PETG. Qualidade, precisão e paixão em cada detalhe, desde peças decorativas até utilitários.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/produtos" className="text-muted-foreground hover:text-primary transition-colors">Todos os Produtos</Link></li>
              <li><Link to="/categorias" className="text-muted-foreground hover:text-primary transition-colors">Categorias</Link></li>
              <li><Link to="/carrinho" className="text-muted-foreground hover:text-primary transition-colors">Carrinho</Link></li>
              <li><Link to="/contato" className="text-muted-foreground hover:text-primary transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contatos e Redes */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Atendimento</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" /> (62) 99288-2262
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" /> mallkiprint@gmail.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> Goiânia, GO - Envios para todo o Brasil
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Mallki Print. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}