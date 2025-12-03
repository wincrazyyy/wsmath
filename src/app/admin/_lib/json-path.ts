// app/admin/json-path.ts

function parsePath(path: string): Array<string | number> {
  if (!path) return [];
  const segments: Array<string | number> = [];

  for (const part of path.split(".")) {
    const re = /([^\[\]]+)|\[(\d+)\]/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(part))) {
      if (match[1]) {
        segments.push(match[1]);
      } else if (match[2]) {
        segments.push(Number(match[2]));
      }
    }
  }

  return segments;
}

export function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  const segments = parsePath(path);
  let current = obj;

  for (const key of segments) {
    if (current == null) return undefined;
    current = current[key as any];
  }

  return current;
}

export function setByPath(obj: any, path: string, value: any): void {
  if (!path) return;

  const segments = parsePath(path);
  if (segments.length === 0) return;

  const last = segments.pop()!;
  let current = obj;

  for (let i = 0; i < segments.length; i++) {
    const key = segments[i];
    const next = segments[i + 1];

    if (
      current[key as any] == null ||
      typeof current[key as any] !== "object"
    ) {
      current[key as any] = typeof next === "number" ? [] : {};
    }

    current = current[key as any];
  }

  current[last as any] = value;
}
