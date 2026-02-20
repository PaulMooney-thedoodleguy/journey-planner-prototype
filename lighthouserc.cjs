/**
 * Lighthouse CI configuration (DO-5)
 *
 * Serves the production dist/ folder and audits the homepage.
 * Accessibility score below 0.9 is a hard CI failure.
 * Performance, best-practices, and SEO thresholds are warnings only.
 *
 * Run locally:  npx @lhci/cli autorun
 * Run in CI:    via .github/workflows/ci.yml lighthouse job
 */

/** @type {import('@lhci/cli').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      // Serves ./dist with LHCI's built-in static server
      staticDistDir: './dist',
      url: ['http://localhost/'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // Hard failure — accessibility regression blocks the PR
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Warnings — tracked but do not block
        'categories:performance':    ['warn',  { minScore: 0.7 }],
        'categories:best-practices': ['warn',  { minScore: 0.8 }],
        'categories:seo':            ['warn',  { minScore: 0.7 }],
      },
    },
    upload: {
      // Stores reports on LHCI's free temporary public storage (no account needed)
      // Replace with 'lhci' target and a private server for persistent history
      target: 'temporary-public-storage',
    },
  },
};
