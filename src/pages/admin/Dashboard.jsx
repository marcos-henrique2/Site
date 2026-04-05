import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { DollarSign, ShoppingBag, TrendingUp, Package, Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.orders.getAll(),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiClient.products.getAll(),
  });

  // 1. Cálculos dos Cards Principais
  const validOrders = useMemo(() => orders.filter(o => o.status !== 'cancelado'), [orders]);
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = validOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 2. Gráfico: Receita dos Últimos 7 Dias
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayOrders = validOrders.filter(o => o.created_date?.startsWith(dateStr));
      const dayTotal = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      data.push({
        name: format(d, 'dd MMM', { locale: ptBR }),
        total: dayTotal
      });
    }
    return data;
  }, [validOrders]);

  // 3. Ranking de Produtos Mais Vendidos
  const topProducts = useMemo(() => {
    const sales = {};
    validOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!sales[item.product_id]) {
          sales[item.product_id] = { name: item.product_name, quantity: 0, revenue: 0 };
        }
        sales[item.product_id].quantity += item.quantity;
        sales[item.product_id].revenue += item.total || (item.unit_price * item.quantity);
      });
    });

    return Object.values(sales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Pega os Top 5
  }, [validOrders]);

  if (loadingOrders || loadingProducts) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Carregando painel...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-space">Visão Geral</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho da Mallki Print.</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Receita Total</p>
            <h3 className="text-2xl font-bold font-space text-foreground">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Pedidos Realizados</p>
            <h3 className="text-2xl font-bold font-space text-foreground">{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Ticket Médio</p>
            <h3 className="text-2xl font-bold font-space text-foreground">R$ {averageTicket.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Vendas */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-space">Receita (Últimos 7 dias)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                />
                <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-bold font-space mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Mais Vendidos
          </h3>
          
          <div className="flex-1 space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity} unidades vendidas</p>
                  </div>
                  <div className="text-right font-space font-semibold text-sm text-primary">
                    R$ {product.revenue.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                <Package className="w-8 h-8 opacity-20" />
                <p className="text-sm">Nenhuma venda registrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}