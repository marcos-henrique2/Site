import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Package, Image as ImageIcon, Copy, UploadCloud } from 'lucide-react';
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

const MATERIALS = ['PLA', 'PETG', 'Outro'];

/**
 * @typedef {{ size: string, price: number }} SizeVariant
 *
 * @typedef {Object} ProductForm
 * @property {string} [id]
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} short_description
 * @property {string} price
 * @property {string} compare_price
 * @property {string} category_id
 * @property {string} material
 * @property {string[]} colors
 * @property {string} weight
 * @property {number} stock_quantity
 * @property {boolean} is_active
 * @property {boolean} is_featured
 * @property {string} print_time
 * @property {string} infill
 * @property {string[]} images
 * @property {string[]} tags
 * @property {SizeVariant[]} size_variants
 */

/** @type {ProductForm} */
const emptyProduct = {
  name: '', slug: '', description: '', short_description: '', price: '', compare_price: '',
  category_id: '', material: '', colors: [], weight: '',
  stock_quantity: 0, is_active: true, is_featured: false, print_time: '', infill: '',
  images: [], tags: [],
  size_variants: [],
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const csvInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(/** @type {ProductForm} */ (emptyProduct));

  const [tagInput, setTagInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  // Size variant inputs
  const [sizeInput, setSizeInput] = useState('');
  const [sizePriceInput, setSizePriceInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiClient.products.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiClient.categories.getAll(),
  });
  
// MUTATIONS
  const saveMutation = useMutation({
    mutationFn: async (/** @type {any} */ data) => {
      // Aqui nós montamos o pacote APENAS com colunas oficiais do banco de dados!
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        short_description: data.short_description,
        price: parseFloat(data.price) || 0,
        compare_price: parseFloat(data.compare_price) || 0,
        material: data.material,
        weight: data.weight,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        is_active: data.is_active,
        is_featured: data.is_featured,
        print_time: data.print_time,
        infill: data.infill,
        images: data.images || [],
        tags: data.tags || [],
        
        // As suas traduções:
        color: data.colors && data.colors.length > 0 ? data.colors.join(', ') : '',
        
        // Se você criou size_variants como JSONB no Supabase, mandamos direto:
        size_variants: data.size_variants || []
      };

      // REGRA DE OURO: Se a categoria estiver vazia (""), apaga para não dar erro de UUID inválido
      if (data.category_id) {
        payload.category_id = data.category_id;
      }

      if (editing) return apiClient.products.update(editing.id, payload);
      return apiClient.products.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: editing ? 'Produto atualizado!' : 'Produto criado!' });
      closeDialog();
    },
    onError: (/** @type {any} */ err) => {
      const msg = err?.message || JSON.stringify(err);
      console.error('Erro ao salvar produto:', err);
      toast({ title: 'Erro ao salvar produto', description: msg, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (/** @type {string} */ id) => apiClient.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Produto excluído!' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir produto', variant: 'destructive' });
    },
  });

  const importCsvMutation = useMutation({
    mutationFn: async (/** @type {any[]} */ newProducts) => {
      for (const product of newProducts) {
        await apiClient.products.create({
          ...product,
          price: parseFloat(product.price) || 0,
          stock_quantity: parseInt(product.stock_quantity) || 0,
          is_active: true,
          is_featured: false,
          images: [],
          tags: [],
          size_variants: [],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Produtos importados com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao importar CSV', variant: 'destructive' });
    },
  });

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(emptyProduct); };

  /** Parse stored size_variants — could be JSON string or already an array */
  const parseSizeVariants = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  };

  /** @param {any} product */
  const openEdit = (product) => {
    setEditing(product);
    setForm({
      ...emptyProduct,
      ...product,
      price: product.price?.toString() || '',
      compare_price: product.compare_price?.toString() || '',
      colors: product.color ? product.color.split(',').map((/** @type {string} */ c) => c.trim()).filter(Boolean) : [],
      size_variants: parseSizeVariants(product.size_variants),
    });
    setOpen(true);
  };

  /** @param {any} product */
  const duplicateProduct = (product) => {
    setEditing(null);
    setForm({
      ...emptyProduct,
      ...product,
      id: undefined,
      name: `${product.name} (Cópia)`,
      slug: `${product.slug}-copia`,
      price: product.price?.toString() || '',
      colors: product.color ? product.color.split(',').map((/** @type {string} */ c) => c.trim()).filter(Boolean) : [],
      size_variants: parseSizeVariants(product.size_variants),
    });
    setOpen(true);
  };

  // ── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
  /** @param {any} e */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const imageUrl = await apiClient.uploadImage(file);
      setForm(/** @type {any} */ (prev) => ({ ...prev, images: [...(prev.images || []), imageUrl] }));
      toast({ title: 'Foto adicionada!' });
    } catch {
      toast({ title: 'Erro no upload', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (/** @type {number} */ idx) => {
    setForm(/** @type {any} */ (prev) => ({ ...prev, images: prev.images.filter((/** @type {any} */ _, /** @type {number} */ i) => i !== idx) }));
  };

  const handleDragDrop = (/** @type {React.DragEvent} */ e, /** @type {number} */ targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData('imgIdx'));
    if (sourceIndex === targetIndex) return;
    setForm(/** @type {any} */ (prev) => {
      const newImages = [...prev.images];
      const [moved] = newImages.splice(sourceIndex, 1);
      newImages.splice(targetIndex, 0, moved);
      return { ...prev, images: newImages };
    });
  };

  // ── TAGS / COLORS ─────────────────────────────────────────────────────────────
  const addToList = (field, value, setInputValue) => {
    if (value.trim() && !form[field]?.includes(value.trim())) {
      setForm(/** @type {any} */ (prev) => ({ ...prev, [field]: [...(prev[field] || []), value.trim()] }));
      setInputValue('');
    }
  };

  const removeFromList = (field, idx) => {
    setForm(/** @type {any} */ (prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  // ── SIZE VARIANTS ─────────────────────────────────────────────────────────────
  const addSizeVariant = () => {
    const size = sizeInput.trim();
    const price = parseFloat(sizePriceInput);
    if (!size || isNaN(price) || price < 0) return;
    const already = form.size_variants?.some(sv => sv.size === size);
    if (already) { toast({ title: 'Este tamanho já existe!' }); return; }
    setForm(/** @type {any} */ (prev) => ({
      ...prev,
      size_variants: [...(prev.size_variants || []), { size, price }],
    }));
    setSizeInput('');
    setSizePriceInput('');
  };

  const removeSizeVariant = (idx) => {
    setForm(/** @type {any} */ (prev) => ({
      ...prev,
      size_variants: prev.size_variants.filter((_, i) => i !== idx),
    }));
  };

  // ── CSV IMPORT ────────────────────────────────────────────────────────────────
  /** @param {any} e */
  const handleCSVImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const headers = rows.shift()?.split(',').map(h => h.trim());
      if (!headers) return;
      const newProducts = rows.map(row => {
        const values = row.split(',').map(v => v.trim());
        const product = { ...emptyProduct };
        headers.forEach((header, index) => {
          if (header === 'price' || header === 'stock_quantity') {
            product[header] = Number(values[index]) || 0;
          } else {
            product[header] = values[index];
          }
        });
        if (product.name && !product.slug) {
          product.slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        return product;
      });
      if (confirm(`Encontrados ${newProducts.length} produtos no CSV. Deseja importar?`)) {
        importCsvMutation.mutate(newProducts);
      }
      if (csvInputRef.current) csvInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const getCategoryName = (/** @type {string} */ id) => categories.find((/** @type {any} */ c) => c.id === id)?.name || '—';

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold font-space">Produtos</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCSVImport} />
          <Button variant="outline" onClick={() => csvInputRef.current?.click()} disabled={importCsvMutation.isPending} className="flex-1 sm:flex-none">
            <UploadCloud className="w-4 h-4 mr-2" />
            {importCsvMutation.isPending ? 'Importando...' : 'Importar CSV'}
          </Button>
          <Button onClick={() => { setForm(emptyProduct); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((/** @type {any} */ p) => {
              const variants = parseSizeVariants(p.size_variants);
              const minPrice = variants.length > 0
                ? Math.min(...variants.map(v => v.price))
                : p.price;
              const maxPrice = variants.length > 0
                ? Math.max(...variants.map(v => v.price))
                : p.price;
              const priceLabel = variants.length > 0 && minPrice !== maxPrice
                ? `R$ ${minPrice.toFixed(2)} – R$ ${maxPrice.toFixed(2)}`
                : `R$ ${(p.price || 0).toFixed(2)}`;

              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-muted-foreground/30" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.material}{variants.length > 0 ? ` · ${variants.length} tamanho(s)` : ''}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{getCategoryName(p.category_id)}</TableCell>
                  <TableCell className="font-medium text-sm font-space">{priceLabel}</TableCell>
                  <TableCell>
                    <Badge variant={p.stock_quantity <= 3 ? 'destructive' : 'secondary'} className="text-xs">
                      {p.stock_quantity || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => duplicateProduct(p)} title="Duplicar">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)} title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm('Excluir produto?')) deleteMutation.mutate(p.id); }} title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && products.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── DIALOG ── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-space text-xl">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-6 mt-2">

            {/* Info básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} required /></div>
              <div><Label>Slug (Link)</Label><Input value={form.slug} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, slug: e.target.value }))} /></div>

              <div>
                <Label>
                  Preço Base (R$) *
                  {form.size_variants?.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">usado quando nenhum tamanho é selecionado</span>
                  )}
                </Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, price: e.target.value }))} required />
              </div>
              <div><Label>Preço Original (R$) <span className="text-muted-foreground text-xs">(gera selo de desconto)</span></Label><Input type="number" step="0.01" value={form.compare_price} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, compare_price: e.target.value }))} /></div>

              <div>
                <Label>Categoria *</Label>
                <Select value={form.category_id} onValueChange={v => setForm(/** @type {any} */ (p) => ({ ...p, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{categories.map((/** @type {any} */ c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Material Principal</Label>
                <Select value={form.material} onValueChange={v => setForm(/** @type {any} */ (p) => ({ ...p, material: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div><Label>Peso para Frete</Label><Input value={form.weight} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, weight: e.target.value }))} placeholder="ex: 50g" /></div>
              <div><Label>Quantidade em Estoque</Label><Input type="number" value={form.stock_quantity} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, stock_quantity: Number(e.target.value) }))} /></div>
            </div>

            {/* Variações */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-5">
              <h3 className="font-semibold text-sm">Variações do Produto</h3>

              {/* Cores */}
              <div>
                <Label>Opções de Cor</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('colors', colorInput, setColorInput); } }} placeholder="Ex: Azul Metálico" />
                  <Button type="button" variant="secondary" onClick={() => addToList('colors', colorInput, setColorInput)}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.colors?.map((c, i) => (
                    <Badge key={i} variant="outline" className="bg-background cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromList('colors', i)}>{c} ×</Badge>
                  ))}
                </div>
              </div>

              {/* Tamanhos com Preço */}
              <div className="border-t border-border pt-4">
                <div className="mb-2">
                  <Label>Tamanhos com Preço Individual</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Cada tamanho pode ter um valor diferente. O cliente escolhe na página do produto.</p>
                </div>

                <div className="flex gap-2 mt-2">
                  <Input
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value)}
                    placeholder="Nome (ex: Pequeno, 10cm, P)"
                    className="flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSizeVariant(); } }}
                  />
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                    <Input
                      value={sizePriceInput}
                      onChange={e => setSizePriceInput(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-8"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSizeVariant(); } }}
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={addSizeVariant}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {form.size_variants?.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {form.size_variants.map((sv, i) => (
                      <div key={i} className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-sm">{sv.size}</span>
                          <span className="text-primary font-bold text-sm font-space">R$ {Number(sv.price).toFixed(2)}</span>
                        </div>
                        <button type="button" onClick={() => removeSizeVariant(i)} className="text-xs text-destructive hover:underline">
                          Remover
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-1">
                      Faixa de preço: R$ {Math.min(...form.size_variants.map(sv => sv.price)).toFixed(2)} – R$ {Math.max(...form.size_variants.map(sv => sv.price)).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 italic">Nenhum tamanho cadastrado — o produto usará o preço base único.</p>
                )}
              </div>
            </div>

            {/* Detalhes técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Tempo de Impressão</Label><Input value={form.print_time} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, print_time: e.target.value }))} placeholder="ex: 4 horas" /></div>
              <div><Label>Preenchimento (Infill)</Label><Input value={form.infill} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, infill: e.target.value }))} placeholder="ex: 15% Giroide" /></div>
            </div>

            <div><Label>Descrição Curta (Aparece no card)</Label><Textarea value={form.short_description} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, short_description: e.target.value }))} rows={2} /></div>
            <div><Label>Descrição Completa</Label><Textarea value={form.description} onChange={e => setForm(/** @type {any} */ (p) => ({ ...p, description: e.target.value }))} rows={4} /></div>

            {/* Imagens */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
              <Label className="mb-2 block">Imagens do Produto <span className="text-xs text-muted-foreground font-normal">(Arraste para reordenar)</span></Label>
              <div className="flex gap-3 flex-wrap">
                {form.images?.map((img, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('imgIdx', i.toString())}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDragDrop(e, i)}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border cursor-grab active:cursor-grabbing group shadow-sm hover:border-primary transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {i === 0 ? 'Principal' : i + 1}
                    </div>
                    <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Trash2 className="w-5 h-5 text-white drop-shadow-md hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ))}
                <label className={`w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-background transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}`}>
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground font-medium">Adicionar</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags de Busca</Label>
              <div className="flex gap-2 mt-1">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('tags', tagInput, setTagInput); } }} placeholder="Ex: anime, geek, presente" />
                <Button type="button" variant="secondary" onClick={() => addToList('tags', tagInput, setTagInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags?.map((t, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeFromList('tags', i)}>{t} ×</Badge>
                ))}
              </div>
            </div>

            {/* Switches */}
            <div className="flex gap-8 py-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(/** @type {any} */ (p) => ({ ...p, is_active: v }))} />
                <Label className="cursor-pointer">Produto Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(/** @type {any} */ (p) => ({ ...p, is_featured: v }))} />
                <Label className="cursor-pointer">Destaque <span className="text-xs text-muted-foreground">(aparece na Home)</span></Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium" disabled={saveMutation.isPending || isUploading}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}