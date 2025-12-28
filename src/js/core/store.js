/**
 * Cart Store Logic (Mock)
 * Centralizes cart state management
 */

export const cartState = {
  items: [],
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },

  notify() {
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
  }
};
