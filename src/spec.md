# Specification

## Summary
**Goal:** Make the Admin Panel and other key views reachable via stable, shareable URLs using hash-based routing, with clear access-blocked and not-found states.

**Planned changes:**
- Add hash-based routing to support `#/` (home), `#/admin`, `#/orders`, `#/checkout`, and `#/product/<productId>` and keep the current view on refresh.
- Update in-app navigation that currently uses in-memory view state to also set the appropriate URL hash, enabling bookmark/share and correct browser Back/Forward behavior.
- Add a persistent, page-level access-blocked message for `#/admin` when the user is unauthenticated or not an admin, including clear actions to return Home and to Login when applicable.
- Add a simple Not Found view for unknown hashes (e.g., `#/does-not-exist`) with English text and a button to return Home.

**User-visible outcome:** Users can directly open and share links like `#/admin`, `#/orders`, and `#/product/<productId>`; refreshing preserves the current page; unauthorized admin access shows a clear on-page explanation with actions; unknown URLs show a Not Found page with a Home link.
