export function notify(message, type = 'info', title = '') {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('catchtrap:notify', {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        type,
        title
      }
    })
  );
}