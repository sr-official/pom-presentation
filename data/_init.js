// Central data namespace. All editable project data lives in data/*.js
// (plain JS objects, not fetch()-loaded JSON) so the presentation opens
// reliably via file:// with zero network requests — fetch()/XHR against
// local JSON files is blocked by browser security in Chrome-based browsers.
window.APPDATA = {};
