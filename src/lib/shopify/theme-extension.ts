/**
 * Deep link into the merchant's theme editor with the Neryn app embed selected.
 *
 * App embeds ship switched off — Shopify gives no way for an app to enable one
 * on the merchant's behalf, by design. Setup therefore has to hand the merchant
 * a one-click route to the right panel, or the widget silently never appears on
 * the storefront. That is the exact symptom App Store review reported.
 */

/** Matches the block filename in extensions/neryn-widget/blocks/. */
export const APP_EMBED_HANDLE = "neryn_chat";

/**
 * Shopify assigns the extension's UUID when `shopify app deploy` runs, so it
 * cannot be known from the repo. With it, the link opens the theme editor with
 * the Neryn embed already selected; without it, the link still opens the App
 * embeds panel, where the merchant switches Neryn on in one more click.
 */
export function themeEditorAppEmbedUrl(shopDomain: string): string {
  const base = `https://${shopDomain}/admin/themes/current/editor`;
  const extensionId = process.env.NEXT_PUBLIC_THEME_EXTENSION_ID;

  return extensionId
    ? `${base}?context=apps&activateAppId=${extensionId}/${APP_EMBED_HANDLE}`
    : `${base}?context=apps`;
}

/**
 * The theme editor cannot render inside the app's iframe, so this has to drive
 * the top window — the same constraint that made in-frame OAuth blank the app.
 */
export function openThemeEditor(shopDomain: string) {
  if (typeof window === "undefined") return;
  (window.top ?? window).location.href = themeEditorAppEmbedUrl(shopDomain);
}
