import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Loads dropdown options for fields that declare `optionsFrom: { path, label, value? }`.
// Pass a module-level (stable) array of fields.
export default function useOptions(fields) {
  const [map, setMap] = useState({});

  useEffect(() => {
    let alive = true;
    fields.forEach(async (f) => {
      if (!f.optionsFrom) return;
      try {
        const res = await api.get(f.optionsFrom.path, { limit: 200 });
        const list = Array.isArray(res) ? res : res.data;
        const { label, value = 'id' } = f.optionsFrom;
        const options = list.map((item) => ({
          value: item[value],
          label: typeof label === 'function' ? label(item) : item[label],
        }));
        if (alive) setMap((m) => ({ ...m, [f.name]: options }));
      } catch {
        /* the form still works with an empty list */
      }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return map;
}
