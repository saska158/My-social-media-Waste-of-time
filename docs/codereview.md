# Code Review — Razgovori (My Social Media Waste of Time)

**Date:** 2026-07-13  
**Scope:** Full repository review  
**Stack:** React 19 (CRA), Firebase (Firestore + Realtime Database), Cloudinary

---

## Summary

Overall the codebase is well-structured with good use of custom hooks, proper cleanup in effects, error boundaries, skeleton loading states, and responsive design. The main problems are a critical regex bug that breaks link detection, an exposed third-party API key, redundant Firestore reads on every render (no profile caching), and significant code duplication across the three form components.

Severity legend: **CRITICAL** → **HIGH** → **MEDIUM** → **LOW**

---

## 1. Security

### CRITICAL — Third-party API key exposed in client bundle
**File:** `src/api/fetchLinkPreview.js:2`

The LinkPreview API key is hardcoded as a plain string, bundled into the client JS, and visible to anyone who opens DevTools. This can be abused by others to exhaust your quota and trigger billing.

**Action:** Move to an environment variable (`REACT_APP_LINK_PREVIEW_KEY`) or, better, proxy the request through a Firebase Cloud Function so the key never reaches the browser.

---

### MEDIUM — Firebase config in service worker is committed as plain text
**File:** `public/firebase-messaging-sw.js:5-12`

Firebase web API keys are semi-public (they identify the project, not grant admin access), but having them as hardcoded strings blocks you from swapping environments or rotating keys cleanly.

**Action:** Acceptable to leave as-is for now, but consider templating with `REACT_APP_*` variables via a build step if you ever need multi-environment support.

---

## 2. Bugs

### CRITICAL — Global regex in `linkify` skips every second URL
**File:** `src/utils/linkify.js:1-15`

The URL regex is defined with the `/g` (global) flag. When `.test()` or `.exec()` is called on a regex with `/g`, JavaScript advances `lastIndex` after each match. The next call on the same regex object then starts from that offset — meaning in a string with two URLs, only the first is detected, the second is skipped, then the third is found, etc.

```js
// current — broken for multiple URLs
const urlRegex = /(\bhttps?:\/\/[^\s]+)/g
```

