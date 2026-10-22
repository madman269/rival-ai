# Rival.AI

**Someone is always ahead.**

Rival.AI is a React Native (Expo) training accountability game. Create a competitive AI character, log **real** workouts, and compete against **simulated** rival XP over a timed arc. The scores are a game, not a fitness measurement or a claim that your rival physically works out.

## Features

- Rival creator with gym, soccer, and tennis arenas and four personalities
- 7-, 14-, or 30-day seasons and an end-of-arc victory/defeat/draw screen
- Activity, minutes, notes and session history saved locally via AsyncStorage
- XP, levels, streaks, simulated rival scoring for missed days, and logbook
- Rival chat that uses the OpenAI API through a private backend
- Offline logging that works without an API key; chat displays a clear error while disconnected
- Settings for resetting the logbook or removing the rival

## Local setup

Requirements: Node.js 20+, npm, Expo Go or an emulator, and an OpenAI API key for optional live chat only.

1. From the repository root, install Expo dependencies:

    npm install

2. In a second terminal, install backend dependencies:

    cd backend
    npm install

   Copy backend/.env.example to backend/.env. Set OPENAI_API_KEY in backend/.env (server-side only). Start the backend:

    npm run dev

   Verify at http://localhost:3000/health. The aiConfigured property is true when a key is loaded.

3. In the repository root, create an untracked .env.local file containing:

    EXPO_PUBLIC_RIVAL_API_URL=http://YOUR_COMPUTER_LAN_IP:3000

   Use your computer's Wi-Fi IP address when testing on a physical phone on the same network; localhost does not reach your computer from a phone. For the Android emulator use http://10.0.2.2:3000; for iOS simulator localhost usually works. Production requires a deployed HTTPS backend.

4. From the repository root run:

    npx expo start -c

   Open with Expo Go or a configured emulator.

Training, XP, and the logbook work without the backend. Rival chat only generates AI messages with a functioning server and key.

## API

GET /health reports service health and AI configuration status.

POST /rival/respond accepts a JSON body containing rivalId, userText, and optional memory. Supported personas: TYRANT, SILENT_PRO, FALLEN_LEGEND. Successful responses return JSON containing a text field.

## XP scoring

- First session each day: player receives 20 XP plus 5 XP per 15 full minutes, up to 20 bonus XP.
- On the first session: simulated rival receives 24 XP plus 4 XP per 20 full minutes, up to 16 bonus XP.
- Additional sessions award 5 XP to each competitor.
- Calendar days without training award 12 simulated rival XP when the app is next opened.
- The streak counts consecutive days with at least one session, including yesterday if today is pending.
- After the configured number of days, the higher XP total wins.

Rival minutes and score are algorithmic simulations. User training is self-reported and is not verified.

## Development and security

- Expo app: app/
- Game and streak logic: lib/rivalGame.js
- Rival room: app/rival/room.js
- Backend: backend/index.js
- Frontend API URL: app/src/api/rivalApi.js

The OpenAI key must remain on the backend. Do not place it in Expo public environment variables. The backend provides rate limiting, capped inputs, and optional allowed browser origins via ALLOWED_ORIGINS.

**Important security note:** An older commit in this publicly visible repository tracked backend/.env. Deleting it on this branch does not erase Git history. Revoke/rotate any credentials previously stored there before using or deploying the app. Current per-IP rate limiting does not replace user authentication; add authentication and usage controls before a public launch.

Training data remains on-device; reinstalling or clearing app data can lose it. There is no cloud sync or account system yet.

Quality checks:

    npm run lint
    npx tsc --noEmit
    node --check lib/rivalGame.js
    node --check backend/index.js

Device testing is also recommended before release.

## Verify before review

After starting your backend with a fresh server-side key, run:

    node scripts/check-backend.cjs http://YOUR_COMPUTER_LAN_IP:3000

This makes one billable AI request and fails unless health and a nonempty live reply both succeed. A successful health check alone only confirms that a key is loaded, not that the key is valid. Never pass the key to this script or put it in Expo public variables.

On both iOS and Android, create a rival, log a session, close and reopen the app, confirm the session and XP persist, then send a live chat message. Record device/OS, commit, and pass/fail results in the PR. Automated browser tests do not count as native testing. Previously exposed credentials must be revoked in the provider account; deleting a tracked file does not revoke them.

Dependency updates preserve the current Expo SDK. Remaining audit findings that need an SDK migration require a separate compatibility review before public deployment. Inspect them with `npm audit` and `npm audit --prefix backend`; do not blindly apply `--force` upgrades.
