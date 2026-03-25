// Substitua esta URL pelo seu futuro banco de dados (ex: Supabase, seu próprio Node.js, ou um arquivo JSON local)
const API_BASE_URL = 'http://localhost:3000/api'; 

export const apiClient = {
  products: {
    getAll: async () => {
      // Exemplo usando a função nativa fetch do navegador
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      return response.json();
    }
  },
  categories: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      return response.json();
    }
  }
};