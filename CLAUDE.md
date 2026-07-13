# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at localhost:3000
npm run build      # production build (CI=false suppresses warnings-as-errors)
npm test           # Jest test runner in watch mode
```

## Architecture

**"Razgovori"** is a React 19 (Create React App) social media app. All backend is Firebase; images are hosted on Cloudinary.

### Layout hierarchy

```
App
└── NavigationLayout      # side nav (left) + UsersList (right on desktop, inside drawer on mobile)
    ├── RoomsLayout       # room tab bar (Watch/Read/Listen) → Homepage
    ├── AuthRequired      # gate for /my-chats
    └── UserProfile
```

`NavigationLayout` passes `toggleNav` down via `useOutletContext` so child pages can open the mobile hamburger drawer.

### Firebase usage

All Firebase imports go through `src/api/firebase.js` — it initialises the app and re-exports every SDK function used across the codebase. Never import directly from the Firebase packages elsewhere.

Two Firebase services are in use:
- **Firestore** — all persistent data (posts, comments, profiles, chats, messages)
- **Realtime Database** — typing-indicator presence only (`typingStatus/{chatId}/{uid}`)

### Firestore data model

| Collection / path | Purpose |
|---|---|
| `/watching`, `/reading`, `/listening` | Posts per room |
| `/{room}/{postId}/comments` | Post comments (subcollection) |
| `/profiles/{uid}` | User profiles; `followers[]`, `following[]`, `isActive` |
| `/chats/{chatId}` | 1-on-1 chats; `participants[]`, `lastMessage` snapshot |
| `/chats/{chatId}/messages` | Chat messages (subcollection) |

Posts store `likes` as a map `{ [uid]: { displayName, photoURL, uid } }` — not an array — so toggling like uses `deleteField()` instead of `arrayRemove`.

### Data-fetching hooks

- **`useFirestoreBatch`** — live first page via `onSnapshot`, older pages via manual `getDocs` cursor pagination (`startAfter`). Descending by `timestamp`. Used for posts and chat list.
- **`useChatMessages`** — same pattern but ascending order, paginating *backwards* with `endBefore`/`limitToLast`. Used inside `ChatBox`.

Both expose `{ data, loading, error, fetchMore, hasMore, refetch }`. `refetch` bumps a `retryFlag` counter to re-run the `useEffect`.

### Image uploads

`src/api/uploadToCloudinaryAndGetUrl.js` uploads to Cloudinary before any Firestore write. Both post creation (`sendPostToFirestore.js`) and message sending (`sendMessageToFirestore.js.js`) call it first, then store the returned URL. Note the double-extension filename `sendMessageToFirestore.js.js` — this is intentional (don't rename without updating all imports).

### Auth

`src/contexts/authContext.js` exposes `useAuth()` → `{ user, logOut, authLoading, authError }`. On logout it sets `isActive: false` in the user's Firestore profile before calling `signOut`.

### Responsive layout

Uses `react-responsive` with a single breakpoint: `maxWidth: 767` = mobile, `minWidth: 768` = desktop. On mobile, `UsersList` is inside the nav drawer; on desktop it renders as a fixed right column. The `RoomsLayout` and `MyChats` headers hide on scroll-down and reappear on scroll-up.

### Post component pattern

Posts and comments share a set of `FirestoreItem*` sub-components (`FirestoreItemHeader`, `FirestoreItemContent`, `FirestoreItemActions`). `FirestoreItemActions` receives both a doc ref (for likes) and a collection ref (for comment count) and subscribes to both with `onSnapshot`.

### Follow system

`src/api/followToggle.js` uses a Firestore `runTransaction` to atomically update both users' `followers`/`following` arrays, preventing race conditions.
