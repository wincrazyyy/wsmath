/**
 * Generates `content.schema.json` at the repo root from the Zod schemas.
 *
 * This file is one of the four things this repo owes the editor
 * (editor contract §3.2): the editor renders an editing form from it and knows nothing
 * else about the site. Because it is generated from `src/content/schema/*`, the
 * form and the site's validation cannot drift.
 *
 * Run with `npm run generate:schema`. It also runs automatically before a build.
 *
 * Executed through `jiti` rather than `node --experimental-strip-types`: type
 * stripping requires explicit `.ts` extensions on every relative import, which
 * the app's own `moduleResolution: "bundler"` setup does not use.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

import { CONTENT_DOCUMENTS, CONTENT_DOCUMENT_KEYS, SiteContentSchema } from "../src/content/schema/index";

const OUTPUT_FILE = "content.schema.json";

function main(): void {
  const jsonSchema = z.toJSONSchema(SiteContentSchema, { target: "draft-2020-12" });

  const documents = CONTENT_DOCUMENT_KEYS.map((key, index) => ({
    key,
    file: CONTENT_DOCUMENTS[key].file,
    title: CONTENT_DOCUMENTS[key].title,
    order: index,
  }));

  const output = {
    ...jsonSchema,
    "x-site": "wsmath",
    "x-generated-by": "scripts/generate-content-schema.ts",
    "x-generator-note":
      "Generated from src/content/schema/*.ts. Do not edit by hand — run `npm run generate:schema`.",
    "x-content-dir": "src/content",
    "x-documents": documents,
    "x-token-syntax": {
      pattern: "{{token.path}}",
      formatters: {
        money: "{{money pricing.coursePrice}} → HKD 16,800",
        num: "{{num stats.tutoringHours}} → 20,000",
        plus: "{{plus stats.tutoringHours}} → 20,000+",
      },
      note: "Fields flagged x-tokens may contain tokens. An unknown token fails the build rather than rendering blank.",
    },
  };

  const target = join(process.cwd(), OUTPUT_FILE);
  writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  const definitions = Object.keys((jsonSchema as { $defs?: Record<string, unknown> }).$defs ?? {}).length;
  process.stdout.write(
    `${OUTPUT_FILE}: ${documents.length} documents, ${definitions} shared definitions → ${target}\n`,
  );
}

main();
