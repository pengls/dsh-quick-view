/**
 * dsh-quick-view, node half.
 *
 * Deliberately empty: this bundle is a browser (client) plugin. The surface is
 * pure UI — it registers into slot seats the dsh web bundle already declares
 * — so there is no host-side service, tool, or composition to mount here. The
 * `dsh.client` declaration in package.json makes the host Loader scan the
 * browser bundle into window.__DSH_BOOT__; this node half only has to be a
 * valid cordis plugin entry so the row activates.
 */
export function apply(): void {}
