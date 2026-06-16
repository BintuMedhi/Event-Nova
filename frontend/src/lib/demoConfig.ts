/**
 * ─────────────────────────────────────────────────────────────
 *  EventNova  ·  Demo Payment Mode Configuration
 * ─────────────────────────────────────────────────────────────
 *
 *  When DEMO_PAYMENT_MODE is true:
 *   • Payment verification is automatically successful
 *   • No real amount comparison is performed
 *   • Tickets are generated and stored in localStorage
 *   • A "DEMO MODE" badge is shown on the checkout page
 *
 *  Set to false before going live with a real payment gateway.
 * ─────────────────────────────────────────────────────────────
 */

export const DEMO_PAYMENT_MODE = true;

/** localStorage key where completed demo bookings are stored */
export const DEMO_TICKETS_STORAGE_KEY = 'eventnova_demo_tickets';
