/**
 * mockImportedEvents.ts
 * ─────────────────────
 * Re-exports from csvEventService so that all existing imports continue to
 * work without any changes. The CSV event service is now the single source
 * of truth — this file is kept purely for backwards compatibility.
 */

export type { EventRecord as MockEvent } from './csvEventService';
export { CSV_EVENTS as MOCK_EVENTS } from './csvEventService';
export { DEFAULT_BANNER } from './csvEventService';
