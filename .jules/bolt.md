# Bolt's Journal - Critical Learnings

## 2025-05-22 - Zustand Store Re-render Bottleneck
**Learning:** In this codebase, the `useDataverse` hook returns the entire Zustand store object and triggers `initialize()` if not already initialized. This pattern causes two major performance issues:
1. Every component using `useDataverse` re-renders on any store update, regardless of whether it uses the changed data.
2. The `initialize()` function triggers ~12 separate `set()` calls as each entity is fetched, leading to a cascade of re-renders across the app during startup.

**Action:** Consolidate initial data fetching into a single `set()` call and update the `useDataverse` hook to support selectors.
