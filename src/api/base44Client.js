import { supabase } from '@/lib/supabase';

// Gerador de IDs (vamos manter o mesmo padrão para não quebrar nada)
const generateId = () => Math.random().toString(36).substr(2, 9);

export const apiClient = {
  categories: {
    getAll: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    create: async (data) => {
      const newItem = { ...data, id: generateId() };
      const { error } = await supabase.from('categories').insert([newItem]);
      if (error) throw error;
      return newItem;
    },
    update: async (id, data) => {
      const { error } = await supabase.from('categories').update(data).eq('id', id);
      if (error) throw error;
    },
    delete: async (id) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    }
  },
  
  products: {
    getAll: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data || [];
    },
    create: async (data) => {
      const newItem = { ...data, id: generateId(), created_date: new Date().toISOString() };
      const { error } = await supabase.from('products').insert([newItem]);
      if (error) throw error;
      return newItem;
    },
    update: async (id, data) => {
      const { error } = await supabase.from('products').update(data).eq('id', id);
      if (error) throw error;
    },
    delete: async (id) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    }
  },

  orders: {
    getAll: async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      return data || [];
    },
    update: async (id, data) => {
      const { error } = await supabase.from('orders').update(data).eq('id', id);
      if (error) throw error;
    }
  },

  // Nova função poderosa: Salvar fotos no Storage do Supabase!
  uploadImage: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('produtos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Pega o link público da imagem para mostrar na loja
    const { data } = supabase.storage.from('produtos').getPublicUrl(filePath);
    return data.publicUrl;
  }
};