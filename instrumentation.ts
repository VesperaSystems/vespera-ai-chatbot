if (typeof window === 'undefined') {
  const storageShim = {
    length: 0,
    key: () => null,
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };

  const globalScope = globalThis as typeof globalThis & {
    localStorage?: typeof storageShim;
    sessionStorage?: typeof storageShim;
  };

  if (globalScope.localStorage == null || typeof globalScope.localStorage.getItem !== 'function') {
    globalScope.localStorage = storageShim;
  }

  if (globalScope.sessionStorage == null || typeof globalScope.sessionStorage.getItem !== 'function') {
    globalScope.sessionStorage = storageShim;
  }
}

export async function register() {}
