# crashsense-demo

A minimal Express.js application demonstrating **[crashsense-express-agent](https://www.npmjs.com/package/crashsense-express-agent)** — a runtime AI debugger middleware.

When this app crashes, the error is automatically captured, analyzed by AI (Groq / Llama 3.3 70B), and displayed in real time on the [CrashSense Dashboard](https://crash-sense.vercel.app/).

---

## What This Shows

| Route | Bug | Error Type |
|---|---|---|
| `GET /crash/type-error` | Accessing `.name` on `undefined` | `TypeError` |
| `GET /crash/reference-error` | Using an undeclared variable | `ReferenceError` |
| `GET /crash/async-error` | Async DB operation rejection | `Error (async)` |

Each crash automatically triggers:
1. Stack trace parsing (V8 frame extraction)
2. Request context capture (method, URL, headers)
3. Source code snippet extraction (the lines around the crash)
4. AI analysis via Groq → structured JSON diagnosis
5. Real-time push to dashboard via Socket.io

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-username/crashsense-demo.git
cd crashsense-demo
npm install
```

### 2. Configure CrashSense

Open `app.js` and update the middleware config:

```js
app.use(
  crashsense({
    dashboardUrl: 'https://crashsense-backend.onrender.com', // your dashboard URL
    apiKey: 'your-api-key-here',                             // your CRASHSENSE_API_KEY
    projectId: 'crashsense-demo',
  })
);
```

### 3. Start the server

```bash
npm start
```

### 4. Trigger a crash

Open your browser and visit:

```
http://localhost:4000/crash/type-error
http://localhost:4000/crash/reference-error
http://localhost:4000/crash/async-error
```

### 5. Watch the dashboard

Go to **https://crash-sense.vercel.app** and watch the crash appear with a full AI-generated diagnosis in real time.

---

## How CrashSense Works

```
Express app throws a runtime error
        │
crashsense middleware intercepts it  ← registered BEFORE your error handler
        │
Parses V8 stack trace into structured frames
        │
Extracts request context (method, URL, headers, body)
        │
Reads the source code lines around the crash
        │
Sends payload to CrashSense dashboard (async, non-blocking)
        │
Calls next(err) → your error handler responds to the client
        │
Dashboard stores crash in MongoDB → triggers Groq AI analysis
        │
AI returns structured JSON: errorType, rootCause, suggestedFix, prevention
        │
Socket.io pushes analysis tokens to React in real time
```

---

## Install crashsense-express-agent in Your Own App

```bash
npm install crashsense-express-agent
```

```js
const crashsense = require('crashsense-express-agent');

app.use(crashsense({
  dashboardUrl: 'http://localhost:5000',  // your dashboard URL
  apiKey: 'your-secret-key',
  projectId: 'my-app',
}));

// ... your routes ...

// IMPORTANT: your error handler must come AFTER crashsense
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

---

## Configuration Options

| Option | Required | Default | Description |
|---|---|---|---|
| `dashboardUrl` | ✅ | — | URL of your running CrashSense dashboard server |
| `apiKey` | ✅ | — | Secret key shared with the dashboard |
| `projectId` | ✅ | — | Identifier for this application |
| `enabled` | ❌ | `true` | Set `false` to disable reporting |
| `sanitize` | ❌ | `true` | Redacts passwords and tokens from payloads |
| `maxFrames` | ❌ | `10` | Number of stack frames to extract |
| `timeout` | ❌ | `3000` | HTTP POST timeout in milliseconds |

---

## Links

- 📦 npm: [crashsense-express-agent](https://www.npmjs.com/package/crashsense-express-agent)
- 🖥️ Dashboard: [crash-sense.vercel.app](https://crash-sense.vercel.app/)
- 📁 Source: [github.com/crash-sense/Crash-Sense](https://github.com/crash-sense/Crash-Sense)
