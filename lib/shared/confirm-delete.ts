// Every admin delete button was hand-rolling the same
// window.confirm(...) -> if confirmed, do the thing pattern.
export function confirmAndDelete(message: string, onConfirmed: () => void): void {
  if (window.confirm(message)) onConfirmed();
}
