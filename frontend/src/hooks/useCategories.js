import { useFetch } from './useFetch.js';
import { getCategories } from '../services/expenses.js';

// As categorias quase nunca mudam: busca uma vez e reaproveita enquanto o app estiver aberto.
let cached = null;

function loadCategories() {
  cached ??= getCategories().catch((error) => {
    cached = null;
    throw error;
  });
  return cached;
}

export function useCategories() {
  return useFetch(loadCategories, []);
}
