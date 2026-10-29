# Rival AI V2 — The Rebirth

## Product vision
A conversational AI rival app: talk naturally about anything, like a general-purpose chatbot, while each customizable rival behaves as a competitive character with its own simulated life.

## Confirmed product requirements
- Multiple independently created rivals, each with a separate one-on-one chat; no rival-to-rival chat or group messaging.
- Each rival has a name, static portrait (preset or custom uploaded image), user-defined description, personality, and adjustable aggression (0–100).
- Natural, open-topic conversations rather than forcing every answer into a productivity lecture.
- Persistent conversation history and per-rival memory with user controls to review/reset memory.
- Rivals simulate studying, working out, resting, and making progress. Activities must be visibly described as fictional/simulated, with coherent time and progress accounting, not represented as real-world accomplishments.
- Rivals can initiate conversations and send opt-in push notifications. Respect quiet hours, frequency limits, per-rival mute, and notification permissions.
- Rival intensity should affect tone, not enable abuse, threats, discrimination, or harmful pressure.

## What exists on main (as audited October 29, 2026)
- Expo 54 / React Native 0.81 / Expo Router app and Express backend with OpenAI SDK.
- Existing rival creation UI saves a single rival under `RIVAL_AI_CURRENT_RIVAL` in AsyncStorage.
- Backend `POST /rival/respond` uses fixed archetype prompts, with a passed-in memory object; `GET /health` exists.
- Reuse the stack, safe UI pieces, backend scaffolding, and any tested progression logic where they fit. Existing behavior and release readiness need verification.

## Development milestones
1. **Baseline and safety:** audit screens/routes and assets, check dependency/install and build health, ensure no secrets are committed, add smoke tests. Do not edit or merge into main until tests pass.
2. **Chat foundation:** typed character schema and multi-rival storage, separate chat histories, server-authoritative prompting with editable character descriptions and an aggression scalar, natural conversational turn handling.
3. **Character studio:** image picking, rival list, profiles, edit/delete, independent personality and memory controls.
4. **Simulated life:** deterministic per-rival activity schedule/state, accurate timestamps and status, conversational callbacks.
5. **Initiative:** backend scheduler, notification tokens, opt-in push delivery, quiet hours, per-rival limits and throttling.
6. **Release hardening:** authentication and private-data access controls, rate limits, server-side secrets, moderation/guardrails, cost controls, automated tests, iOS/Android device testing.

## Initial acceptance checks
- Create two rivals; restarting the app preserves both and their separate histories.
- Changing rival A's aggression, personality, photo, or memory does not change rival B.
- Ask a non-productivity question; rival responds conversationally in-character.
- Rival-generated activity status is consistent after app restarts and clearly simulated.
- Push notifications never send without permission, during quiet hours, or after mute.
- Backend secrets never enter the mobile bundle or Git history.

## Scope discipline
No animated avatars, 3D models, group chats, or rival-to-rival interaction. Avoid adding RPG mechanics or leaderboards before core conversation quality passes tests.
