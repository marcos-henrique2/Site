import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

const MATERIALS = ['PLA', 'ABS', 'PETG', 'TPU', 'Resina', 'Nylon', 'Outro'];

const emptyProduct = {
  name: '', slug: '', description: '', short_description: '', price: '', compare_price: '',
  category_id: '', material: '', color: '', dimensions: '', weight: '',
  stock_quantity: 0, is_active: true, is_featured: false, print_time: '', infill: '', images: [], tags: [],
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false); // NOVO: Estado para saber se a foto está a ser enviada

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiClient.products.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiClient.categories.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: async (/** @type {any} */ data) => {
      const payload = { ...data, price: parseFloat(data.price) || 0, compare_price: parseFloat(data.compare_price) || 0, stock_quantity: parseInt(data.stock_quantity) || 0 };
      if (editing) return apiClient.products.update(editing.id, payload);
      return apiClient.products.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: editing ? 'Produto atualizado!' : 'Produto criado!' });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (/** @type {string|number} */ id) => apiClient.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Produto excluído!' });
    },
  });

  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyProduct); };

  const openEdit = (product) => {
    setEditing(product);
    setForm({ ...emptyProduct, ...product, price: product.price?.toString() || '', compare_price: product.compare_price?.toString() || '', stock_quantity: product.stock_quantity || 0 });
    setOpen(true);
  };

  // NOVO: Função de Upload ligada ao Supabase
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Envia a foto para a nuvem e recebe o link público
      const imageUrl = await apiClient.uploadImage(file);
      setForm(prev => ({ ...prev, images: [...(prev.images || []), imageUrl] }));
      toast({ title: 'Foto adicionada com sucesso!' });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: 'Erro ao enviar a foto', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-space">Produtos</h1>
        <Button onClick={() => { setForm(emptyProduct); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Novo Produto
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-muted-foreground/30" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                      {p.material && <p className="text-xs text-muted-foreground">{p.material}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{getCategoryName(p.category_id)}</TableCell>
                <TableCell className="font-medium text-sm font-space">R$ {p.price?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={p.stock_quantity <= 3 ? 'destructive' : 'secondary'} className="text-xs">
                    {p.stock_quantity || 0}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={p.is_active ? 'default' : 'secondary'} className="text-xs">
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && products.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-space">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} required /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} /></div>
              <div><Label>Preço (R$) *</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required /></div>
              <div><Label>Preço Original (R$)</Label><Input type="number" step="0.01" value={form.compare_price} onChange={e => setForm(p => ({ ...p, compare_price: e.target.value }))} /></div>
              <div>
                <Label>Categoria *</Label>
                <Select value={form.category_id} onValueChange={v => setForm(p => ({ ...p, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Material</Label>
                <Select value={form.material} onValueChange={v => setForm(p => ({ ...p, material: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cor</Label><Input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} /></div>
              <div><Label>Dimensões</Label><Input value={form.dimensions} onChange={e => setForm(p => ({ ...p, dimensions: e.target.value }))} placeholder="ex: 10x5x3 cm" /></div>
              <div><Label>Peso</Label><Input value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="ex: 50g" /></div>
              <div><Label>Quantidade em Estoque</Label><Input type="number" value={form.stock_quantity} onChange={e => setForm(p => ({ ...p, stock_quantity: Number(e.target.value) }))} /></div>
              <div><Label>Tempo de Impressão</Label><Input value={form.print_time} onChange={e => setForm(p => ({ ...p, print_time: e.target.value }))} placeholder="ex: 4 horas" /></div>
              <div><Label>Preenchimento</Label><Input value={form.infill} onChange={e => setForm(p => ({ ...p, infill: e.target.value }))} placeholder="ex: 20%" /></div>
            </div>

            <div><Label>Descrição Curta</Label><Textarea value={form.short_description} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))} rows={2} /></div>
            <div><Label>Descrição Completa</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} /></div>

            <div>
              <Label>Imagens</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {form.images?.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                
                {/* Botão de Upload com estado de carregamento */}
                <label className={`w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}>
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Adicionar tag" className="flex-1" />
                <Button type="button" variant="outline" onClick={addTag}>Adicionar</Button>
              </div>
              {form.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((t, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))}>
                      {t} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} />
                <Label>Destaque</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={saveMutation.isPending || isUploading}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}