---
name: PIN-gated access without user accounts
description: Pattern for apps that use a public link + short PIN instead of a login system (e.g. per-resource claim/lock flows).
---

When a product's access model is "anyone with the link can view, only the PIN holder can edit" instead of user accounts, treat the PIN as the full security boundary and hold it to that standard:

- The "claim"/first-write action must be atomic (single DB statement conditioned on the not-yet-claimed state), not a read-then-write — otherwise concurrent claims can race and corrupt ownership.
- Any endpoint that checks a PIN (verify or edit) needs brute-force protection — a short PIN (4-8 chars) is guessable quickly without a lockout. A simple per-resource-id + per-IP attempt counter with a temporary lockout is enough for a single-instance app.
- PINs are hashed server-side (salted, e.g. scrypt) and never returned in any read response.

**Why:** first pass of this pattern (PetID Tags app) shipped with a read-then-write claim and no PIN throttling; code review caught both as critical before ship.

**How to apply:** whenever building a link+PIN (no-login) access model, bake in atomic claim writes and PIN attempt throttling from the start rather than adding them after review.
