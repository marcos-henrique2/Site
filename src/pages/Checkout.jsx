import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const paymentMethods = [
  { value: 'cartao', label: 'Mercado Pago', icon: CreditCard, desc: 'Cartão, boleto ou Pix via MP' },
  { value: 'boleto', label: 'Boleto', icon: FileText, desc: 'Até 3 dias úteis' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, desc: 'Combinar pagamento' },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [payment, setPayment] = useState('cartao');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || items.length === 0) return;

    setSubmitting(true);
    await base44.entities.Order.create({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      customer_address: form.address,
      notes: form.notes,
      items: items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.unit_price * i.quantity,
      })),
      subtotal,
      total: subtotal,
      payment_method: payment,
      status: 'pendente',
    });
    clearCart();
    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold font-space">Pedido Realizado!</h2>
        <p className="text-muted-foreground mt-2">Recebemos seu pedido. Entraremos em contato em breve para confirmar o pagamento e envio.</p>
        <Link to="/">
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Voltar ao Início</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Link to="/produtos"><Button variant="link" className="text-primary mt-2">Ver Produtos</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/carrinho" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar ao carrinho
      </Link>

      <h1 className="text-3xl font-bold font-space mb-8">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-lg">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Nome Completo *</Label><Input value={form.name} onChange={e => handleChange('name', e.target.value)} required /></div>
            <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required /></div>
            <div><Label>Telefone</Label><Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} /></div>
          </div>
          <div><Label>Endereço de Entrega</Label><Textarea value={form.address} onChange={e => handleChange('address', e.target.value)} rows={2} /></div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-lg">Forma de Pagamento</h2>
          <RadioGroup value={payment} onValueChange={setPayment} className="grid grid-cols-2 gap-3">
            {paymentMethods.map(m => (
              <Label
                key={m.value}
                htmlFor={m.value}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  payment === m.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                }`}
              >
                <RadioGroupItem value={m.value} id={m.value} className="sr-only" />
                <m.icon className={`w-5 h-5 ${payment === m.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium text-sm">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-lg mb-4">Resumo do Pedido</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>{item.product_name} x{item.quantity}</span>
                <span className="font-medium">R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold font-space text-lg">
            <span>Total</span>
            <span className="text-primary">R$ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} placeholder="Informações adicionais..." /></div>

        <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={submitting}>
          {submitting ? 'Processando...' : 'Confirmar Pedido'}
        </Button>
      </form>
    </div>
  );
}