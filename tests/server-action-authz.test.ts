import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Structural guard for a bug class this codebase already shipped twice.
 *
 * A server action is reachable as an ordinary POST to its route, independently
 * of the component that renders its form. Calling validateStoreAccess in the
 * page body guards the *render*, not the *submission* — every action here takes
 * its storeId straight from the request, so each one has to establish access
 * for itself. Four wizard actions and five inline page actions were written
 * without that check; this test fails the next one that is.
 */

const APP_DIR = path.join(__dirname, "..", "src", "app");

const AUTH_HELPERS = [
  "checkStoreAccess",
  "validateStoreAccess",
  "requireAppStoreMembership",
  // Local wrapper in the wizard actions; its own body calls checkStoreAccess.
  "callerOwnsStore"
];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

/** Body of the block that opens at the first `{` at or after `from`. */
function blockAt(src: string, from: number): string {
  const open = src.indexOf("{", from);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(open, i + 1);
  }
  return src.slice(open);
}

type Action = { file: string; name: string; body: string };

function serverActionsIn(file: string): Action[] {
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes('"use server"') && !src.includes("'use server'")) return [];

  const rel = path.relative(path.join(__dirname, ".."), file);
  const moduleLevel = /^\s*["']use server["']/.test(src);
  const pattern = moduleLevel
    ? /export\s+async\s+function\s+(\w+)\s*\(/g
    : /async\s+function\s+(\w+)\s*\(/g;

  const actions: Action[] = [];
  for (const match of src.matchAll(pattern)) {
    const body = blockAt(src, match.index! + match[0].length);
    // In a page file only the functions that declare the directive are actions.
    if (!moduleLevel && !/^\{\s*\n?\s*["']use server["']/.test(body)) continue;
    actions.push({ file: rel, name: match[1], body });
  }
  return actions;
}

const actions = walk(APP_DIR).flatMap(serverActionsIn);

describe("server actions authorize the storeId they are handed", () => {
  it("finds the server actions to check", () => {
    // Guards the guard: a broken matcher would silently pass everything.
    expect(actions.length).toBeGreaterThanOrEqual(9);
  });

  it.each(actions.map((a) => [`${a.file} :: ${a.name}`, a] as const))(
    "%s calls an auth helper",
    (_label, action) => {
      const guarded = AUTH_HELPERS.some((helper) => action.body.includes(helper));
      expect(
        guarded,
        `${action.name} in ${action.file} acts on a caller-supplied storeId without ` +
          `calling any of: ${AUTH_HELPERS.join(", ")}`
      ).toBe(true);
    }
  );
});
