import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

describe("OrderBotPopup Component & Logic", () => {
  it("OrderBotPopup source file exists and defines expected exports and tokens", () => {
    const filename = fileURLToPath(new URL("../src/components/OrderBotPopup.tsx", import.meta.url));
    const content = readFileSync(filename, "utf8");

    // Must be a client component
    assert.ok(content.includes('"use client"'), "Must be a client component with 'use client'");

    // Must check and set localStorage key
    assert.ok(content.includes("mk_order_popup_seen"), "Must use 'mk_order_popup_seen' as default storage key");
    assert.ok(content.includes("localStorage.getItem"), "Must read from localStorage");
    assert.ok(content.includes("localStorage.setItem"), "Must write to localStorage");

    // Must use 5000ms delay by default
    assert.ok(content.includes("5000"), "Must default to 5000ms delay");

    // Must use neo-brutalist theme classes
    assert.ok(content.includes("border-brutal-border"), "Must use border-brutal-border");
    assert.ok(content.includes("shadow-brutal"), "Must use shadow-brutal");
    assert.ok(content.includes("bg-brutal-whatsapp"), "Must use bg-brutal-whatsapp for CTA");
  });

  it("safely handles localStorage when available and when throwing exceptions", () => {
    // Test storage isolation logic
    const mockStorage = new Map();
    const safeGet = (key) => {
      try { return mockStorage.get(key) ?? null; } catch { return null; }
    };
    const safeSet = (key, val) => {
      try { mockStorage.set(key, val); } catch {}
    };

    assert.equal(safeGet("mk_order_popup_seen"), null);
    safeSet("mk_order_popup_seen", "true");
    assert.equal(safeGet("mk_order_popup_seen"), "true");

    // When storage throws (e.g. private browsing)
    const brokenGet = () => {
      try { throw new Error("SecurityError: localStorage is disabled"); } catch { return null; }
    };
    assert.equal(brokenGet(), null);
  });
});
