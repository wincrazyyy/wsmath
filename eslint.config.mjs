/**
 * Flat config, imported directly.
 *
 * `eslint-config-next` 16 ships native flat config — both entry points export a
 * plain array. The previous config routed them through `@eslint/eslintrc`'s
 * `FlatCompat`, which has to serialise the eslintrc-shaped object it is handed;
 * `eslint-plugin-react`'s config object is self-referential, so that threw
 * "Converting circular structure to JSON" and `npm run lint` had never produced
 * a single result on this codebase. Importing the arrays skips the shim.
 */
import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      // Tracked build output — the live site is served from it. Never linted.
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      /*
       * `next/image` is unavailable to us: `output: 'export'` with
       * `images.unoptimized` reduces <Image> to a plain <img> plus runtime, and
       * the design needs explicit intrinsic width/height on every asset anyway.
       * Every <img> here is deliberate, sized, and lazy below the fold — so the
       * rule is noise, and it is silenced explicitly rather than left as a wall
       * of warnings that hides real findings.
       */
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
