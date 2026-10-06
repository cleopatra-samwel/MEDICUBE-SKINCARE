import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-fetching helper: returns { data, error, loading, reload, setData }.
 * `deps` re-runs the loader; stale responses are ignored.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    return loader()
      .then((data) => id === callId.current && setState({ data, error: null, loading: false }))
      .catch((error) => id === callId.current && setState({ data: null, error, loading: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  const setData = (updater) =>
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));

  return { ...state, reload: run, setData };
}
