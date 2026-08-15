/**
 * Runs every live example in the docs and reports the ones that fail.
 *
 * Live examples are fenced code blocks tagged `jscad`. Each is a complete design:
 * it imports from '@jscad/modeling' and exports `main`. This script evaluates them
 * exactly as the browser viewer does, so a passing run means every example on the
 * site renders something.
 *
 *   node scripts/check-examples.mjs
 */

import {readdir, readFile, mkdir, writeFile, rm} from 'node:fs/promises';
import {join, relative, extname} from 'node:path';
import {pathToFileURL} from 'node:url';

const DOCS_DIR = new URL('../docs/', import.meta.url).pathname;
const WORK_DIR = new URL('../.example-check/', import.meta.url).pathname;

const FENCE = /^```(\w+)([^\n]*)\n([\s\S]*?)^```/gm;

const walk = async (dir) => {
  const entries = await readdir(dir, {withFileTypes: true});
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path);
      return ['.md', '.mdx'].includes(extname(path)) ? [path] : [];
    }),
  );
  return files.flat();
};

/** Every `jscad`-tagged block in a document, with the line it starts on. */
const extractExamples = (source, file) => {
  const examples = [];
  for (const match of source.matchAll(FENCE)) {
    const [, , meta, code] = match;
    if (!meta.split(/\s+/).includes('jscad')) continue;

    examples.push({
      file,
      line: source.slice(0, match.index).split('\n').length,
      code,
    });
  }
  return examples;
};

/** Mirrors how the JSCAD applications seed a design's parameters on first load. */
const resolveDefaultParameters = (definitions) => {
  const params = {};
  for (const definition of definitions ?? []) {
    if (!definition?.name || definition.type === 'group') continue;

    if (definition.type === 'checkbox') {
      params[definition.name] = definition.checked
        ? (definition.initial ?? true)
        : false;
      continue;
    }
    params[definition.name] =
      definition.initial ?? definition.default ?? definition.values?.[0];
  }
  return params;
};

const run = async (example, index) => {
  const path = join(WORK_DIR, `example-${index}.mjs`);
  await writeFile(path, example.code);

  const design = await import(pathToFileURL(path).href);

  const main = design.main ?? design.default;
  if (typeof main !== 'function') {
    throw new Error("the design does not export a 'main' function");
  }

  const params =
    typeof design.getParameterDefinitions === 'function'
      ? resolveDefaultParameters(design.getParameterDefinitions())
      : {};

  const geometries = [await main(params)]
    .flat(Infinity)
    .filter((item) => typeof item === 'object' && item !== null);

  if (geometries.length === 0) {
    throw new Error("'main' did not return any geometry");
  }

  const empty = geometries.filter(
    (geometry) =>
      (geometry.polygons?.length ?? geometry.outlines?.length ?? geometry.points?.length) === 0,
  );
  if (empty.length === geometries.length) {
    throw new Error("'main' returned only empty geometry");
  }

  return geometries.length;
};

const main = async () => {
  await rm(WORK_DIR, {recursive: true, force: true});
  await mkdir(WORK_DIR, {recursive: true});

  const files = await walk(DOCS_DIR);
  const examples = (
    await Promise.all(
      files.map(async (file) => extractExamples(await readFile(file, 'utf8'), file)),
    )
  ).flat();

  const failures = [];
  for (const [index, example] of examples.entries()) {
    const where = `${relative(process.cwd(), example.file)}:${example.line}`;
    try {
      const count = await run(example, index);
      console.log(`  ok    ${where} (${count} ${count === 1 ? 'shape' : 'shapes'})`);
    } catch (cause) {
      failures.push({where, message: cause.message});
      console.log(`  FAIL  ${where}`);
    }
  }

  await rm(WORK_DIR, {recursive: true, force: true});

  console.log(`\n${examples.length - failures.length}/${examples.length} examples ran.`);
  for (const failure of failures) {
    console.log(`\n${failure.where}\n  ${failure.message}`);
  }

  process.exitCode = failures.length ? 1 : 0;
};

await main();
