import { supabase } from '@/lib/supabase';

export const apiClient = {
  categories: {
    getAll: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    create: async (data) => {
      // Enviamos apenas os dados do formulário, o Supabase gera o ID automático!
      const { error } = await supabase.from('categories').insert([data]);
      if (error) throw error;
      return data;
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
      // AQUI ESTAVA O ERRO! Removemos o generateId() e o created_date.
      const { error } = await supabase.from('products').insert([data]);
      if (error) throw error;
      return data;
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
    // Caso a sua tabela use created_at (padrão do supabase), trocamos no order também.
    // Se a sua tabela DE FATO se chamar 'created_date', mude a linha abaixo para 'created_date'
    getAll: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (data) => {
      // Removemos a injeção manual de id e data
      const { error } = await supabase.from('orders').insert([data]);
      if (error) throw error;
      return data;
    },
    update: async (id, data) => {
      const { error } = await supabase.from('orders').update(data).eq('id', id);
      if (error) throw error;
    }
  },
  
  auth: {
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      return data;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }
  },

  uploadImage: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('produtos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('produtos').getPublicUrl(filePath);
    return data.publicUrl;
  }
};