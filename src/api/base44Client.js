// Gerador de IDs aleatórios
const generateId = () => Math.random().toString(36).substr(2, 9);

// Função para simular o tempo de carregamento da internet (meio segundo)
const delay = (ms = 500) => new Promise(res => setTimeout(res, ms));

// Função para buscar dados da memória do navegador
const getDb = (key, defaultData = []) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(data);
};

// Função para salvar dados na memória do navegador
const setDb = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- DADOS INICIAIS DA SUA LOJA ---
const initialCategories = [
  { id: 'cat1', name: 'Peças Geek', slug: 'geek', order: 1, is_active: true },
  { id: 'cat2', name: 'Decoração', slug: 'decoracao', order: 2, is_active: true }
];

const initialProducts = [
  { 
    id: 'prod1', name: 'Suporte Controle PS5', slug: 'suporte-ps5', 
    price: 35.90, compare_price: 45.00, category_id: 'cat1', material: 'PLA', 
    stock_quantity: 10, is_active: true, is_featured: true, 
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80'] 
  },
  { 
    id: 'prod2', name: 'Vaso Robert Plant', slug: 'vaso-robert', 
    price: 25.00, compare_price: 0, category_id: 'cat2', material: 'PETG', 
    stock_quantity: 5, is_active: true, is_featured: true, 
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80'] 
  }
];

// --- A NOSSA API CLIENT FAKE ---
export const apiClient = {
  categories: {
    getAll: async () => { await delay(); return getDb('mallki_categories', initialCategories); },
    create: async (data) => {
      const items = getDb('mallki_categories', initialCategories);
      const newItem = { ...data, id: generateId() };
      setDb('mallki_categories', [...items, newItem]);
      return newItem;
    },
    update: async (id, data) => {
      const items = getDb('mallki_categories', initialCategories);
      setDb('mallki_categories', items.map(item => item.id === id ? { ...item, ...data } : item));
    },
    delete: async (id) => {
      const items = getDb('mallki_categories', initialCategories);
      setDb('mallki_categories', items.filter(item => item.id !== id));
    }
  },
  products: {
    getAll: async () => { await delay(); return getDb('mallki_products', initialProducts); },
    create: async (data) => {
      const items = getDb('mallki_products', initialProducts);
      const newItem = { ...data, id: generateId(), created_date: new Date().toISOString() };
      setDb('mallki_products', [...items, newItem]);
      return newItem;
    },
    update: async (id, data) => {
      const items = getDb('mallki_products', initialProducts);
      setDb('mallki_products', items.map(item => item.id === id ? { ...item, ...data } : item));
    },
    delete: async (id) => {
      const items = getDb('mallki_products', initialProducts);
      setDb('mallki_products', items.filter(item => item.id !== id));
    }
  },
  orders: {
    getAll: async () => { await delay(); return getDb('mallki_orders', []); },
    update: async (id, data) => {
      const items = getDb('mallki_orders', []);
      setDb('mallki_orders', items.map(item => item.id === id ? { ...item, ...data } : item));
    }
  }
};