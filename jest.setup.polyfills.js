// Polyfill web globals required by MSW v2 on Node 16.
// These run before setupFilesAfterEnv so they are available when msw/node loads.

// ── Fetch API ────────────────────────────────────────────────────────────────
const { fetch, Request, Response, Headers } = require('cross-fetch');
if (!global.fetch) global.fetch = fetch;
if (!global.Request) global.Request = Request;
if (!global.Response) global.Response = Response;
if (!global.Headers) global.Headers = Headers;

// ── EventTarget / Event ──────────────────────────────────────────────────────
if (typeof global.EventTarget === 'undefined') {
  global.EventTarget = class EventTarget {
    constructor() {
      this._listeners = new Map();
    }
    addEventListener(type, listener) {
      if (!this._listeners.has(type)) this._listeners.set(type, new Set());
      this._listeners.get(type).add(listener);
    }
    removeEventListener(type, listener) {
      this._listeners.get(type)?.delete(listener);
    }
    dispatchEvent(event) {
      this._listeners.get(event.type)?.forEach(l => {
        try {
          l.call(this, event);
        } catch {}
      });
      return !event.defaultPrevented;
    }
  };
}

if (typeof global.Event === 'undefined') {
  global.Event = class Event {
    constructor(type, init = {}) {
      this.type = type;
      this.bubbles = init.bubbles ?? false;
      this.cancelable = init.cancelable ?? false;
      this.defaultPrevented = false;
      this.timeStamp = Date.now();
      this.target = null;
      this.currentTarget = null;
    }
    preventDefault() {
      if (this.cancelable) this.defaultPrevented = true;
    }
    stopPropagation() {}
    stopImmediatePropagation() {}
  };
}

// ── MessageEvent ─────────────────────────────────────────────────────────────
if (typeof global.MessageEvent === 'undefined') {
  global.MessageEvent = class MessageEvent extends global.Event {
    constructor(type, init = {}) {
      super(type, init);
      this.data = init.data;
      this.origin = init.origin ?? '';
      this.lastEventId = init.lastEventId ?? '';
      this.source = init.source ?? null;
      this.ports = init.ports ?? [];
    }
  };
}

// ── BroadcastChannel ─────────────────────────────────────────────────────────
if (typeof global.BroadcastChannel === 'undefined') {
  const channels = new Map();
  global.BroadcastChannel = class BroadcastChannel extends global.EventTarget {
    constructor(name) {
      super();
      this.name = name;
      if (!channels.has(name)) channels.set(name, new Set());
      channels.get(name).add(this);
    }
    postMessage(message) {
      const peers = channels.get(this.name);
      if (!peers) return;
      const event = new global.MessageEvent('message', {
        data: message,
        origin: '',
      });
      peers.forEach(ch => {
        if (ch !== this) ch.dispatchEvent(event);
      });
    }
    close() {
      const peers = channels.get(this.name);
      if (!peers) return;
      peers.delete(this);
      if (peers.size === 0) channels.delete(this.name);
    }
  };
}
