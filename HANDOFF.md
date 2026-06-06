# Gluuti BFF Integration — Handoff

## What we're building

Integrating the Gluuti app (React UI + .NET API) with the Nexus IAM system using the
Backend for Frontend (BFF) pattern. A new `bff/` .NET 9 project sits between the browser
and the downstream `api/`, handling all authentication so the browser never touches a JWT.

## Port map

| App                          | URL                     |
| ---------------------------- | ----------------------- |
| Nexus API                    | `http://localhost:5100` |
| Nexus UI (login/signup page) | `http://localhost:5101` |
| Gluuti API                   | `http://localhost:5065` |
| Gluuti BFF (new)             | `http://localhost:5050` |
| Gluuti UI / Vite dev server  | `http://localhost:5173` |

## Architecture decisions made

1. **OIDC authorization code flow with PKCE** — replacing Nexus's current "token in query
   string" redirect. Short-lived single-use codes prevent token exposure in browser history/logs.

2. **No JWT between BFF and api/** — since `api/` is private and only ever called by the BFF,
   the BFF passes user identity via trusted headers (`X-User-Id`, `X-User-Email`). No JWT
   validation needed in `api/` at all.

3. **Multiple clients = multiple BFFs** — if a mobile app or desktop app is built later, each
   gets its own BFF. The `api/` stays simple and private. JWTs are only needed if third-party
   apps (apps we don't build) need direct API access.

4. **Nexus `/oauth/token` returns user info, not a JWT** — after PKCE code exchange, Nexus
   returns `{ id, name, email }`. The BFF stores this in its encrypted HttpOnly cookie session.
   No JWT issued.

## Auth flow (what we're building toward)

```
1. Browser → BFF GET /auth/login
   BFF generates: state (random), code_verifier (random), code_challenge = SHA256(code_verifier)
   BFF stores code_verifier in memory keyed by state (5 min TTL)
   BFF redirects browser to:
     http://localhost:5101?response_type=code&client_id=gluuti-bff
       &redirect_uri=http://localhost:5050/auth/callback
       &state={state}&code_challenge={challenge}&code_challenge_method=S256

2. User logs in on Nexus UI
   Nexus UI POSTs credentials + OIDC params to Nexus API /api/auth/login
   Nexus API validates credentials, creates 60-second single-use code, stores with code_challenge
   Nexus API returns { code, redirectUri }
   Nexus UI redirects browser to:
     http://localhost:5050/auth/callback?code={code}&state={state}

3. Browser → BFF GET /auth/callback?code=...&state=...
   BFF validates state matches stored value (CSRF protection)
   BFF calls Nexus POST /oauth/token (back-channel, never touches browser):
     grant_type=authorization_code, code, redirect_uri, client_id, code_verifier
   Nexus validates: SHA256(code_verifier) == stored code_challenge, code not expired/used
   Nexus returns { id, name, email }
   BFF signs in user with encrypted HttpOnly cookie
   BFF redirects browser to http://localhost:5173

4. Browser → BFF → api/ (any API call)
   Browser sends cookie automatically
   BFF reads user from cookie, forwards request to api/ with headers:
     X-User-Id: {id}
     X-User-Email: {email}
   api/ trusts these headers (only reachable from BFF)
```

## Progress — what's done

- [x] Step 1: `bff/` project created, added to `gluuti.sln`, ports set to 5050/7050
- [x] Step 2: Cookie auth middleware wired up in `bff/Program.cs`
- [x] Step 3: `GET /auth/login` redirect endpoint added; BFF config files created;
      `http://localhost:5050` added to Nexus `AllowedRedirectOrigins`
- [x] Architectural decisions finalised (PKCE, no JWT, trusted headers)

## What's left to do

### Nexus API — new files

- `Models/AuthorizationCode.cs` — code record (code, userId, redirectUri, codeChallenge, expiresAt, used)
- `Services/AuthorizationCodeStore.cs` — singleton in-memory store using IMemoryCache
- `Controllers/OAuthController.cs` — `POST /oauth/token`: validates code + PKCE, returns `{ id, name, email }`

### Nexus API — modified files

- `Controllers/AuthController.cs` — when request includes `response_type=code`, create a code
  instead of returning the token; return `{ code, redirectUri }`
- `Program.cs` — register `AuthorizationCodeStore`; add BFF origin to CORS

### Nexus UI — modified files

- `src/App.tsx` — parse OIDC params from URL (`response_type`, `client_id`, `redirect_uri`,
  `state`, `code_challenge`, `code_challenge_method`); pass to API; on success redirect with
  `?code=...&state=...` instead of `?token=...`; keep existing behaviour when no OIDC params present

### BFF — modified files

- `Program.cs`
  - Update `GET /auth/login`: generate state + PKCE, store verifier in IMemoryCache, build OIDC redirect URL
  - Replace current `GET /auth/callback`: validate state, exchange code via back-channel POST to
    Nexus `/oauth/token`, sign in user with cookie
  - Add `POST /auth/logout`
  - Add `GET /auth/me`
  - Add `/api/{**path}` proxy: forwards to `api/` with `X-User-Id` / `X-User-Email` headers

### Gluuti UI — later

- Step 7: configure Vite proxy to forward `/auth/*` and `/api/*` to BFF
- Update `AuthContext.tsx` to call BFF endpoints

## Key file locations

| File                                                            | Purpose                       |
| --------------------------------------------------------------- | ----------------------------- |
| `C:\Users\qu4ck\source\nexus\api\Controllers\AuthController.cs` | Nexus login/register          |
| `C:\Users\qu4ck\source\nexus\api\Program.cs`                    | Nexus API setup               |
| `C:\Users\qu4ck\source\nexus\ui\src\App.tsx`                    | Nexus login UI                |
| `C:\Users\qu4ck\source\gluuti\bff\Program.cs`                   | BFF (in progress)             |
| `C:\Users\qu4ck\source\gluuti\bff\appsettings.Development.json` | BFF local config              |
| `C:\Users\qu4ck\source\gluuti\api\Program.cs`                   | Gluuti API (placeholder only) |
| `C:\Users\qu4ck\source\gluuti\ui\src\context\AuthContext.tsx`   | Gluuti auth context           |
