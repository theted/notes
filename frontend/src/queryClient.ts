import { QueryClient, dehydrate, hydrate } from '@tanstack/react-query';

const STORAGE_KEY = 'notes-rq-cache-v1';

function loadPersistedState(): unknown | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use cached data immediately; refetch to stay fresh
      staleTime: 5 * 60 * 1000, // 5 minutes considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: 'always', // keep background refresh
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Hydrate cache from localStorage (optimistic cache for instant UI)
const dehydrated = loadPersistedState();
if (dehydrated) {
  try {
    hydrate(queryClient, dehydrated as any);
  } catch {
    // ignore hydration errors from incompatible versions
  }
}

// Persist cache to localStorage with a tiny debounce to avoid excessive writes
let persistTimer: number | undefined;
const schedulePersist = () => {
  if (persistTimer) window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    try {
      const state = dehydrate(queryClient);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, 250);
};

queryClient.getQueryCache().subscribe(schedulePersist);
