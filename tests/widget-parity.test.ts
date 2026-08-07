import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The storefront widget exists twice on disk and has to stay one program.
 *
 * Shopify serves theme app extension assets from its own CDN and cannot read
 * the app's public directory, so the extension needs its own copy. Neryn's own
 * site loads the public one. A fix applied to one copy and not the other means
 * merchants and the demo drift apart silently — the widget is the part of this
 * product nobody is watching while it runs.
 */

const root = path.join(__dirname, "..");
const EXTENSION_COPY = "extensions/neryn-widget/assets/neryn-widget.js";
const PUBLIC_COPY = "public/widget.js";

const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

describe("storefront widget copies", () => {
  it("are byte-identical", () => {
    expect(read(PUBLIC_COPY)).toBe(read(EXTENSION_COPY));
  });

  it("support both bootstrap paths", () => {
    const source = read(EXTENSION_COPY);
    // The app embed block sets __NERYN__ with a shop domain and no store id;
    // the direct embed sets __AI_SALES_AGENT__ or a ?storeId= on the script src.
    expect(source).toContain("__NERYN__");
    expect(source).toContain("__AI_SALES_AGENT__");
    expect(source).toContain("/api/widget/store-info?shop=");
  });

  it("no longer depends on an app-injected script tag", () => {
    // App Store review (ref 108334): "Injecting code to theme editor is not
    // allowed." Nothing in the widget should reach for a ScriptTag again.
    expect(read(EXTENSION_COPY).toLowerCase()).not.toContain("scripttag");
  });
});

describe("theme app extension", () => {
  it("declares a theme extension", () => {
    const toml = read("extensions/neryn-widget/shopify.extension.toml");
    expect(toml).toMatch(/type\s*=\s*"theme"/);
  });

  it("ships an app embed block that targets the page body", () => {
    const block = read("extensions/neryn-widget/blocks/neryn_chat.liquid");
    // App embeds must declare target "body"; a section-style block would need a
    // merchant to place it manually on every template.
    expect(block).toMatch(/"target"\s*:\s*"body"/);
    expect(block).toContain("shop.permanent_domain");
    expect(block).toContain("'neryn-widget.js' | asset_url");
  });

  it("names the block the deep link points at", async () => {
    const { APP_EMBED_HANDLE } = await import("../src/lib/shopify/theme-extension");
    expect(
      fs.existsSync(
        path.join(root, "extensions/neryn-widget/blocks", `${APP_EMBED_HANDLE}.liquid`)
      )
    ).toBe(true);
  });
});

describe("no theme code injection is offered to merchants", () => {
  /**
   * App Store review, ref 108334: "Injecting code to theme editor is not
   * allowed." The Configuration page used to print a <script> block under
   * "Inject this script just before the closing </body> tag of your theme",
   * and the reviewer pasted it into theme.liquid. Nothing in the merchant UI
   * should ask for that again.
   */
  const merchantUi = ["src/app/dashboard", "src/app/onboarding", "src/components/app"];

  function filesUnder(dir: string): string[] {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return filesUnder(full);
      return /\.tsx?$/.test(e.name) ? [full] : [];
    });
  }

  /**
   * Comments are stripped first: what matters is what reaches the merchant, not
   * what the code says about the copy it replaced. A note explaining why the
   * snippet was removed should not read as the snippet still being there.
   */
  function stripComments(src: string): string {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
  }

  const sources = merchantUi
    .flatMap(filesUnder)
    .map((rel) => [rel, stripComments(read(rel))] as const);

  it("scans the merchant-facing pages", () => {
    expect(sources.length).toBeGreaterThan(5);
  });

  it("never tells a merchant to paste a script into their theme", () => {
    const offenders = sources
      .filter(([, src]) => /inject this script|closing\s*&lt;\/body&gt;|Copy Integration Code/i.test(src))
      .map(([rel]) => rel);
    expect(offenders).toEqual([]);
  });

  it("does not hand out a widget.js snippet", () => {
    const offenders = sources
      .filter(([, src]) => src.includes("/widget.js"))
      .map(([rel]) => rel);
    expect(offenders).toEqual([]);
  });
});
