/**
 * Cart Store Logic (Mock)
 * Centralizes cart state management
 */

export const cartState = {
  items: [],
  listeners: [],

  init() {
    const saved = localStorage.getItem('adrena_cart');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao recuperar carrinho', e);
        this.items = [];
      }
    }
  },

  subscribe(listener) {
    this.listeners.push(listener);
    // Notificar imediatamente o novo listener com o estado atual
    listener(this.items);
  },

  notify() {
    localStorage.setItem('adrena_cart', JSON.stringify(this.items));
    this.listeners.forEach(listener => listener(this.items));
  },

  addItem(product) {
    this.items.push(product);
    this.notify();
  },

  removeItem(index) {
    this.items.splice(index, 1);
    this.notify();
  },

  getTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  },

  getState() {
    return this.items;
  },

  clear() {
    this.items = [];
    this.notify();
  }
};

// Inicializa o carrinho recuperando dados salvos
cartState.init();
