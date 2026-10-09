/**
 * Isolated regression coverage for PR #2. Uses existing TypeScript and Node tools.
 * Explicit command (does not invoke the live-database npm test script):
 *   node --test --test-timeout=10000 scripts/pr-unit.test.mjs
 *
 * Source is compiled in memory; no generated files, environment files, network
 * connections, or database writes are used. Each test gets fresh module state.
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
const NOW = Date.parse("2026-10-09T12:00:00.000Z");
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [NOW])); }
  static now() { return NOW; }
}

// Dependencies must be explicitly supplied: an unexpected import or fetch fails
// the test instead of silently reaching a real provider. Nothing is written out.
function loadSource(path, { dependencies = {}, env = {}, globals = {} } = {}) {
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
  const unexpected = [];
  const scope = {
    process: { env: { ...env } },
    window: undefined,
    document: undefined,
    Date: FixedDate,
    Math,
    console: { log() {}, warn() {}, error() {} },
    fetch: () => {
      unexpected.push("fetch");
      throw new Error("Unexpected network request");
    },
    ...globals,
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

// Model only Supabase's fluent boundary, not its filtering implementation.
// Every scripted query must be consumed, and unexpected extra queries fail even
// when production catches the exception. Tests also inspect important filters.
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
      for (const method of ["select", "eq", "neq", "gte", "or", "order", "limit", "maybeSingle", "insert", "update", "delete"]) {
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
function operation(db, index, name) {
  return db.calls[index].operations.find(([method]) => method === name)?.slice(1);
}
function hasOperation(db, index, name, ...args) {
  assert.ok(db.calls[index].operations.some((op) => {
    try { assert.deepEqual(op, [name, ...args]); return true; } catch { return false; }
  }), `query ${index} must include ${name}(${JSON.stringify(args)})`);
}
const poll = {
  id: "poll-test", title: "Friday special", description: "Choose your meal",
  status: "active", closes_at: new Date(NOW + 60_000).toISOString(),
  options: [{ id: "dal", label: "Dal" }, { id: "rice", text: "Rice" }, { id: "roti" }],
};
const customer = { id: "customer-test", name: "Test Subscriber", phone: "919000000001" };
const otpRow = { id: "otp-test", otp_code: "1234", attempts: 0, expires_at: new Date(NOW + 60_000).toISOString() };
const requestBody = { phone: "9000000001", pollId: poll.id, optionId: "dal", otp: "1234", recaptchaToken: "test-captcha-token" };
const request = (body = requestBody) => new Request("http://localhost/api/poll", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
function route(name, db, options = {}) {
  const captcha = mock.fn(options.captcha ?? (async () => ({ ok: true, skipped: false })));
  const send = mock.fn(options.send ?? (async () => ({ ok: true })));
  const api = loadSource(`app/api/poll/${name}/route.ts`, {
    dependencies: {
      "next/server": require("next/server"),
      "@/lib/supabase": { supabase: db?.client ?? null },
      "@/lib/server-recaptcha": { verifyRecaptcha: captcha },
      "@/lib/whatsapp": { sendWhatsAppOtp: send },
    },
    globals: { Math: Object.assign(Object.create(Math), { random: () => options.random ?? 0 }) },
  });
  return { ...api, captcha, send };
}
async function responseBody(response, status) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("content-type"), /application\/json/);
  return response.json();
}

// Published content and prices -------------------------------------------------
describe("published plans", () => {
  function plans(db) {
    return loadSource("lib/plans.ts", { dependencies: { "./supabase": { supabase: db?.client ?? null } } });
  }
  it("keeps the fallback catalogue available without a configured database", async () => {
    const api = plans();
    assert.equal(await api.getPublicPlans(), api.DEFAULT_PLANS);
    assert.deepEqual(api.DEFAULT_PLANS.map(({ code, meals, price }) => ({ code, meals, price })), [
      { code: "starter", meals: 6, price: 480 }, { code: "regular", meals: 12, price: 900 }, { code: "family", meals: 24, price: 1680 },
    ]);
  });
  for (const [name, step] of [
    ["empty catalogue", row("plans", [])],
    ["missing rows", row("plans", null)],
    ["database error", row("plans", null, { message: "offline" })],
    ["rejected query", { table: "plans", reject: new Error("offline") }],
  ]) {
    it(`uses defaults for ${name}`, async () => {
      const db = database(step);
      const api = plans(db);
      assert.equal(await api.getPublicPlans(), api.DEFAULT_PLANS);
      db.done();
    });
  }
  it("queries active subscriptions in price order and maps paise, features and popularity", async () => {
    const db = database(row("plans", [{ id: "p1", code: "weekly", name: "Weekly", meals: 7, price: 52550, popular: true, features: ["Fresh lunch"] }]));
    const result = await plans(db).getPublicPlans();
    assert.deepEqual(result, [{ id: "p1", code: "weekly", name: "Weekly", meals: 7, price: 526, popular: true, features: ["Fresh lunch"], color: "bg-brutal-accent" }]);
    hasOperation(db, 0, "eq", "active", true);
    hasOperation(db, 0, "neq", "code", "one_time");
    hasOperation(db, 0, "order", "price", { ascending: true });
    db.done();
  });
  for (const [price, expected] of [[0, 0], [10049, 100], [10050, 101], ["12000", 0], [null, 0]]) {
    it(`maps price ${JSON.stringify(price)} to ${expected} rupees`, async () => {
      const db = database(row("plans", [{ code: "weekly", price }]));
      const [plan] = await plans(db).getPublicPlans();
      assert.equal(plan.price, expected);
      assert.equal(plan.id, "weekly");
      assert.equal(plan.popular, false);
      db.done();
    });
  }
  for (const features of [undefined, null, [], "bad data"]) {
    it(`supplies usable meal features for ${JSON.stringify(features)}`, async () => {
      const db = database(row("plans", [{ code: "weekly", features }]));
      const [plan] = await plans(db).getPublicPlans();
      assert.deepEqual(plan.features, ["Fresh Butter Rotis", "Homestyle Seasonal Sabzi", "Healthy Dal Tadka", "Steamed Rice & Pickle"]);
      db.done();
    });
  }
  it("cycles card colours when the catalogue grows beyond five plans", async () => {
    const db = database(row("plans", Array.from({ length: 6 }, (_, i) => ({ code: `plan-${i}` }))));
    const result = await plans(db).getPublicPlans();
    assert.deepEqual(result.map((p) => p.color), ["bg-brutal-card-peach", "bg-brutal-accent", "bg-brutal-card-lilac", "bg-brutal-card-lemon", "bg-brutal-card-mint", "bg-brutal-card-peach"]);
    db.done();
  });
});

describe("published site content", () => {
  function content(db) {
    return loadSource("lib/siteContent.ts", { dependencies: { "./supabase": { supabase: db?.client ?? null } } });
  }
  it("returns local content without a database", async () => {
    const api = content();
    assert.equal(await api.getSiteContent(), api.LOCAL_DEFAULTS);
  });
  for (const [name, step] of [
    ["null data", row("site_content", null)], ["empty rows", row("site_content", [])],
    ["database error", row("site_content", null, { message: "unavailable" })],
    ["network error", { table: "site_content", reject: new Error("offline") }],
  ]) {
    it(`preserves all defaults for ${name}`, async () => {
      const db = database(step);
      const api = content(db);
      assert.deepEqual(await api.getSiteContent(), api.LOCAL_DEFAULTS);
      db.done();
    });
  }
  it("merges partial sections, preserves missing fields and translates vote_banner", async () => {
    const db = database(row("site_content", [
      { key: "hero", value: { titleAccent: "Fresh!" } },
      { key: "contact", value: { whatsappMessage: "Lunch & dinner?", email: "test@example.com" } },
      { key: "vote_banner", value: { title: "Choose Friday" } },
    ]));
    const api = content(db);
    const before = structuredClone(api.LOCAL_DEFAULTS);
    const result = await api.getSiteContent();
    assert.deepEqual(result, {
      ...before,
      hero: { ...before.hero, titleAccent: "Fresh!" },
      contact: { ...before.contact, whatsappMessage: "Lunch & dinner?", email: "test@example.com" },
      voteBanner: { ...before.voteBanner, title: "Choose Friday" },
    });
    assert.deepEqual(api.LOCAL_DEFAULTS, before, "fetches must not mutate shared defaults");
    assert.equal(db.calls.length, 1, "all content is fetched together");
    hasOperation(db, 0, "select", "key, value");
    db.done();
  });
  it("ignores unknown keys, non-object sections and invalid scalar overrides", async () => {
    const db = database(row("site_content", [
      { key: "hero", value: { titleLine1: " ", subtitle: "", titleAccent: null, badgeLine1: 42, titleLine2: false, extra: "ignored" } },
      { key: "contact", value: null }, { key: "process", value: "broken" },
      { key: "testimonials", value: 3 }, { key: "unknown", value: { title: "ignored" } },
    ]));
    const api = content(db);
    assert.deepEqual(await api.getSiteContent(), api.LOCAL_DEFAULTS);
    db.done();
  });
  it("replaces complete nonempty step and testimonial lists", async () => {
    const steps = [{ icon: "Truck", title: "Delivery", desc: "At noon" }];
    const items = [{ name: "Test Reader", role: "Subscriber", quote: "Fresh!", color: "bg-white" }];
    const db = database(row("site_content", [{ key: "process", value: { steps } }, { key: "testimonials", value: { items } }]));
    const api = content(db);
    const result = await api.getSiteContent();
    assert.deepEqual(result.process, { ...api.LOCAL_DEFAULTS.process, steps });
    assert.deepEqual(result.testimonials, { ...api.LOCAL_DEFAULTS.testimonials, items });
    db.done();
  });
  for (const invalid of [[], null, "invalid", {}]) {
    it(`keeps fallback lists for ${JSON.stringify(invalid)}`, async () => {
      const db = database(row("site_content", [{ key: "process", value: { steps: invalid } }, { key: "testimonials", value: { items: invalid } }]));
      const api = content(db);
      assert.deepEqual(await api.getSiteContent(), api.LOCAL_DEFAULTS);
      db.done();
    });
  }
});

// Poll endpoints --------------------------------------------------------------
describe("poll route common failures", () => {
  for (const name of ["active", "send-otp", "vote"]) {
    it(`${name}: reports an unconfigured database`, async () => {
      const api = route(name);
      const body = await responseBody(await (api.GET ? api.GET() : api.POST(request())), 500);
      assert.equal(body.error, "Database not configured");
      assert.equal(api.captcha.mock.callCount(), 0);
    });
  }
  for (const name of ["send-otp", "vote"]) {
    it(`${name}: handles malformed JSON without accessing the database`, async () => {
      const db = database();
      const api = route(name, db);
      const bad = new Request("http://localhost/api/poll", { method: "POST", body: "{" });
      const body = await responseBody(await api.POST(bad), 500);
      assert.equal(typeof body.error, "string");
      assert.equal(api.captcha.mock.callCount(), 0);
      db.done();
    });
  }
});

describe("GET active poll", () => {
  it("returns null when there is no active poll", async () => {
    const db = database(row("polls", null));
    assert.deepEqual(await responseBody(await route("active", db).GET(), 200), { poll: null });
    hasOperation(db, 0, "eq", "status", "active");
    hasOperation(db, 0, "order", "created_at", { ascending: false });
    hasOperation(db, 0, "limit", 1);
    db.done();
  });
  it("counts votes, rounds percentages and supports legacy or absent option labels", async () => {
    const db = database(row("polls", poll), row("poll_votes", [{ option_id: "dal" }, { option_id: "rice" }, { option_id: "dal" }]));
    assert.deepEqual(await responseBody(await route("active", db).GET(), 200), {
      poll: { id: poll.id, title: poll.title, description: poll.description, closesAt: poll.closes_at, totalVotes: 3, options: [
        { id: "dal", label: "Dal", votes: 2, percent: 67 },
        { id: "rice", label: "Rice", votes: 1, percent: 33 },
        { id: "roti", label: "Dish Option", votes: 0, percent: 0 },
      ] },
    });
    hasOperation(db, 1, "eq", "poll_id", poll.id);
    db.done();
  });
  for (const votes of [null, []]) {
    it(`returns zero percentages when votes are ${JSON.stringify(votes)}`, async () => {
      const db = database(row("polls", { ...poll, closes_at: null }), row("poll_votes", votes));
      const result = (await responseBody(await route("active", db).GET(), 200)).poll;
      assert.equal(result.totalVotes, 0);
      assert.equal(result.closesAt, null);
      assert.ok(result.options.every((option) => option.votes === 0 && option.percent === 0));
      db.done();
    });
  }
  for (const options of [null, {}]) {
    it(`tolerates malformed options ${JSON.stringify(options)}`, async () => {
      const db = database(row("polls", { ...poll, options }), row("poll_votes", []));
      assert.deepEqual((await responseBody(await route("active", db).GET(), 200)).poll.options, []);
      db.done();
    });
  }
  for (const offset of [-1, 0]) {
    it(`closes an expired poll at deadline offset ${offset}ms and records the winning dish`, async () => {
      const db = database(row("polls", { ...poll, closes_at: new Date(NOW + offset).toISOString() }), row("poll_votes", [{ option_id: "rice" }, { option_id: "dal" }, { option_id: "dal" }]), row("polls", null));
      assert.deepEqual(await responseBody(await route("active", db).GET(), 200), { poll: null });
      assert.deepEqual(operation(db, 2, "update"), [{ status: "closed", winner_option_id: "dal", closed_at: new Date(NOW).toISOString(), updated_at: new Date(NOW).toISOString() }]);
      hasOperation(db, 2, "eq", "id", poll.id);
      db.done();
    });
  }
  it("closes a poll with no votes without inventing a winner", async () => {
    const db = database(row("polls", { ...poll, closes_at: new Date(NOW).toISOString() }), row("poll_votes", []), row("polls", null));
    assert.deepEqual(await responseBody(await route("active", db).GET(), 200), { poll: null });
    assert.equal(operation(db, 2, "update")[0].winner_option_id, null);
    db.done();
  });
  for (const [name, step, expected] of [
    ["query error", row("polls", null, { message: "read failed" }), "read failed"],
    ["exception", { table: "polls", reject: new Error("offline") }, "offline"],
    ["non-Error rejection", { table: "polls", reject: "offline" }, "Internal server error"],
  ]) {
    it(`returns a JSON failure for ${name}`, async () => {
      const db = database(step);
      assert.deepEqual(await responseBody(await route("active", db).GET(), 500), { error: expected });
      db.done();
    });
  }
});

function eligibleSteps() {
  return [row("poll_otps", []), row("customers", customer), row("subscriptions", { id: "sub-test", status: "active" }), row("poll_votes", null)];
}
describe("POST send OTP", () => {
  for (const field of ["phone", "pollId"]) {
    for (const value of [undefined, "", 123]) {
      it(`rejects ${field}=${JSON.stringify(value)} before captcha or queries`, async () => {
        const db = database();
        const api = route("send-otp", db);
        const body = await responseBody(await api.POST(request({ ...requestBody, [field]: value })), 400);
        assert.match(body.error, field === "phone" ? /phone number/ : /Poll ID/);
        assert.equal(api.captcha.mock.callCount(), 0);
        assert.equal(api.send.mock.callCount(), 0);
        db.done();
      });
    }
  }
  it("rejects a failed captcha before any customer lookup or OTP send", async () => {
    const db = database();
    const api = route("send-otp", db, { captcha: async () => ({ ok: false }) });
    assert.match((await responseBody(await api.POST(request()), 403)).error, /Security check failed/);
    assert.deepEqual(api.captcha.mock.calls[0].arguments, [requestBody.recaptchaToken, "send_otp"]);
    assert.equal(api.send.mock.callCount(), 0);
    db.done();
  });
  for (const count of [3, 4]) {
    it(`rate-limits ${count} recent requests without sending a code`, async () => {
      const db = database(row("poll_otps", Array.from({ length: count }, (_, id) => ({ id }))));
      const api = route("send-otp", db);
      assert.match((await responseBody(await api.POST(request()), 429)).error, /10 minutes/);
      hasOperation(db, 0, "eq", "phone", customer.phone);
      hasOperation(db, 0, "gte", "created_at", new Date(NOW - 600_000).toISOString());
      assert.equal(api.send.mock.callCount(), 0);
      db.done();
    });
  }
  for (const [name, steps] of [
    ["unknown customer", [row("poll_otps", []), row("customers", null)]],
    ["customer lookup error", [row("poll_otps", []), row("customers", null, { message: "error" })]],
    ["inactive subscription", [row("poll_otps", []), row("customers", customer), row("subscriptions", null)]],
    ["subscription lookup error", [row("poll_otps", []), row("customers", customer), row("subscriptions", null, { message: "error" })]],
  ]) {
    it(`denies eligibility for ${name}`, async () => {
      const db = database(...steps);
      const api = route("send-otp", db);
      assert.equal((await responseBody(await api.POST(request()), 403)).code, "NO_ACTIVE_PLAN");
      assert.equal(api.send.mock.callCount(), 0);
      db.done();
    });
  }
  it("returns an existing choice without generating another OTP", async () => {
    const steps = eligibleSteps();
    steps[3] = row("poll_votes", { id: "vote-test", option_id: "rice" });
    const db = database(...steps);
    const api = route("send-otp", db);
    const body = await responseBody(await api.POST(request()), 409);
    assert.equal(body.code, "ALREADY_VOTED");
    assert.equal(body.votedOptionId, "rice");
    hasOperation(db, 3, "eq", "poll_id", poll.id);
    hasOperation(db, 3, "eq", "customer_id", customer.id);
    assert.equal(api.send.mock.callCount(), 0);
    db.done();
  });
  for (const [phone, random, expectedOtp] of [["9000000001", 0, "1000"], ["+91 90000-00001", 0.999999, "9999"]]) {
    it(`normalizes ${phone} and generates the four-digit OTP boundary ${expectedOtp}`, async () => {
      const steps = eligibleSteps();
      steps[0] = row("poll_otps", [{ id: "prior-1" }, { id: "prior-2" }]);
      const db = database(...steps, row("poll_otps", null), row("poll_otps", null));
      const api = route("send-otp", db, { random });
      const body = await responseBody(await api.POST(request({ ...requestBody, phone })), 200);
      assert.equal(body.ok, true);
      assert.equal(body.phoneMasked, "+91 90••••0001");
      assert.ok(!JSON.stringify(body).includes(expectedOtp), "response must not disclose OTP");
      assert.ok(!JSON.stringify(body).includes(customer.phone), "response must not disclose full phone");
      hasOperation(db, 1, "or", "phone.eq.919000000001,phone.eq.9000000001");
      hasOperation(db, 2, "eq", "customer_id", customer.id);
      hasOperation(db, 2, "eq", "status", "active");
      hasOperation(db, 4, "delete");
      hasOperation(db, 4, "eq", "phone", customer.phone);
      assert.deepEqual(operation(db, 5, "insert"), [{ phone: customer.phone, otp_code: expectedOtp, expires_at: new Date(NOW + 300_000).toISOString(), attempts: 0 }]);
      assert.equal(api.send.mock.callCount(), 1);
      assert.deepEqual(api.send.mock.calls[0].arguments, [customer.phone, expectedOtp]);
      db.done();
    });
  }
  it("does not send a code that failed to persist", async () => {
    const db = database(...eligibleSteps(), row("poll_otps", null), row("poll_otps", null, { message: "insert failed" }));
    const api = route("send-otp", db);
    assert.equal((await responseBody(await api.POST(request()), 500)).error, "Failed to create verification code");
    assert.equal(api.send.mock.callCount(), 0);
    db.done();
  });
  it("reports a thrown delivery failure", async () => {
    const db = database(...eligibleSteps(), row("poll_otps", null), row("poll_otps", null));
    const api = route("send-otp", db, { send: async () => { throw new Error("delivery unavailable"); } });
    assert.equal((await responseBody(await api.POST(request()), 500)).error, "delivery unavailable");
    db.done();
  });
});

describe("POST vote", () => {
  for (const field of ["phone", "pollId", "optionId", "otp"]) {
    it(`requires ${field} before any verification or writes`, async () => {
      const db = database();
      const api = route("vote", db);
      assert.match((await responseBody(await api.POST(request({ ...requestBody, [field]: undefined })), 400)).error, /Missing required/);
      assert.equal(api.captcha.mock.callCount(), 0);
      db.done();
    });
  }
  it("rejects failed captcha before accessing the database", async () => {
    const db = database();
    const api = route("vote", db, { captcha: async () => ({ ok: false }) });
    assert.match((await responseBody(await api.POST(request()), 403)).error, /Security check failed/);
    assert.deepEqual(api.captcha.mock.calls[0].arguments, [requestBody.recaptchaToken, "poll_vote"]);
    db.done();
  });
  for (const [name, active] of [
    ["missing", null], ["closed", { ...poll, status: "closed" }],
    ["expired", { ...poll, closes_at: new Date(NOW - 1).toISOString() }],
    ["exactly at deadline", { ...poll, closes_at: new Date(NOW).toISOString() }],
  ]) {
    it(`rejects a poll that is ${name} before reading the OTP`, async () => {
      const db = database(row("polls", active));
      assert.match((await responseBody(await route("vote", db).POST(request()), 410)).error, /poll has ended/);
      hasOperation(db, 0, "eq", "id", poll.id);
      db.done();
    });
  }
  for (const error of [null, { message: "read failed" }]) {
    it(`rejects an unavailable OTP (${error?.message ?? "not found"})`, async () => {
      const db = database(row("polls", poll), row("poll_otps", null, error));
      assert.match((await responseBody(await route("vote", db).POST(request()), 400)).error, /No active verification code/);
      db.done();
    });
  }
  it("deletes an expired code and never records a vote", async () => {
    const db = database(row("polls", poll), row("poll_otps", { ...otpRow, expires_at: new Date(NOW - 1).toISOString() }), row("poll_otps", null));
    assert.match((await responseBody(await route("vote", db).POST(request()), 400)).error, /expired/);
    hasOperation(db, 2, "delete");
    hasOperation(db, 2, "eq", "id", otpRow.id);
    db.done();
  });
  it("increments attempts for a wrong OTP without looking up the customer or voting", async () => {
    const db = database(row("polls", poll), row("poll_otps", { ...otpRow, attempts: 2 }), row("poll_otps", null));
    assert.match((await responseBody(await route("vote", db).POST(request({ ...requestBody, otp: "9999" })), 400)).error, /Incorrect verification code/);
    assert.deepEqual(operation(db, 2, "update"), [{ attempts: 3 }]);
    hasOperation(db, 2, "eq", "id", otpRow.id);
    db.done();
  });
  it("rejects an unknown customer after OTP validation", async () => {
    const db = database(row("polls", poll), row("poll_otps", otpRow), row("customers", null));
    assert.equal((await responseBody(await route("vote", db).POST(request()), 403)).error, "Customer not recognized");
    db.done();
  });
  for (const otp of [" 1234 ", 1234]) {
    it(`accepts OTP ${JSON.stringify(otp)}, records the choice and consumes the code`, async () => {
      const db = database(row("polls", { ...poll, closes_at: null }), row("poll_otps", { ...otpRow, otp_code: " 1234 " }), row("customers", customer), row("poll_votes", null), row("poll_otps", null));
      const body = await responseBody(await route("vote", db).POST(request({ ...requestBody, phone: "+91 90000 00001", otp })), 200);
      assert.equal(body.ok, true);
      hasOperation(db, 1, "eq", "phone", customer.phone);
      hasOperation(db, 1, "order", "created_at", { ascending: false });
      hasOperation(db, 1, "limit", 1);
      hasOperation(db, 2, "or", "phone.eq.919000000001,phone.eq.9000000001");
      assert.deepEqual(operation(db, 3, "insert"), [{ poll_id: poll.id, customer_id: customer.id, option_id: "dal" }]);
      hasOperation(db, 4, "delete");
      hasOperation(db, 4, "eq", "id", otpRow.id);
      db.done();
    });
  }
  for (const error of [{ code: "23505", message: "duplicate key" }, { code: "other", message: "unique constraint" }]) {
    it(`maps duplicate insert ${error.code} to ALREADY_VOTED and retains the OTP`, async () => {
      const db = database(row("polls", poll), row("poll_otps", otpRow), row("customers", customer), row("poll_votes", null, error));
      assert.equal((await responseBody(await route("vote", db).POST(request()), 409)).code, "ALREADY_VOTED");
      db.done();
    });
  }
  it("reports other vote insertion failures and retains the OTP for retry", async () => {
    const db = database(row("polls", poll), row("poll_otps", otpRow), row("customers", customer), row("poll_votes", null, { code: "XX000", message: "write failed" }));
    assert.equal((await responseBody(await route("vote", db).POST(request()), 500)).error, "write failed");
    db.done();
  });
  it("accepts an OTP exactly at expiry while the poll deadline is still one millisecond away", async () => {
    const db = database(
      row("polls", { ...poll, closes_at: new Date(NOW + 1).toISOString() }),
      row("poll_otps", { ...otpRow, expires_at: new Date(NOW).toISOString() }),
      row("customers", customer), row("poll_votes", null), row("poll_otps", null),
    );
    assert.equal((await responseBody(await route("vote", db).POST(request()), 200)).ok, true);
    assert.deepEqual(operation(db, 3, "insert"), [{ poll_id: poll.id, customer_id: customer.id, option_id: "dal" }]);
    hasOperation(db, 4, "delete");
    db.done();
  });
  it("handles database transport exceptions as JSON errors", async () => {
    const db = database({ table: "polls", reject: new Error("offline") });
    assert.equal((await responseBody(await route("vote", db).POST(request()), 500)).error, "offline");
    db.done();
  });
});

// Provider boundaries ---------------------------------------------------------
describe("server reCAPTCHA", () => {
  function verifier(data, { env = {}, ok = true, fetch: fetchImpl } = {}) {
    const fetch = mock.fn(fetchImpl ?? (async () => ({ ok, json: async () => data })));
    const api = loadSource("lib/server-recaptcha.ts", {
      env: { RECAPTCHA_SECRET_KEY: "synthetic-secret", ...env }, globals: { fetch },
    });
    return { ...api, fetch };
  }
  it("skips verification without a secret and makes no request", async () => {
    const api = verifier(null, { env: { RECAPTCHA_SECRET_KEY: "" } });
    assert.deepEqual(await api.verifyRecaptcha(undefined, "send_otp"), { ok: true, skipped: true });
    assert.equal(api.fetch.mock.callCount(), 0);
  });
  for (const token of [undefined, null, 1234567890, {}, "", "123456789"]) {
    it(`rejects malformed token ${JSON.stringify(token)} without contacting Google`, async () => {
      const api = verifier({ success: true, score: 1 });
      const result = await api.verifyRecaptcha(token, "send_otp");
      assert.equal(result.ok, false);
      assert.equal(result.skipped, false);
      assert.equal(api.fetch.mock.callCount(), 0);
    });
  }
  for (const [score, expected] of [[0, false], [0.4999, false], [0.5, true], [1, true]]) {
    it(`applies the inclusive default score threshold to ${score}`, async () => {
      const api = verifier({ success: true, score, action: "send_otp" });
      assert.deepEqual(await api.verifyRecaptcha("1234567890", "send_otp"), { ok: expected, skipped: false, score });
      assert.equal(api.fetch.mock.callCount(), 1);
    });
  }
  it("honours a configured score threshold", async () => {
    const api = verifier({ success: true, score: 0.7 }, { env: { RECAPTCHA_MIN_SCORE: "0.8" } });
    assert.deepEqual(await api.verifyRecaptcha("1234567890", "poll_vote"), { ok: false, skipped: false, score: 0.7 });
  });
  it("URL-encodes credentials and tokens and disables verification caching", async () => {
    const api = verifier({ success: true, score: 0.9 }, { env: { RECAPTCHA_SECRET_KEY: "test & secret" } });
    await api.verifyRecaptcha("token+with&special=characters", "send_otp");
    const [url, options] = api.fetch.mock.calls[0].arguments;
    assert.equal(url, "https://www.google.com/recaptcha/api/siteverify");
    assert.equal(options.method, "POST");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers["Content-Type"], "application/x-www-form-urlencoded");
    assert.deepEqual(Object.fromEntries(new URLSearchParams(options.body)), { secret: "test & secret", response: "token+with&special=characters" });
  });
  for (const [name, data, options] of [
    ["unsuccessful verification", { success: false, score: 1 }, {}],
    ["absent success field", {}, {}],
    ["HTTP failure", { success: true, score: 1 }, { ok: false }],
  ]) {
    it(`denies ${name}`, async () => {
      const api = verifier(data, options);
      const result = await api.verifyRecaptcha("1234567890", "send_otp");
      assert.equal(result.ok, false);
      assert.equal(result.skipped, false);
    });
  }
  it("keeps action mismatches advisory as documented", async () => {
    const api = verifier({ success: true, score: 0.9, action: "different_action" });
    assert.deepEqual(await api.verifyRecaptcha("1234567890", "send_otp"), { ok: true, skipped: false, score: 0.9 });
  });
  it("accepts successful verification without a numeric score", async () => {
    const api = verifier({ success: true });
    assert.deepEqual(await api.verifyRecaptcha("1234567890", "send_otp"), { ok: true, skipped: false, score: undefined });
  });
  for (const [name, fetch] of [
    ["transport failure", async () => { throw new Error("offline"); }],
    ["invalid JSON", async () => ({ ok: true, json: async () => { throw new SyntaxError("invalid JSON"); } })],
  ]) {
    it(`uses documented availability fallback on ${name}`, async () => {
      const api = verifier(null, { fetch });
      assert.deepEqual(await api.verifyRecaptcha("1234567890", "send_otp"), { ok: true, skipped: true });
    });
  }
});

describe("browser reCAPTCHA", () => {
  function browser({ key = "test-site-key", window = {}, document } = {}) {
    return loadSource("lib/recaptcha.ts", {
      env: { NEXT_PUBLIC_RECAPTCHA_SITE_KEY: key },
      dependencies: { react: require("react") }, globals: { window, document },
    });
  }
  it("is safe during server rendering", async () => {
    const api = loadSource("lib/recaptcha.ts", {
      env: { NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "test-key" }, dependencies: { react: require("react") },
    });
    api.initializeRecaptcha();
    assert.equal(await api.getRecaptchaToken("send_otp"), null);
  });
  it("does not touch browser APIs without a configured key", async () => {
    const api = browser({ key: "" });
    api.initializeRecaptcha();
    assert.equal(await api.getRecaptchaToken("send_otp"), null);
  });
  it("injects one asynchronous script even when mounted twice", () => {
    const scripts = [];
    const api = browser({ document: {
      querySelector(selector) {
        assert.equal(selector, 'script[src*="recaptcha/api.js"]');
        return scripts[0] ?? null;
      },
      createElement(tag) { assert.equal(tag, "script"); return {}; },
      head: { appendChild(script) { scripts.push(script); } },
    } });
    api.initializeRecaptcha();
    api.initializeRecaptcha();
    assert.deepEqual(scripts, [{ src: "https://www.google.com/recaptcha/api.js?render=test-site-key", async: true }]);
  });
  it("reuses an existing reCAPTCHA script", () => {
    const api = browser({ document: { querySelector: () => ({ src: "existing-script" }) } });
    assert.doesNotThrow(() => api.initializeRecaptcha());
  });
  it("returns null while the script is unavailable", async () => {
    assert.equal(await browser().getRecaptchaToken("send_otp"), null);
  });
  it("waits for readiness and requests a fresh token for each action", async () => {
    const readyCallbacks = [];
    const execute = mock.fn(async (_key, { action }) => `token-for-${action}`);
    const api = browser({ window: { grecaptcha: { ready: (cb) => readyCallbacks.push(cb), execute } } });
    const first = api.getRecaptchaToken("send_otp");
    assert.equal(execute.mock.callCount(), 0);
    readyCallbacks.shift()();
    assert.equal(await first, "token-for-send_otp");
    const second = api.getRecaptchaToken("poll_vote");
    readyCallbacks.shift()();
    assert.equal(await second, "token-for-poll_vote");
    assert.deepEqual(execute.mock.calls.map((call) => call.arguments), [["test-site-key", { action: "send_otp" }], ["test-site-key", { action: "poll_vote" }]]);
  });
  it("propagates a synchronous ready failure as a rejected promise", async () => {
    const api = browser({ window: { grecaptcha: { ready() { throw new Error("ready failed"); } } } });
    await assert.rejects(api.getRecaptchaToken("poll_vote"), /ready failed/);
  });
  it("resolves null when Google rejects token generation", async () => {
    const api = browser({ window: { grecaptcha: { ready: (cb) => cb(), execute: async () => { throw new Error("unavailable"); } } } });
    assert.equal(await api.getRecaptchaToken("poll_vote"), null);
  });
});

describe("WhatsApp OTP delivery", () => {
  function whatsapp({ env = {}, fetch: fetchImpl } = {}) {
    const fetch = mock.fn(fetchImpl ?? (async () => ({ ok: true })));
    return { ...loadSource("lib/whatsapp.ts", {
      env: { WHATSAPP_PROVIDER: "meta", META_ACCESS_TOKEN: "synthetic-token", META_PHONE_NUMBER_ID: "synthetic-id", ...env },
      globals: { fetch },
    }), fetch };
  }
  for (const phone of ["9000000001", "+91 90000-00001"]) {
    it(`sends an authenticated Meta message to normalized number ${phone}`, async () => {
      const api = whatsapp();
      assert.deepEqual(await api.sendWhatsAppOtp(phone, "1234"), { ok: true });
      assert.equal(api.fetch.mock.callCount(), 1);
      const [url, options] = api.fetch.mock.calls[0].arguments;
      assert.equal(url, "https://graph.facebook.com/v21.0/synthetic-id/messages");
      assert.equal(options.method, "POST");
      assert.deepEqual(options.headers, { Authorization: "Bearer synthetic-token", "Content-Type": "application/json" });
      const message = JSON.parse(options.body);
      assert.deepEqual({ ...message, text: undefined }, { messaging_product: "whatsapp", recipient_type: "individual", to: "919000000001", type: "text", text: undefined });
      assert.equal(message.text.preview_url, false);
      assert.match(message.text.body, /\*1234\*/);
      assert.match(message.text.body, /5 minutes/);
    });
  }
  for (const env of [{ META_ACCESS_TOKEN: "" }, { META_PHONE_NUMBER_ID: "" }, { WHATSAPP_PROVIDER: "development" }]) {
    it(`uses the documented development fallback for ${Object.keys(env)[0]}`, async () => {
      const api = whatsapp({ env });
      assert.deepEqual(await api.sendWhatsAppOtp("9000000001", "1234"), { ok: true });
      assert.equal(api.fetch.mock.callCount(), 0);
    });
  }
  for (const json of [async () => ({ error: "denied" }), async () => { throw new SyntaxError("not JSON"); }]) {
    it("returns a useful delivery error even if the failure body is not JSON", async () => {
      const api = whatsapp({ fetch: async () => ({ ok: false, json }) });
      assert.deepEqual(await api.sendWhatsAppOtp("9000000001", "1234"), { ok: false, error: "Failed to send WhatsApp message via Meta API" });
    });
  }
  for (const [error, message] of [[new Error("offline"), "offline"], ["offline", "Network error"]]) {
    it(`handles transport rejection as ${message}`, async () => {
      const api = whatsapp({ fetch: async () => { throw error; } });
      assert.deepEqual(await api.sendWhatsAppOtp("9000000001", "1234"), { ok: false, error: message });
    });
  }
});

