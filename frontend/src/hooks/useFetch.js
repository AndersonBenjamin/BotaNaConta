import { useCallback, useEffect, useState } from 'react';

// Executa `fetcher` quando `deps` mudam. Mantém os dados anteriores durante o recarregamento
// para a tela não piscar ao trocar de filtro.
export function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error, loading: false });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
}
