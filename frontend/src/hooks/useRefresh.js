import { useState, useCallback } from 'react';

// Hook pour gérer les refreshs de composants
export function useRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return { refreshKey, refresh };
}