describe("Supabase client configuration", () => {
  for (const [name, env, window, expectedKey] of [
    ["server service key", { NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service" }, undefined, "service"],
    ["server anon fallback", { NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" }, undefined, "anon"],
    ["browser anon key", { NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service" }, {}, "anon"],
    ["browser missing anon key", { NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", SUPABASE_SERVICE_ROLE_KEY: "service" }, {}, null],
    ["missing URL", { SUPABASE_SERVICE_ROLE_KEY: "service" }, undefined, null],
    ["missing keys", { NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid" }, undefined, null],
  ]) {
    it(`selects credentials for ${name}`, () => {
      const client = {};
      const createClient = mock.fn(() => client);
      const api = loadSource("lib/supabase.ts", { env, globals: { window }, dependencies: { "@supabase/supabase-js": { createClient } } });
      if (expectedKey === null) {
        assert.equal(api.supabase, null);
        assert.equal(createClient.mock.callCount(), 0);
      } else {
        assert.equal(api.supabase, client);
        assert.equal(createClient.mock.callCount(), 1);
        assert.deepEqual(createClient.mock.calls[0].arguments, [env.NEXT_PUBLIC_SUPABASE_URL, expectedKey, { auth: { persistSession: false, autoRefreshToken: false } }]);
      }
    });
  }
});

// Server rendering integration: real React, Next Link, icons and motion. These
// cover first-render content; browser interactions require a DOM test runner.
describe("page rendering", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  function pages() {
    const shared = {
      react: React,
      "react/jsx-runtime": require("react/jsx-runtime"),
      "framer-motion": require("framer-motion"),
      "lucide-react": require("lucide-react"),
      "next/link": require("next/link"),
    };
    const plans = loadSource("lib/plans.ts", { dependencies: { "./supabase": { supabase: null } } });
    const content = loadSource("lib/siteContent.ts", { dependencies: { "./supabase": { supabase: null } } });
    const recaptcha = loadSource("lib/recaptcha.ts", { dependencies: shared });
    const widget = loadSource("components/MenuVotingWidget.tsx", { dependencies: { ...shared, "@/lib/recaptcha": recaptcha } });
    const branch = loadSource("components/AnimatedBranch.tsx", { dependencies: shared });
    const home = loadSource("app/page.tsx", { dependencies: {
      ...shared, "@/lib/plans": plans, "@/lib/siteContent": content,
      "@/components/MenuVotingWidget": widget, "@/components/AnimatedBranch": branch,
    } });
    const vote = loadSource("app/vote/page.tsx", { dependencies: { ...shared, "@/components/MenuVotingWidget": widget } });
    return { home, vote, widget, content, render: (Component) => renderToStaticMarkup(React.createElement(Component)) };
  }
  it("renders fallback plan names, prices and features before data is fetched", () => {
    const { home, render } = pages();
    const html = render(home.default);
    for (const text of ["Starter", "Regular", "Family", "₹480", "₹900", "₹1680", "4 Butter Rotis", "Most Chosen"]) {
      assert.ok(html.includes(text), `first render should include ${text}`);
    }
    assert.match(html, /id="plans"/);
    home.assertNoNetwork();
  });
  it("uses one encoded WhatsApp ordering destination for all homepage CTAs", () => {
    const { home, content, render } = pages();
    const html = render(home.default);
    const { whatsappNumber, whatsappMessage } = content.LOCAL_DEFAULTS.contact;
    const expected = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    const destinations = [...html.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map((match) => match[1]);
    assert.ok(destinations.length >= 3, "plan CTAs should have ordering links");
    assert.deepEqual([...new Set(destinations)], [expected]);
    home.assertNoNetwork();
  });
  it("embeds the voting widget and an accessible plans destination on the homepage", () => {
    const { home, render } = pages();
    const html = render(home.default);
    assert.match(html, /id="vote"/);
    assert.match(html, /href="#vote"/);
    assert.match(html, /Loading Community Poll/);
    assert.match(html, /href="#plans"/);
    home.assertNoNetwork();
  });
  it("renders the dedicated voting page with home navigation and secure external help", () => {
    const { vote, render } = pages();
    const html = render(vote.default);
    assert.match(html, /href="\/"/);
    assert.match(html, /Back to Home/);
    assert.match(html, /Loading Community Poll/);
    assert.match(html, /How Menu Voting Works/);
    const helpLink = html.match(/<a\b[^>]*href="https:\/\/wa\.me\/[^>]*>/)?.[0];
    assert.ok(helpLink);
    assert.match(helpLink, /target="_blank"/);
    assert.match(helpLink, /rel="noopener noreferrer"/);
    assert.match(vote.metadata.title, /Weekly Menu Voting/);
    vote.assertNoNetwork();
  });
  it("keeps the voting form hidden until the active poll is loaded", () => {
    const { widget, render } = pages();
    const html = render(widget.MenuVotingWidget);
    assert.match(html, /Loading Community Poll/);
    assert.doesNotMatch(html, /<form\b|<input\b/);
    widget.assertNoNetwork();
  });
});
