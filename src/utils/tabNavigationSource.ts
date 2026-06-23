let _pendingSource: string | null = null;

export const markNextFocusFromHome = (): void => {
  _pendingSource = 'home';
};

export const consumeNextFocusSource = (): string | null => {
  const source = _pendingSource;
  _pendingSource = null;
  return source;
};
