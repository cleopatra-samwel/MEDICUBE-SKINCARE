import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Server-side paginated list for admin tables. Works with both Laravel
 * resource pagination ({data, meta}) and plain paginators ({data, total, ...}).
 */
export function usePaginated(loader, initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ rows: [], total: 0, pageSize: 15, loading: true, error: null });
  const callId = useRef(0);

  const load = useCallback(() => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    const params = Object.fromEntries(Object.entries({ ...filters, page }).filter(([, v]) => v !== '' && v !== undefined && v !== null));
    return loader(params)
      .then((res) => {
        if (id !== callId.current) return;
        const meta = res.meta || res;
        setState({ rows: res.data || [], total: meta.total || 0, pageSize: meta.per_page || 15, loading: false, error: null });
      })
      .catch((error) => id === callId.current && setState((s) => ({ ...s, loading: false, error })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), page]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key, value) => { setPage(1); setFilters((f) => ({ ...f, [key]: value })); };
  const patchRow = (match, updater) => setState((s) => ({ ...s, rows: s.rows.map((r) => (match(r) ? updater(r) : r)) }));

  return {
    ...state, filters, setFilter, reload: load, patchRow,
    pagination: { current: page, pageSize: state.pageSize, total: state.total, showSizeChanger: false, onChange: setPage, showTotal: (t) => `${t} total` },
  };
}
