// app/admin/json-path.ts

export function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  const segments = path.split(".");
  let current = obj;

  for (const key of segments) {
    if (current == null) return undefined;
    current = current[key];
  }

  return current;
}

export function setByPath(obj: any, path: string, value: any): void {
  if (!path) return;

  const segments = path.split(".");
  const last = segments.pop()!;
  let current = obj;

  for (const key of segments) {
    if (current[key] == null || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[last] = value;
}
