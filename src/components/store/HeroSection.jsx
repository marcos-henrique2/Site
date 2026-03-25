import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Impressão 3D de Alta Qualidade
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-space leading-tight tracking-tight">
            Transforme Ideias em{' '}
            <span className="text-primary">Realidade</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Peças personalizadas, protótipos funcionais e produtos exclusivos impressos em 3D com materiais de primeira linha e acabamento impecável.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/produtos">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-semibold">
                Ver Produtos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="px-8">
                Encomenda Personalizada
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { icon: Layers, title: 'Diversos Materiais', desc: 'PLA, ABS, PETG, Resina e mais' },
            { icon: Zap, title: 'Produção Rápida', desc: 'Entrega em até 5 dias úteis' },
            { icon: Shield, title: 'Qualidade Garantida', desc: 'Acabamento profissional' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-card/60 backdrop-blur border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}