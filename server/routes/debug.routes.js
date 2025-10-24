import express from 'express';

const router = express.Router();

// GET /api/debug/cookies
// Returns cookies and relevant headers so clients can verify what the server receives.
router.get('/cookies', (req, res) => {
  try {
    const receivedCookies = req.cookies || {};
    const origin = req.headers.origin || req.headers.referer || null;
    const authHeader = req.headers.authorization || null;
    return res.status(200).json({ ok: true, receivedCookies, origin, authHeader, headers: { host: req.headers.host } });
  } catch (err) {
    console.error('debug/cookies error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
