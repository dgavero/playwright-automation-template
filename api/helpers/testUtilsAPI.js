// Thin "safe" layer that does NOT throw.
// - ok: boolean (HTTP ok AND no GraphQL errors)
// - error: short string for expect()/logging
// - body: parsed JSON (or null)

import { graphql } from './graphqlClient.js';

export async function safeGraphQL(api, args) {
  const { res, body } = await graphql(api, args);

  // Transport-level failure
  if (!res.ok()) {
    const text = await res.text().catch(() => '');
    return { ok: false, body, error: `HTTP ${res.status()} ${text?.slice(0, 200)}` };
    // keep it short so it fits nicely in Discord/console lines
  }

  // GraphQL-level failure (HTTP 200 but resolver/schema errors)
  if (body?.errors?.length) {
    return { ok: false, body, error: JSON.stringify(body.errors).slice(0, 400) };
  }

  return { ok: true, body, error: null };
}
