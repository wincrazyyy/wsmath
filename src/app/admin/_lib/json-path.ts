// app/admin/_lib/json-path.ts

type PathSegment = string | number;

function parsePath(path: string): PathSegment[] {
  if (!path) return [];
  const segments: PathSegment[] = [];

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

type Indexable = {
  [key: string]: unknown;
  [index: number]: unknown;
};

function isIndexable(value: unknown): value is Indexable {
  return typeof value === "object" && value !== null;
}

export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const segments = parsePath(path);
  let current: unknown = obj;

  for (const key of segments) {
    if (!isIndexable(current)) return undefined;
    current = current[key];
  }

  return current;
}

export function setByPath(obj: unknown, path: string, value: unknown): void {
  if (!path) return;

  const segments = parsePath(path);
  if (segments.length === 0) return;

  if (!isIndexable(obj)) {
    throw new TypeError("Root value must be an object or array to set a path");
  }

  const last = segments.pop() as PathSegment;
  let current: Indexable = obj;

  for (let i = 0; i < segments.length; i++) {
    const key = segments[i] as PathSegment;
    const next = segments[i + 1];

    let nextValue = current[key];

    if (nextValue == null || typeof nextValue !== "object") {
      // Create array for numeric next segment, otherwise object
      nextValue = typeof next === "number" ? [] : {};
      current[key] = nextValue;
    }

    current = nextValue as Indexable;
  }

  current[last] = value;
}
