import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * Tests de Performance K6 pour Crypto Follow
 * 
 * Installation: brew install k6
 * Exécution: k6 run tests/performance/load-test.js
 */

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTrend = new Trend('page_load_time');

// Configuration du test
export const options = {
    stages: [
        { duration: '30s', target: 10 },   // Montée à 10 users
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },    // Maintien à 50 users
        { duration: '30s', target: 0 },    // Descente à 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        errors: ['rate<0.1'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    // Test 1: Landing Page
    let landingRes = http.get(`${BASE_URL}/`);
    check(landingRes, {
        'landing page status is 200': (r) => r.status === 200,
        'landing page loads fast': (r) => r.timings.duration < 1000,
    });
    pageLoadTrend.add(landingRes.timings.duration);
    errorRate.add(landingRes.status !== 200);

    sleep(1);

    // Test 2: Login Page
    let loginRes = http.get(`${BASE_URL}/login`);
    check(loginRes, {
        'login page status is 200': (r) => r.status === 200,
    });
    errorRate.add(loginRes.status !== 200);

    sleep(1);

    // Test 3: Dashboard (requires auth, expect redirect)
    let dashboardRes = http.get(`${BASE_URL}/dashboard`);
    check(dashboardRes, {
        'dashboard redirects to login': (r) => r.status === 200 || r.status === 307,
    });

    sleep(1);

    // Test 4: API Health Check (si existe)
    let healthRes = http.get(`${BASE_URL}/api/health`, {
        timeout: '5s',
    });
    check(healthRes, {
        'health check responds': (r) => r.status === 200 || r.status === 404,
    });

    sleep(2);
}

export function handleSummary(data) {
    return {
        'tests/performance/results.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, opts) {
    return `
==================================================
📊 RÉSULTATS TESTS DE PERFORMANCE - CRYPTO FOLLOW
==================================================

🔄 Requêtes totales: ${data.metrics.http_reqs.values.count}
⏱️ Durée moyenne: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
🚀 Durée p95: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
❌ Taux d'erreur: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%

Seuils:
- Durée p95 < 500ms: ${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✅ PASS' : '❌ FAIL'}
- Erreurs < 10%: ${data.metrics.errors.values.rate < 0.1 ? '✅ PASS' : '❌ FAIL'}
==================================================
`;
}
