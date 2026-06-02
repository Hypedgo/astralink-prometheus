'use client'

import { useState, useEffect } from 'react'

interface HealthCheckData {
    status: string
    workspace_ok: boolean
    n2yo_api_key_set: boolean
    timestamp_local: string
}

export default function SystemStatus() {
    const [health, setHealth] = useState<HealthCheckData | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkHealth() {
            try {
                const response = await fetch('https://astralink-prometheus-production.up.railway.app/api/health')
                const healthResponse = await fetch('https://astralink-prometheus-production.up.railway.app/api/healthcheck')
                const healthData = await healthResponse.json()
                setHealth(healthData)
                setLoading(false)
            } catch (error) {
                setLoading(false)
            }
        }
        checkHealth()
        const interval = setInterval(checkHealth, 30000)
        return () => clearInterval(interval)
    }, [])

    const dotColor = loading ? '#9ca3af' : health?.status === 'ok' ? '#4ade80' : '#f87171'

    return (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1100, pointerEvents: 'auto' }}>
            <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', position: 'relative' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
            </button>

            {isOpen && (
                <div style={{ position: 'absolute', right: 0, top: '28px', width: '280px', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '8px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ color: '#22d3ee', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee' }} />
                            SYSTEM STATUS
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>MCP Server</span>
                            <span style={{ fontWeight: 700, color: health?.status === 'ok' ? '#4ade80' : '#f87171' }}>
                                {loading ? 'CHECKING...' : health?.status === 'ok' ? '● ONLINE' : '● OFFLINE'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>Workspace</span>
                            <span style={{ fontWeight: 700, color: health?.workspace_ok ? '#4ade80' : '#f87171' }}>
                                {health?.workspace_ok ? '✓ OK' : '✗ ERROR'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>N2YO API Key</span>
                            <span style={{ fontWeight: 700, color: health?.n2yo_api_key_set ? '#4ade80' : '#eab308' }}>
                                {health?.n2yo_api_key_set ? '✓ SET' : '⚠ MISSING'}
                            </span>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(34,211,238,0.2)', margin: '4px 0' }} />

                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            <div style={{ color: '#22d3ee', fontWeight: 700, marginBottom: '6px' }}>ACTIVE FEATURES:</div>
                            {['Space Weather (NOAA)', 'Earth Weather (Open-Meteo)', 'ISS Pass Predictions (N2YO)', 'Location Geocoding (OSM)', 'Mission Brief Generator'].map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ color: '#4ade80' }}>✓</span>
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        {health?.timestamp_local && (
                            <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                                Last check: {new Date(health.timestamp_local).toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}