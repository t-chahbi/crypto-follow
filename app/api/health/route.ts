import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * Used by Kubernetes for liveness/readiness probes
 */
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
}
