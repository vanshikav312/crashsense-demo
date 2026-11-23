// ============================================================
//  crashsense-demo — a simple Express app to show CrashSense
//  in action. Hit the routes below to trigger different errors
//  and watch them appear live on the dashboard.
// ============================================================

'use strict';

const express = require('express');
const crashsense = require('crashsense-express-agent');

const app = express();
app.use(express.json());

// ─── 1. Mount CrashSense Middleware ─────────────────────────
//  Replace dashboardUrl and apiKey with your running values.
app.use(
  crashsense({
    dashboardUrl: 'https://crashsense-backend.onrender.com',
    apiKey: 'b488150044a185491beb5353a403e95b9e7bd409492b16a7', // demo@crashsense.dev API key
    projectId: 'crashsense-demo',
  })
);

// ─── 2. Working Route ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 crashsense-demo is running!',
    routes: {
      'GET /crash/type-error':      'TypeError — access property of undefined',
      'GET /crash/reference-error': 'ReferenceError — undeclared variable',
      'GET /crash/async-error':     'Async error — simulated DB timeout',
    },
  });
});

// ─── 3. Crash Routes (intentional bugs) ─────────────────────

// Bug 1 — TypeError
// A developer forgot to check if `user` exists before reading `.name`
app.get('/crash/type-error', (req, res) => {
  const user = undefined;
  console.log(user.name); // 💥 TypeError: Cannot read properties of undefined
  res.json({ ok: true });
});

// Bug 2 — ReferenceError
// A developer used a variable that was never declared
app.get('/crash/reference-error', (req, res) => {
  console.log(nonExistentVariable); // 💥 ReferenceError: nonExistentVariable is not defined
  res.json({ ok: true });
});

// Bug 3 — Async / Database Timeout
// Simulates an async operation (e.g. DB query) that rejects
app.get('/crash/async-error', async (req, res, next) => {
  try {
    await Promise.reject(
      new Error('Database connection timed out after 30s — pool exhausted')
    ); // 💥 Async Error
  } catch (err) {
    next(err); // forward to Express error handler → CrashSense picks it up
  }
  res.json({ ok: true });
});

// ─── 4. Express Error Handler ────────────────────────────────
//  IMPORTANT: CrashSense must be registered BEFORE this handler.
//  It intercepts the error, reports it to the dashboard, then
//  calls next(err) so this handler can still respond to the client.
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// ─── 5. Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   🛡️  CrashSense Demo App                   ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running at http://localhost:${PORT}\n`);
  console.log('📌 Trigger crashes by visiting:');
  console.log(`   http://localhost:${PORT}/crash/type-error`);
  console.log(`   http://localhost:${PORT}/crash/reference-error`);
  console.log(`   http://localhost:${PORT}/crash/async-error`);
  console.log('\n👀 Watch crashes appear live at: https://crash-sense.vercel.app\n');
});
