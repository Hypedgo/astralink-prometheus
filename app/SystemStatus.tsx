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
                const response = await fetch('http://localhost:8000/api/health')
                const data = await response.json()

                // Also fetch the healthcheck endpoint
                const healthResponse = await fetch('http://localhost:8000/api/healthcheck')
                const healthData = await healthResponse.json()

                setHealth(healthData)
                setLoading(false)
            } catch (error) {
                console.error('Health check failed:', error)
                setLoading(false)
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="absolute top-6 right-6 z-30 pointer-events-auto">
            {/* Status Indicator Dot */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative group"
            >
                <div className={`w-4 h-4 rounded-full ${loading ? 'bg-gray-400' :
                        health?.status === 'ok' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    } shadow-lg`}></div>

                {/* Tooltip */}
                <div className="absolute right-0 top-6 bg-black/90 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    MCP Server Status
                </div>
            </button>

            {/* Expanded Status Panel */}
            {isOpen && (
                <div className="absolute right-0 top-8 w-80 bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-cyan-400 font-bold text-sm flex items-center">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                            SYSTEM STATUS
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-3 text-sm">
                        {/* MCP Server Status */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">MCP Server</span>
                            <span className={`font-bold ${health?.status === 'ok' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {loading ? 'CHECKING...' : health?.status === 'ok' ? '● ONLINE' : '● OFFLINE'}
                            </span>
                        </div>

                        {/* Workspace */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Workspace</span>
                            <span className={`font-bold ${health?.workspace_ok ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {health?.workspace_ok ? '✓ OK' : '✗ ERROR'}
                            </span>
                        </div>

                        {/* N2YO API Key */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">N2YO API Key</span>
                            <span className={`font-bold ${health?.n2yo_api_key_set ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                {health?.n2yo_api_key_set ? '✓ SET' : '⚠ MISSING'}
                            </span>
                        </div>

                        <div className="h-px bg-cyan-500/20 my-2"></div>

                        {/* Active Features */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="font-bold text-cyan-400 mb-1">ACTIVE FEATURES:</div>
                            <div className="flex items-center">
                                <span className="text-green-400 mr-2">✓</span>
                                <span>Space Weather (NOAA)</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-400 mr-2">✓</span>
                                <span>Earth Weather (Open-Meteo)</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-400 mr-2">✓</span>
                                <span>ISS Pass Predictions (N2YO)</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-400 mr-2">✓</span>
                                <span>Location Geocoding (OSM)</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-400 mr-2">✓</span>
                                <span>Mission Brief Generator</span>
                            </div>
                        </div>

                        {health?.timestamp_local && (
                            <div className="text-xs text-gray-500 mt-3 text-center">
                                Last check: {new Date(health.timestamp_local).toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}