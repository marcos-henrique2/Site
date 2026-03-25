import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, FolderOpen, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiClient.products.getAll(), // Corrigido para a nossa API local
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.orders.getAll(), // Corrigido para a nossa API local
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiClient.categories.getAll(), // Corrigido para a nossa API local
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pendente').length;
  const lowStock = products.filter(p => (p.stock_quantity || 0) <= 3).length;

  const stats = [
    { label: 'Produtos', value: products.length, icon: Package, color: 'text-primary' },
    { label: 'Pedidos', value: orders.length, icon: ShoppingCart, color: 'text-accent' },
    { label: 'Categorias', value: categories.length, icon: FolderOpen, color: 'text-green-500' },
    { label: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-space mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold font-space mt-1">{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {pendingOrders > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <p className="font-semibold text-orange-700">{pendingOrders} pedido(s) pendente(s)</p>
              <p className="text-sm text-orange-600 mt-1">Verifique a aba de Pedidos para processar.</p>
            </CardContent>
          </Card>
        )}
        {lowStock > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <p className="font-semibold text-red-700">{lowStock} produto(s) com estoque baixo</p>
              <p className="text-sm text-red-600 mt-1">Verifique a aba de Produtos para repor.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}