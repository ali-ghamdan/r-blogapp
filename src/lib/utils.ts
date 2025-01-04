export function UserNameShorthand(t: string) {
  if (!t) return t;
  return t[0].toUpperCase() + t.slice(-1)[0].toUpperCase();
}