import React from 'react';
import { Mail, Phone, MapPin, Clock, Instagram, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold font-space mb-4">Fale Conosco</h1>
        <p className="text-lg text-muted-foreground">
          Tem alguma dúvida, precisa de um orçamento para um projeto especial em 3D ou quer saber o status do seu pedido? Estamos prontos para ajudar!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Lado Esquerdo: Informações de Contato */}
        <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Nossos Canais</h2>
          <div className="space-y-8">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">WhatsApp / Telefone</h3>
                <p className="text-muted-foreground mt-1">Fale diretamente com o Marcos para atendimento rápido.</p>
                <a href="https://wa.me/5562992882262" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 font-medium text-primary hover:underline">
                  (62) 99288-2262
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">E-mail</h3>
                <p className="text-muted-foreground mt-1">Para orçamentos detalhados e envio de arquivos STL.</p>
                <a href="mailto:mallkiprint@gmail.com" className="inline-block mt-2 font-medium text-primary hover:underline">
                  mallkiprint@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Localização</h3>
                <p className="text-muted-foreground mt-1">Goiânia, Goiás</p>
                <p className="text-muted-foreground">Enviamos para todo o Brasil!</p>
              </div>
            </div>

          </div>
        </div>

        {/* Lado Direito: Formulário de Mensagem */}
        <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Envie uma Mensagem</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.open(`https://wa.me/5562992882262?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida!`, '_blank'); }}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input id="name" placeholder="Ex: João Silva" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Seu E-mail</Label>
                <Input id="email" type="email" placeholder="Ex: joao@email.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" placeholder="Como podemos ajudar?" rows={5} required />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
              Chamar no WhatsApp <Send className="w-4 h-4 ml-2" />
            </Button>
            
          </form>
        </div>
      </div>
    </div>
  );
}