import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import schema from "../schemas/entry.schema.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const dataDirectory = path.join(repoRoot, "data");

const ajv = new Ajv2020({
  allErrors: true
});

const validate = ajv.compile(schema);
const files = (await readdir(dataDirectory)).filter((file) => file.endsWith(".json"));

let hadError = false;

for (const file of files) {
  const filePath = path.join(dataDirectory, file);
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    console.error(`${file} must contain an array of entries.`);
    hadError = true;
    continue;
  }

  const expectedLanguage = path.basename(file, ".json");

  for (const [index, entry] of parsed.entries()) {
    const valid = validate(entry);

    if (!valid) {
      console.error(`Schema validation failed for ${file}[${index}]`);
      console.error(validate.errors);
      hadError = true;
      continue;
    }

    if (entry.language !== expectedLanguage) {
      console.error(
        `${file}[${index}] has language "${entry.language}" but should match file name "${expectedLanguage}".`
      );
      hadError = true;
    }
  }
}

if (hadError) {
  process.exit(1);
}

console.log(`Validated ${files.length} data files against ${path.relative(repoRoot, path.join(repoRoot, "schemas", "entry.schema.json"))}.`);
