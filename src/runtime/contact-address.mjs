// This lazy module is fetched only after the visitor asks to reveal the address.
const encoded = ['dGhl', 'aGVk', 'aGx5', 'QGdt', 'YWls', 'LmNv', 'bQ=='];

export function revealAddress() {
  return atob(encoded.join(''));
}