**Action:** Either remove the `/g` flag (since `split` doesn't need it), or reconstruct the regex inside the function body each call so `lastIndex` resets:

```js
const linkify = (text) => {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/  // no /g
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? <a key={i} href={part}>{part}</a> : part
  )
}
```

---

### HIGH — Async writes in `forEach` without `Promise.all` (race condition)
**File:** `src/components/one_on_one_chat/ChatBox.js:62-68`

`messages.forEach(async (msg) => { await updateDoc(...) })` does not actually await the inner promises — `forEach` ignores the return value of the callback. Messages may be marked seen in an indeterminate order or not at all before the function returns.

**Action:** Replace with `await Promise.all(messages.map(msg => updateDoc(...)))`.

---

### HIGH — `currentUser` initialised as `false` instead of `null`
**File:** `src/components/users_list/UserCard.js:13`

`const [currentUser, setCurrentUser] = useState(false)` — then `currentUser.uid` is accessed on line 39, which throws `Cannot read properties of false` on the first render before data loads.

**Action:** Change to `useState(null)` and guard the comparison: `currentUser?.uid !== userItem.uid`.

---

### MEDIUM — Typo in variable name
**File:** `src/hooks/useFormattedTime.js:12,23`

`updatedFormattedtTime` (double `t`) — harmless but indicates a copy-paste artifact. **Action:** Rename to `updatedFormattedTime`.

---

### MEDIUM — Messages don't render until profile fetch completes
**File:** `src/components/one_on_one_chat/Message.js:56`

The component returns `null` while `userProfile` is loading, so the message list appears empty until every profile resolves. There is no loading placeholder shown.

**Action:** Return a skeleton or the message content without the avatar while the profile loads, rather than rendering nothing.

---

### MEDIUM — `PopUp` missing dependency in `useEffect`
**File:** `src/components/PopUp.js`

If `PopUp` closes the emoji picker via a side-effect, `setShowEmojiPicker` should be in the dependency array to avoid stale-closure bugs.

**Action:** Check the effect dependency array and add any missing setters.

---

## 3. Performance

### HIGH — Profile fetched once per message (no caching)
**Files:** `src/components/one_on_one_chat/Message.js:21-52`, `src/components/post/FirestoreItemHeader.js:13-23`

Each rendered message and each post header independently subscribes to (or fetches) the author's profile from Firestore. In a chat with 30 messages all from the same user, that's 30 identical reads. Same pattern appears for post headers.

**Action:** Lift profile fetching to a context-level cache (e.g. a `Map` keyed by UID in a `ProfilesContext`), or pass the profile down from the parent that already has it.

---

### HIGH — User search fires a new `onSnapshot` on every keystroke
**File:** `src/components/users_list/UsersSearch.js:45-98`

Each character typed tears down the previous listener and opens a new one. At 5 characters typed rapidly this is 5 open listeners and 5 reads.

**Action:** Debounce `searchQuery` by 300–400 ms before it is used to build the Firestore query:

```js
const [inputValue, setInputValue] = useState('')
const [searchQuery, setSearchQuery] = useState('')

useEffect(() => {
  const id = setTimeout(() => setSearchQuery(inputValue), 350)
  return () => clearTimeout(id)
}, [inputValue])
```

---

### HIGH — Link preview API called on every render / duplicate calls
**Files:** `src/components/post/PostForm.js:100-115`, `src/components/post/CommentsForm.js:101-117`, `src/components/one_on_one_chat/ChatBoxForm.js:123-149`

Link previews are fetched while the user is typing, with no debounce and no cache. Users typing a URL quickly will exhaust the rate limit immediately.

**Action:** Debounce the URL extraction effect by at least 500 ms and cache results for the session (a simple `useRef` map of `url → data` is sufficient).

---

### MEDIUM — Unsubscribed `onSnapshot` in `FirestoreItemActions` for comment count
**File:** `src/components/post/FirestoreItemActions.js:90-103`

A collection-level `onSnapshot` is subscribed for each post on the feed to track comment count. With 20 posts visible this is 20 open listeners. Since comments don't change that often, this is wasteful.

**Action:** Consider fetching comment count once with `getCountFromServer` (Firestore aggregation query) rather than subscribing to the full collection.

---

### MEDIUM — Scroll listener without debounce in ChatBox
**File:** `src/components/one_on_one_chat/ChatBox.js:96-133`

Scroll events fire very rapidly. DOM measurements on every event can cause layout thrashing on low-end devices.

**Action:** Wrap the handler in `requestAnimationFrame` or throttle it.

---

### LOW — Unused ref allocated on every render
**File:** `src/components/post/Comments.js:13`

`commentsContainerRef` is created with `useRef` but never attached to any element or read. **Action:** Remove it.

---

## 4. Code Quality & Maintainability

### HIGH — `PostForm`, `CommentsForm`, and `ChatBoxForm` are near-identical
**Files:** `src/components/post/PostForm.js`, `src/components/post/CommentsForm.js`, `src/components/one_on_one_chat/ChatBoxForm.js`

All three share the same ~100-line shape: emoji picker toggle, image upload, link preview fetch, submit logic. Any bug fixed in one needs to be fixed in all three.

**Action:** Extract a `useFormWithMedia` hook that returns `{ text, setText, image, setImage, linkPreview, handleEmojiClick, handleImageChange, reset }` and use it in all three forms.

---

### HIGH — No input validation in `ProfileEditor`
**File:** `src/components/user_profile/ProfileEditor.js:119-201`

Display name can be saved as an empty string. No `maxLength` enforcement before the Firestore write.

**Action:** Validate before calling `updateDoc`:
- Display name: required, ≥ 1 char, ≤ 30 chars
- Bio: optional, ≤ 150 chars

---

### MEDIUM — Error message mapping duplicated in 5+ places
**Files:** `src/pages/Sign-In.js:26-39`, `src/pages/Sign-Up.js:74-82`, `src/contexts/authContext.js:26-40`, `src/components/users_list/UsersSearch.js:77-94`, `src/hooks/useFirestoreBatch.js:46-54`

The same `if (error.code === "permission-denied") ...` chains are copy-pasted everywhere.

**Action:** Create `src/utils/mapFirebaseError.js`:
```js
export const mapFirebaseError = (error) => {
  const map = {
    'permission-denied': 'You don\'t have permission to access this data.',
    'unavailable': 'Network error. Please check your connection.',
    'network-request-failed': 'Network error. Please check your connection.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/too-many-requests': 'Too many requests. Please try again later.',
    // etc.
  }
  return map[error.code] || 'Something went wrong. Please try again later.'
}
```

---

### MEDIUM — Magic numbers scattered across components

| File | Line | Value | Meaning |
|---|---|---|---|
| `ChatPreview.js` | 38 | `18` | Max chars in message preview |
| `Replies.js` | 25 | `150px` | Collapsed replies height |
| `PostSkeleton.js` | 3, 8 | `400px`, `250px` | Skeleton dimensions |
| `UsersSearch.js` | 53, 113 | `15` | Page size for search results |

**Action:** Extract to named constants at the top of each file or into a shared `src/constants.js`.

---

### MEDIUM — `FollowButton` spreads potentially-undefined `style` prop
**File:** `src/components/FollowButton.js:56`

`{...style, background: ...}` — if `style` is not passed, this spreads `undefined`, which is fine in JS but the intent isn't clear.

**Action:** Default the prop: `const FollowButton = ({ style = {}, ... })`.

---

### LOW — `console.log` left in production code
**Files:** `src/components/ImagePreview.js:7` (`"image cancelled"`), `src/layouts/NavigationLayout.js:12` (`user?.uid`), `src/components/one_on_one_chat/ChatBox.js` (several)

**Action:** Remove all `console.log` calls. Keep `console.error` in catch blocks.

---

### LOW — Double file extension on API file
**File:** `src/api/sendMessageToFirestore.js.js`

**Action:** Rename to `sendMessageToFirestore.js` and update the import in `ChatBoxForm.js`. This is a trivial change but makes the filesystem less confusing.

---

### LOW — Grammar in empty-state messages
**Files:** `src/components/users_list/UsersSearch.js:184` (`"There's no users"`)

**Action:** Change to `"No users found."`.

---

## 5. Architecture

### MEDIUM — No retry mechanism in `ChatBox` error state
**File:** `src/components/one_on_one_chat/ChatBox.js:225`

When `useChatMessages` returns an error, it is displayed but there is no retry button — unlike the pattern used correctly in `Homepage.js` and `MyChats.js` which pass `onRetry={refetch}` to `ErrorMessage`.

**Action:** Add `onRetry={refetch}` to the `ErrorMessage` in `ChatBox`.

---

### MEDIUM — Profile fetch in `UserProfileHeader` mixes data and presentation
**File:** `src/components/user_profile/UserProfileHeader.js:30-40`

The header component fetches the current user's profile itself, creating a component that cannot be rendered without a live Firestore connection.

**Action:** Lift the fetch to `UserProfile.js` (which already fetches the target profile) and pass it as a prop. This makes `UserProfileHeader` a pure presentational component.

---

### MEDIUM — `markMessagesAsSeen` effect may cause unnecessary re-triggers
**File:** `src/components/one_on_one_chat/ChatBox.js:47-76`

`messages` is in the dependency array of the effect that calls `updateDoc` on messages. After `updateDoc` runs, Firestore's `onSnapshot` may fire an update, updating `messages`, which re-runs the effect.

**Action:** Track a Set of already-processed message IDs in a `useRef` to skip messages you've already marked, making the effect idempotent and safe to run multiple times.

---

### LOW — Root-level `Message.js` is a duplicate
**File:** `Message.js` (project root)

There is a `Message.js` at the project root which appears to be an earlier draft of `src/components/one_on_one_chat/Message.js`. It is not imported anywhere.

**Action:** Delete it.

---

## 6. Missing Features / Edge Cases

| Issue | File | Action |
|---|---|---|
| No optimistic UI on follow/unfollow — UI lags while waiting for Firestore | `FollowButton.js:35-50` | Update local state immediately, revert on error |
| Search `orderBy`+`startAt`/`endAt` approach for prefix search doesn't handle uppercase input | `UsersSearch.js:48-54` | Lowercase the input before querying, or store a normalised `displayNameLower` field |
| Profile edit form has no "are you sure?" guard before overwriting | `ProfileEditor.js` | Add a confirm step or enable optimistic editing with cancel |
| Message "sending" and "failed" states not shown — only "seen" | `Message.js:101-104` | Show a spinner or ✗ based on write status |
| No validation that image files are below a size limit before upload | `ImageUploadButton.js`, `ProfileEditor.js` | Reject files > 5 MB client-side before hitting Cloudinary |

---

## 7. What's Working Well

- Custom hooks (`useFirestoreBatch`, `useChatMessages`, `useTypingIndicator`, `useFormattedTime`) cleanly separate data logic from UI.
- All `onSnapshot` subscriptions return their unsubscribe function — no listener leaks.
- `ErrorBoundary` wraps the entire app and all fatal data errors use `ErrorMessage` with retry.
- `followToggle` uses a Firestore `runTransaction` — correct approach for the race condition.
- Skeleton screens for posts, users, chat items and profile.
- Infinite scroll on all lists with the `pageSize + 1` trick to detect `hasMore` accurately.
- Responsive layout with a single breakpoint handled consistently via `react-responsive`.

---

## Action Priority

| Priority | Action |
|---|---|
| P0 | Fix linkify regex bug (`src/utils/linkify.js`) |
| P0 | Move LinkPreview API key to env var |
| P1 | Fix async `forEach` in `ChatBox` — use `Promise.all` |
| P1 | Fix `UserCard` state initialised as `false` |
| P1 | Add debounce to user search |
| P1 | Add profile cache to stop per-message Firestore reads |
| P2 | Extract shared form logic from `PostForm`/`CommentsForm`/`ChatBoxForm` |
| P2 | Centralise Firebase error message mapping |
| P2 | Add input validation to `ProfileEditor` |
| P2 | Add retry button to `ChatBox` error state |
| P3 | Remove `console.log` calls |
| P3 | Rename `sendMessageToFirestore.js.js` |
| P3 | Delete root-level `Message.js` |
| P3 | Fix variable name typo in `useFormattedTime` |
| P3 | Replace magic numbers with named constants |
