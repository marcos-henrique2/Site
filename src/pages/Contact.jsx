import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// Informações de contato ajustadas para você preencher com os dados da sua loja
const contactInfo = [
  { icon: Mail, label: 'E-mail', value: 'contato@sualoja.com.br' },
  { icon: Phone, label: 'Telefone', value: '(11) 99999-9999' },
  { icon: MapPin, label: 'Localização', value: 'Sua Cidade, Estado' },
];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    
    setSending(true);

    try {
      // Simulando o tempo de envio de um e-mail para manter a animação do botão
      await new Promise(resolve => setTimeout(resolve, 1500));

      /* Para enviar de verdade e de graça no futuro, você usaria algo assim:
      await fetch('URL_DO_SEU_FORMSPREE_OU_BACKEND', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      */

      toast({ title: 'Mensagem enviada!', description: 'Entraremos em contato em breve.' });
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast({ title: 'Erro ao enviar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold font-space">Entre em Contato</h1>
        <p className="text-muted-foreground mt-2">Dúvidas, orçamentos ou encomendas personalizadas</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {contactInfo.map((item, i) => (
          <Card key={i} className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-medium mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-xl mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5} required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={sending}>
              <Send className="w-4 h-4 mr-2" /> {sending ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center mt-10">
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          Chamar no WhatsApp
        </a>
      </div>
    </div>
  );
}