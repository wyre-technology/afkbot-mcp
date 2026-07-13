/**
 * An unresolved MCPB/DXT manifest placeholder, e.g.
 * `${user_config.afkbot_api_url}`.
 *
 * Desktop hosts (Claude Desktop) substitute the `${user_config.*}` templates in
 * manifest.json with the user's values. When an OPTIONAL user_config field is
 * left blank the host injects the template *verbatim* — the literal string
 * `${user_config.afkbot_api_url}` arrives in the env var instead of being empty
 * or omitted. Treating that non-empty literal as a real value breaks the server.
 * See afkbot-mcp / itglue-mcp #73.
 */
const CONFIG_PLACEHOLDER = /^\$\{.*\}$/;

/**
 * Normalise an environment variable read at ingress.
 *
 * Returns `undefined` for values that are effectively absent, so callers can
 * fall back to a default (`?? DEFAULT`) or treat a credential as missing:
 *   - undefined / empty / whitespace-only
 *   - an unresolved manifest placeholder like `${user_config.afkbot_api_url}`
 *
 * Otherwise returns the trimmed value.
 */
export function cleanEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || CONFIG_PLACEHOLDER.test(trimmed)) return undefined;
  return trimmed;
}
