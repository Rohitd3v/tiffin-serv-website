/**
 * Isolated regression coverage for the Menu Vote Banner dish configuration feature.
 * Runs alongside pr-unit.test.mjs with the same in-memory compilation approach:
 *
 *   node --test --test-timeout=10000 scripts/menu-vote-banner.test.mjs
 *
 * Compiles source files in memory; no network connections or database writes.
 */
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { compileFunction } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const compiled = new Map();

function loadSource(path, { dependencies = {} } = {}) {
  if (!compiled.has(path)) {
    const filename = fileURLToPath(new URL(`../src/${path}`, import.meta.url));
    compiled.set(path, ts.transpileModule(readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText);
  }
  if (!path.endsWith("page.tsx")) {
    const unexpected = [];
    const scope = {
      process: { env: {} },
      window: undefined,
      document: undefined,
      console: { log() {}, warn() {}, error() {} },
      fetch: () => { unexpected.push("fetch"); throw new Error("Unexpected network request"); },
    };
    const loadedModule = { exports: {} };
    const injectedRequire = (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unmocked dependency: ${name}`);
      return dependencies[name];
    };
    compileFunction(compiled.get(path), ["require", "module", "exports", ...Object.keys(scope)], {
      filename: path,
    })(injectedRequire, loadedModule, loadedModule.exports, ...Object.values(scope));
    return { ...loadedModule.exports, assertNoNetwork: () => assert.deepEqual(unexpected, []) };
  }
  // For page.tsx, rely on pr-unit.test.mjs's page rendering suite instead.
  throw new Error("page rendering covered by pr-unit.test.mjs");
}

function database(...steps) {
  const calls = [];
  const unexpected = [];
  let index = 0;
  const client = {
    from(table) {
      const step = steps[index++];
      if (!step || step.table !== table) {
        unexpected.push({ expected: step?.table, actual: table });
        throw new Error(`Unexpected query to ${table}`);
      }
      const call = { table, operations: [] };
      calls.push(call);
      const query = {};
      for (const method of ["select", "eq", "neq", "gte", "or", "order", "limit", "maybeSingle", "insert", "update", "delete", "upsert"]) {
        query[method] = (...args) => {
          call.operations.push([method, ...args]);
          return query;
        };
      }
      query.then = (resolve, reject) => (
        step.reject !== undefined
          ? Promise.reject(step.reject)
          : Promise.resolve({ data: null, error: null, ...step.result })
      ).then(resolve, reject);
      return query;
    },
  };
  return {
    client, calls,
    done() {
      assert.deepEqual(unexpected, [], "no unexpected queries");
      assert.equal(index, steps.length, "all expected queries were used");
    },
  };
}
const row = (table, data, error = null) => ({ table, result: { data, error } });

// ---------------------------------------------------------------------------
// siteContent: vote banner dish options merge behavior
// ---------------------------------------------------------------------------
describe("site content vote banner", () => {
  function content(db) {
    return loadSource("lib/siteContent.ts", { dependencies: { "./supabase": { supabase: db?.client ?? null } } });
  }

  it("keeps default dish options when the database is unavailable", async () => {
    const api = content();
    assert.equal(await api.getSiteContent(), api.LOCAL_DEFAULTS);
    assert.ok(api.LOCAL_DEFAULTS.voteBanner.dishOptions.length >= 2);
  });

  it("merges configured dish options over the defaults", async () => {
    const db = database(row("site_content", [
      { key: "vote_banner", value: {
        title: "Vote for Friday's Special",
        subtitle: "Subscribers decide!",
        dish_options: [{ label: "Option A: Biryani" }, { label: "Option B: Paneer Butter Masala" }, { label: "Option C: Dal Tadka" }],
      } },
    ]));
    const api = content(db);
    const result = await api.getSiteContent();
    assert.equal(result.voteBanner.title, "Vote for Friday's Special");
    assert.equal(result.voteBanner.subtitle, "Subscribers decide!");
    assert.deepEqual(result.voteBanner.dishOptions.map((d) => d.label), [
      "Option A: Biryani", "Option B: Paneer Butter Masala", "Option C: Dal Tadka",
    ]);
    db.done();
  });

  it("keeps all-or-nothing lists: any malformed entry falls back to defaults", async () => {
    const db = database(row("site_content", [
      { key: "vote_banner", value: { dish_options: [{ label: "  " }, { label: "Valid Dish" }] } },
    ]));
    const api = content(db);
    const result = await api.getSiteContent();
    assert.deepEqual(result.voteBanner.dishOptions, api.LOCAL_DEFAULTS.voteBanner.dishOptions);
    db.done();
  });

  it("returns arrays atomically: a single invalid entry keeps the default list", async () => {
    const db = database(row("site_content", [
      { key: "vote_banner", value: { dish_options: [{ label: "Good" }, 42] } },
    ]));
    const api = content(db);
    const result = await api.getSiteContent();
    assert.deepEqual(result.voteBanner.dishOptions, api.LOCAL_DEFAULTS.voteBanner.dishOptions);
    db.done();
  });
});
