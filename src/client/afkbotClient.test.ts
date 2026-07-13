import { afterEach, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_API_URL, getBaseUrl } from "./afkbotClient.js";
import { cleanEnv } from "../config/env.js";

// Regression tests for the MCPB/DXT config-placeholder bug (mirrors itglue-mcp
// #73). manifest.json maps AFKBOT_API_URL to `${user_config.afkbot_api_url}`.
// afkbot_api_url is an OPTIONAL field; when it is left blank Claude Desktop
// injects the literal, unresolved string `${user_config.afkbot_api_url}` into
// the env var (not empty, not omitted). The old `process.env.AFKBOT_API_URL ||
// DEFAULT_API_URL` treated that truthy literal as a real base URL, so every
// tool built `${user_config.afkbot_api_url}/api/...` — a string with no URL
// scheme — and threw `TypeError: Invalid URL` on 100% of tool calls.

const PLACEHOLDER = "${user_config.afkbot_api_url}";
const originalApiUrl = process.env.AFKBOT_API_URL;

describe("getBaseUrl (issue #73: unresolved MCPB config placeholder)", () => {
  beforeEach(() => {
    delete process.env.AFKBOT_API_URL;
  });

  afterEach(() => {
    if (originalApiUrl === undefined) delete process.env.AFKBOT_API_URL;
    else process.env.AFKBOT_API_URL = originalApiUrl;
  });

  test("returns DEFAULT_API_URL when AFKBOT_API_URL is the unresolved placeholder", () => {
    process.env.AFKBOT_API_URL = PLACEHOLDER;
    assert.equal(getBaseUrl(), DEFAULT_API_URL);
  });

  test("the returned base URL is always a valid URL (the 'Invalid URL' repro)", () => {
    process.env.AFKBOT_API_URL = PLACEHOLDER;
    // The raw placeholder has no scheme, so building a request URL from it threw.
    assert.throws(() => new URL(`${PLACEHOLDER}/api/pto-requests`));
    // After the fix, getBaseUrl() yields the default, which is a valid URL.
    assert.doesNotThrow(() => new URL(`${getBaseUrl()}/api/pto-requests`));
  });

  test("a real AFKBOT_API_URL passes through", () => {
    process.env.AFKBOT_API_URL = "https://afkbot.example.com";
    assert.equal(getBaseUrl(), "https://afkbot.example.com");
  });

  test("trims surrounding whitespace on a real value", () => {
    process.env.AFKBOT_API_URL = "  https://afkbot.example.com  ";
    assert.equal(getBaseUrl(), "https://afkbot.example.com");
  });

  test("falls back to the default when AFKBOT_API_URL is empty", () => {
    process.env.AFKBOT_API_URL = "";
    assert.equal(getBaseUrl(), DEFAULT_API_URL);
  });

  test("falls back to the default when AFKBOT_API_URL is whitespace only", () => {
    process.env.AFKBOT_API_URL = "   ";
    assert.equal(getBaseUrl(), DEFAULT_API_URL);
  });

  test("falls back to the default when AFKBOT_API_URL is unset", () => {
    assert.equal(getBaseUrl(), DEFAULT_API_URL);
  });
});

describe("cleanEnv", () => {
  test("drops undefined, empty, whitespace, and ${...} placeholder values", () => {
    assert.equal(cleanEnv(undefined), undefined);
    assert.equal(cleanEnv(""), undefined);
    assert.equal(cleanEnv("   "), undefined);
    assert.equal(cleanEnv(PLACEHOLDER), undefined);
    assert.equal(cleanEnv(`  ${PLACEHOLDER}  `), undefined);
    assert.equal(cleanEnv("${user_config.azure_client_secret}"), undefined);
  });

  test("preserves and trims real values", () => {
    assert.equal(cleanEnv("real-value"), "real-value");
    assert.equal(cleanEnv("  https://afkbot.example.com  "), "https://afkbot.example.com");
  });
});
