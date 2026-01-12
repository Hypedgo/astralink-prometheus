'use client'

import { useState, useEffect } from 'react'
import { useSpaceWeather } from './useSpaceWeather'
import { useWeather } from './useWeather'
import { useISSPasses } from './useISSPasses'
import { useBriefGenerator } from './useBriefGenerator'

interface MissionBriefProps {
    location: {
        name: string
        latitude: number
        longitude: number
        displayName: string
    }
}

export default function MissionBrief({ location }: MissionBriefProps) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const spaceWeather = useSpaceWeather()
    const weather = useWeather(location.latitude, location.longitude)
    const issPasses = useISSPasses(location.latitude, location.longitude)
    const { generateBrief, isGenerating } = useBriefGenerator()

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            {/* Top Bar - Mission Header */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                padding: '1.5rem'
            }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#22d3ee',
                                letterSpacing: '0.05em',
                                margin: 0
                            }}>
                                ASTRALINK PROMETHEUS
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem', margin: 0 }}>
                                Space Operations Mission Control
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: '#4ade80' }} suppressHydrationWarning>
                                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }} suppressHydrationWarning>
                                {currentTime.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Panel - Space Weather */}
            <div style={{
                position: 'absolute',
                left: '1.5rem',
                top: '8rem',
                pointerEvents: 'auto'
            }}>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    width: '18rem'
                }}>
                    <h2 style={{
                        color: '#22d3ee',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 0 0.75rem 0'
                    }}>
                        <span style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            background: '#22d3ee',
                            borderRadius: '50%',
                            marginRight: '0.5rem',
                            display: 'inline-block',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></span>
                        SPACE WEATHER
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Kp Index</span>
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '1.125rem',
                                fontWeight: 'bold',
                                color: spaceWeather.loading ? '#9ca3af' :
                                    spaceWeather.risk === 'HIGH' ? '#f87171' :
                                        spaceWeather.risk === 'MODERATE' ? '#facc15' : '#4ade80'
                            }}>
                                {spaceWeather.loading ? '...' : spaceWeather.kpIndex.toFixed(1)}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Risk Level</span>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: spaceWeather.risk === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' :
                                    spaceWeather.risk === 'MODERATE' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                color: spaceWeather.risk === 'HIGH' ? '#f87171' :
                                    spaceWeather.risk === 'MODERATE' ? '#facc15' : '#4ade80'
                            }}>
                                {spaceWeather.risk}
                            </span>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(6, 182, 212, 0.2)', margin: '0.5rem 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Solar Activity</span>
                            <span style={{ color: '#facc15', fontSize: '0.875rem' }}>NOMINAL</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Geomagnetic</span>
                            <span style={{ color: '#4ade80', fontSize: '0.875rem' }}>STABLE</span>
                        </div>
                    </div>
                </div>

                {/* Earth Weather Panel */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    width: '18rem',
                    marginTop: '1rem'
                }}>
                    <h2 style={{
                        color: '#22d3ee',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 0 0.75rem 0'
                    }}>
                        <span style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            background: '#22d3ee',
                            borderRadius: '50%',
                            marginRight: '0.5rem',
                            display: 'inline-block',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></span>
                        OBSERVATION CONDITIONS
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Location</span>
                            <span style={{ color: 'white', fontSize: '0.875rem' }}>{location.name}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Cloud Cover</span>
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '1.125rem',
                                fontWeight: 'bold',
                                color: weather.loading ? '#9ca3af' :
                                    weather.cloudCover < 30 ? '#4ade80' :
                                        weather.cloudCover < 60 ? '#facc15' : '#f87171'
                            }}>
                                {weather.loading ? '...' : `${weather.cloudCover}%`}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Visibility</span>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: weather.loading ? 'rgba(107, 114, 128, 0.2)' :
                                    weather.visibility === 'EXCELLENT' ? 'rgba(34, 197, 94, 0.2)' :
                                        weather.visibility === 'GOOD' ? 'rgba(234, 179, 8, 0.2)' :
                                            weather.visibility === 'POOR' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                color: weather.loading ? '#9ca3af' :
                                    weather.visibility === 'EXCELLENT' ? '#4ade80' :
                                        weather.visibility === 'GOOD' ? '#facc15' :
                                            weather.visibility === 'POOR' ? '#f87171' : '#9ca3af'
                            }}>
                                {weather.loading ? '...' : weather.visibility}
                            </span>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(6, 182, 212, 0.2)', margin: '0.5rem 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Sky Conditions</span>
                            <span style={{
                                color: weather.loading ? '#9ca3af' : weather.cloudCover < 30 ? '#4ade80' : '#facc15'
                            }}>
                                {weather.loading ? '...' : (weather.cloudCover < 30 ? '✓ CLEAR' : '☁️ CLOUDY')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - ISS Tracking */}
            <div style={{
                position: 'absolute',
                right: '1.5rem',
                top: '8rem',
                pointerEvents: 'auto'
            }}>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    width: '20rem'
                }}>
                    <h2 style={{
                        color: '#22d3ee',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 0 0.75rem 0'
                    }}>
                        <span style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            background: '#facc15',
                            borderRadius: '50%',
                            marginRight: '0.5rem',
                            display: 'inline-block',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></span>
                        ISS TRACKING
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Status</span>
                            <span style={{ color: '#4ade80', fontSize: '0.875rem', fontWeight: 'bold' }}>● ACTIVE</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Altitude</span>
                            <span style={{ color: 'white', fontFamily: 'monospace' }}>408 km</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Velocity</span>
                            <span style={{ color: 'white', fontFamily: 'monospace' }}>7.66 km/s</span>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(6, 182, 212, 0.2)', margin: '0.75rem 0' }}></div>

                        <h3 style={{
                            color: '#facc15',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            margin: '0 0 0.5rem 0'
                        }}>NEXT VISIBLE PASSES</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                            {issPasses.loading ? (
                                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>Loading passes...</div>
                            ) : issPasses.passes.length === 0 ? (
                                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No visible passes in next 3 days</div>
                            ) : (
                                issPasses.passes.slice(0, 3).map((pass, index) => {
                                    const [date, time, period] = pass.start_local.split(' ')
                                    const duration = Math.floor(pass.duration_seconds / 60)

                                    return (
                                        <div key={index} style={{
                                            background: index === 0 ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
                                            borderRadius: '0.25rem',
                                            padding: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ color: '#9ca3af' }}>{date}</span>
                                                <span style={{ color: 'white', fontFamily: 'monospace' }}>{time} {period}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                                <span style={{ color: '#6b7280' }}>Duration: {duration} min | {Math.round(pass.max_elevation_deg)}°</span>
                                                <span style={{
                                                    color: pass.visibility === 'OPTIMAL' || pass.visibility === 'EXCELLENT' ? '#4ade80' :
                                                        pass.visibility === 'GOOD' ? '#facc15' : '#9ca3af'
                                                }}>
                                                    {pass.visibility} {(pass.visibility === 'OPTIMAL' || pass.visibility === 'EXCELLENT') ? '⭐' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Generate Brief Button */}
            <div style={{
                position: 'absolute',
                bottom: '5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                pointerEvents: 'auto'
            }}>
                <button
                    onClick={() => generateBrief(location.latitude, location.longitude, location.name)}
                    disabled={isGenerating}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(34, 211, 238, 0.2)',
                        border: '2px solid #22d3ee',
                        borderRadius: '0.5rem',
                        color: '#22d3ee',
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        opacity: isGenerating ? 0.5 : 1,
                        transition: 'all 0.3s',
                        boxShadow: '0 10px 25px rgba(34, 211, 238, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        if (!isGenerating) {
                            e.currentTarget.style.background = 'rgba(34, 211, 238, 0.3)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(34, 211, 238, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isGenerating) {
                            e.currentTarget.style.background = 'rgba(34, 211, 238, 0.2)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(34, 211, 238, 0.2)';
                        }
                    }}
                >
                    {isGenerating ? '⏳ Generating Brief...' : '📄 Generate Mission Brief'}
                </button>
            </div>

            {/* Bottom Bar - Mission Status */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                padding: '1rem'
            }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{
                                    width: '0.5rem',
                                    height: '0.5rem',
                                    background: '#4ade80',
                                    borderRadius: '50%',
                                    marginRight: '0.5rem',
                                    display: 'inline-block',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}></span>
                                <span style={{ color: '#9ca3af' }}>SYSTEMS:</span>
                                <span style={{ color: '#4ade80', marginLeft: '0.5rem', fontWeight: 'bold' }}>NOMINAL</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>DATA LINK:</span>
                                <span style={{ color: '#4ade80', marginLeft: '0.5rem', fontWeight: 'bold' }}>ACTIVE</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>TRACKING:</span>
                                <span style={{ color: '#facc15', marginLeft: '0.5rem', fontWeight: 'bold' }}>LIVE</span>
                            </div>
                        </div>

                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                            ASTRALINK PROMETHEUS v1.0 | Mission Control Interface
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}