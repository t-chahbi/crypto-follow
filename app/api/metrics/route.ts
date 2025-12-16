import { NextResponse } from 'next/server'

/**
 * Prometheus Metrics Endpoint
 * Exposes application metrics for monitoring
 */
export async function GET() {
    // Basic metrics in Prometheus format
    const metrics = `
# HELP crypto_follow_info Application info
# TYPE crypto_follow_info gauge
crypto_follow_info{version="1.0.0",environment="production"} 1

# HELP crypto_follow_http_requests_total Total HTTP requests
# TYPE crypto_follow_http_requests_total counter
crypto_follow_http_requests_total{method="GET",status="200"} 0

# HELP crypto_follow_active_users Current active users
# TYPE crypto_follow_active_users gauge
crypto_follow_active_users 0

# HELP crypto_follow_alerts_triggered_total Total alerts triggered
# TYPE crypto_follow_alerts_triggered_total counter
crypto_follow_alerts_triggered_total 0

# HELP nodejs_heap_size_used_bytes Process heap size used
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${process.memoryUsage().heapUsed}

# HELP nodejs_heap_size_total_bytes Process heap size total
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${process.memoryUsage().heapTotal}
`.trim()

    return new NextResponse(metrics, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    })
}
