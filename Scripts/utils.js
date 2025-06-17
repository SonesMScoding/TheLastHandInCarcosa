/* ==========================================
   utils.js
    Utility functions for deep cloning objects

    https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
    https://www.geeksforgeeks.org/javascript/how-to-deep-clone-in-javascript/

    literally just for one item (repaired reputation)
   ========================================== */

export function cloneDeep(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}