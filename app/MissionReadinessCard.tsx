'use client';

import { useEffect, useState } from 'react';

interface ReadinessData {
    mission_readiness_score: number;
    tier: 'GREEN' | 'YELLOW' | 'RED';
    recommendation: string;
    factors: {
        space_weather: { kp_index: number; risk: string };
        sky_conditions: { cloud_cover_percent: number; risk: string };
        pass_geometry: { max_elevation_deg: number; risk: string };
    };
    next_pass_time: string;
}

interface MissionReadinessCardProps {
    latitude: number;
    longitude: number;
}

export default function MissionReadinessCard({ latitude, longitude }: MissionReadinessCardProps) {
    const [data, setData] = useState<ReadinessData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReadiness();
        const interval = setInterval(fetchReadiness, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [latitude, longitude]); // Re-fetch when location changes!

    const fetchReadiness = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/mission-readiness?lat=${latitude}&lon=${longitude}`
            );
            const result = await response.json();
            setData(result);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch readiness:', error);
            setLoading(false);
        }
    };

    if (loading || !data) return null;

    const getTierColor = () => {
        switch (data.tier) {
            case 'GREEN': return '#22c55e';
            case 'YELLOW': return '#eab308';
            case 'RED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '620px',
            left: '25px',
            zIndex: 100,
            width: '285px',
            background: 'rgba(0, 20, 40, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 200, 255, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Header */}
            <div style={{
                color: '#00d9ff',
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '0.5px'
            }}>
                <span style={{
                    width: '6px',
                    height: '6px',
                    background: '#00d9ff',
                    borderRadius: '50%',
                    marginRight: '8px',
                    boxShadow: '0 0 8px #00d9ff'
                }}></span>
                MISSION READINESS
            </div>

            {/* Score */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
                <div style={{
                    fontSize: '13px',
                    color: '#94a3b8'
                }}>
                    Score
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        color: 'white'
                    }}>
                        {data.mission_readiness_score}
                    </div>
                    <div style={{
                        padding: '4px 8px',
                        background: getTierColor(),
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: 'white'
                    }}>
                        {data.tier}
                    </div>
                </div>
            </div>

            {/* Factors */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Kp Index</span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: data.factors.space_weather.risk === 'LOW' ? '#22c55e' :
                            data.factors.space_weather.risk === 'MODERATE' ? '#eab308' : '#ef4444'
                    }}>
                        {data.factors.space_weather.kp_index}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Cloud Cover</span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: data.factors.sky_conditions.risk === 'LOW' ? '#22c55e' :
                            data.factors.sky_conditions.risk === 'MODERATE' ? '#eab308' : '#ef4444'
                    }}>
                        {data.factors.sky_conditions.cloud_cover_percent}%
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Elevation</span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: data.factors.pass_geometry.risk === 'LOW' ? '#22c55e' :
                            data.factors.pass_geometry.risk === 'MODERATE' ? '#eab308' : '#ef4444'
                    }}>
                        {data.factors.pass_geometry.max_elevation_deg.toFixed(1)}°
                    </span>
                </div>
            </div>

            {/* Next Pass */}
            <div style={{
                paddingTop: '12px',
                borderTop: '1px solid rgba(100, 116, 139, 0.2)',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ color: '#94a3b8' }}>Next Pass</span>
                <span style={{
                    fontWeight: '600',
                    color: 'white'
                }}>
                    {data.next_pass_time}
                </span>
            </div>
        </div>
    );
}