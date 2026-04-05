import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { format } from 'date-fns';
import { Eye, Package, Trash2 } from 'lucide-react'; // <-- Adicionado o Trash2
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const statusLabels = {
  pendente: 'Pendente', confirmado: 'Confirmado', em_producao: 'Em Produção',
  enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado',
};
const statusColors = {
  pendente: 'bg-yellow-100 text-yellow-800', confirmado: 'bg-blue-100 text-blue-800',
  em_producao: 'bg-purple-100 text-purple-800', enviado: 'bg-cyan-100 text-cyan-800',
  entregue: 'bg-green-100 text-green-800', cancelado: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // <-- Estado para confirmar exclusão
  const [filter, setFilter] = useState('all');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.orders.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: (/** @type {{ id: string|number, data: any }} */ { id, data }) => apiClient.orders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Pedido atualizado!' });
    },
  });

  // <-- Nova função para deletar pedidos
  const deleteMutation = useMutation({
    mutationFn: (/** @type {string|number} */ id) => apiClient.orders.delete(id), // Nota: certifique-se que o base44Client tem a função delete no orders
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Pedido excluído com sucesso!' });
      setDeleteConfirm(null);
    },
  });

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-space">Pedidos</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id} className="cursor-pointer">
                <TableCell onClick={() => setSelected(o)}>
                  <p className="font-medium text-sm">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground" onClick={() => setSelected(o)}>
                  {o.created_date ? format(new Date(o.created_date), 'dd/MM/yyyy HH:mm') : '—'}
                </TableCell>
                <TableCell className="font-bold text-sm font-space" onClick={() => setSelected(o)}>R$ {o.total?.toFixed(2)}</TableCell>
                <TableCell onClick={() => setSelected(o)}>
                  <Badge className={`text-xs ${statusColors[o.status] || ''}`}>
                    {statusLabels[o.status] || o.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(o)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(o); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum pedido encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Ver Detalhes do Pedido */}
      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-space">Pedido</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Cliente</span><p className="font-medium">{selected.customer_name}</p></div>
                <div><span className="text-muted-foreground">E-mail</span><p className="font-medium">{selected.customer_email}</p></div>
                <div><span className="text-muted-foreground">Telefone</span><p className="font-medium">{selected.customer_phone || '—'}</p></div>
                <div><span className="text-muted-foreground">Pagamento</span><p className="font-medium capitalize">{selected.payment_method}</p></div>
              </div>
              {selected.customer_address && (
                <div className="text-sm"><span className="text-muted-foreground">Endereço</span><p className="font-medium">{selected.customer_address}</p></div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-sm mb-2">Itens</h3>
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span className="font-medium font-space">R$ {item.total?.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-3 font-space">
                  <span>Total</span>
                  <span className="text-primary">R$ {selected.total?.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Atualizar Status</Label>
                <Select
                  value={selected.status}
                  onValueChange={(v) => {
                    updateMutation.mutate({ id: selected.id, data: { status: v } });
                    setSelected(prev => ({ ...prev, status: v }));
                  }}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Código de Rastreio</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    defaultValue={selected.tracking_code || ''}
                    id="tracking"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const code = /** @type {HTMLInputElement} */ (document.getElementById('tracking')).value;
                      updateMutation.mutate({ id: selected.id, data: { tracking_code: code } });
                    }}
                  >
                    Salvar
                  </Button>
                </div>
              </div>

              {selected.notes && (
                <div className="text-sm"><span className="text-muted-foreground">Observações</span><p>{selected.notes}</p></div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => { if (!v) setDeleteConfirm(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Pedido?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja apagar o pedido de <strong>{deleteConfirm?.customer_name}</strong> permanentemente? Esta ação removerá o valor do seu painel e não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo...' : 'Sim, excluir pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}