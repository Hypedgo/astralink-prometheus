'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart
} from "recharts";

interface ForecastWindow {
    time?: string;
    date?: string;
    hour?: string;
    day?: string;
    day_name?: string;
    score: number;
    tier: 'GREEN' | 'YELLOW' | 'RED';
    kp: number;
    clouds: number;
    elevation: number;
    has_pass?: boolean;
    pass_time?: string;
}

interface DetailedForecastData {
    hourly_72h: ForecastWindow[];
    weekly_7d: ForecastWindow[];
    next_optimal_window: ForecastWindow | null;
    trends: {
        kp: number[];
        clouds: number[];
    };
    metadata: {
        current_kp: number;
        current_clouds: number;
    };
}

// Mini trend chart component
function MiniTrendChart({
    data,
    valueKey,
    color = "rgba(0,255,136,0.9)"
}: {
    data: { x: string; y: number }[];
    valueKey: "kp" | "clouds";
    color?: string;
}) {
    return (
        <div style={{ width: "100%", height: 140, marginTop: 18 }}>
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                        dataKey="x"
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "rgba(0,0,0,0.9)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 12,
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="y"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${valueKey})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function MissionPlanning() {
    const [location, setLocation] = useState({
        lat: 34.6868,
        lon: -118.1542,
        name: 'Lancaster, CA',
        displayName: 'Lancaster, California, USA'
    });
    const [forecast, setForecast] = useState<DetailedForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [alertThresholds, setAlertThresholds] = useState({
        minScore: 80,
        maxKp: 4,
        maxClouds: 30
    });
    const [alertsEnabled, setAlertsEnabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchForecast();
        const saved = localStorage.getItem('astralink_alerts');
        if (saved) {
            const parsed = JSON.parse(saved);
            setAlertThresholds(parsed.thresholds);
            setAlertsEnabled(parsed.enabled);
        }
    }, [location]);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/forecast/detailed?lat=${location.lat}&lon=${location.lon}`
            );
            const data = await response.json();
            setForecast(data);
        } catch (error) {
            console.error('Failed to fetch forecast:', error);
        }
        setLoading(false);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/api/geocode?location=${encodeURIComponent(query)}`
            );
            const data = await response.json();

            if (!data.error) {
                setSearchResults([data]);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleLocationSelect = (result: any) => {
        setLocation({
            lat: result.latitude,
            lon: result.longitude,
            name: result.location_name,
            displayName: result.display_name
        });
        setSearchQuery('');
        setShowResults(false);
        setSearchResults([]);
    };

    const saveAlertSettings = () => {
        localStorage.setItem('astralink_alerts', JSON.stringify({
            thresholds: alertThresholds,
            enabled: alertsEnabled
        }));
        alert('Alert settings saved! (In-app notifications will appear when conditions match your criteria)');
    };

    const exportToCalendar = () => {
        if (!forecast) return;

        const optimalWindows = [
            ...forecast.hourly_72h.filter(w => w.score >= alertThresholds.minScore && w.has_pass),
            ...forecast.weekly_7d.filter(w => w.score >= alertThresholds.minScore)
        ];

        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AstraLink//Mission Planning//EN\n';

        optimalWindows.slice(0, 10).forEach((window, i) => {
            const startTime = window.time || window.date || new Date().toISOString();
            const formatted = startTime.replace(/[-:]/g, '').split('.')[0] + 'Z';

            icsContent += `BEGIN:VEVENT\n`;
            icsContent += `UID:astralink-${i}@astralink.com\n`;
            icsContent += `DTSTAMP:${formatted}\n`;
            icsContent += `DTSTART:${formatted}\n`;
            icsContent += `SUMMARY:ISS Observation - Score ${window.score}\n`;
            icsContent += `DESCRIPTION:Optimal observation window\\nScore: ${window.score}/100\\nElevation: ${window.elevation}°\\nClouds: ${window.clouds}%\\nKp: ${window.kp}\n`;
            icsContent += `END:VEVENT\n`;
        });

        icsContent += 'END:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'astralink-observation-windows.ics';
        a.click();
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'GREEN': return '#00ff88';
            case 'YELLOW': return '#ffaa00';
            case 'RED': return '#ff3366';
            default: return '#666666';
        }
    };

    // Prepare chart data
    const kpSeries = forecast?.weekly_7d?.map((day, i) => ({
        x: day.day_name?.slice(0, 3) || `Day ${i + 1}`,
        y: day.kp
    })) ?? [];

    const cloudSeries = forecast?.weekly_7d?.map((day, i) => ({
        x: day.day_name?.slice(0, 3) || `Day ${i + 1}`,
        y: day.clouds
    })) ?? [];

    // Find highest Kp and clearest day
    const highestKpDay = forecast?.weekly_7d?.reduce((max, day) =>
        day.kp > (max?.kp || 0) ? day : max
        , forecast.weekly_7d[0]);

    const clearestDay = forecast?.weekly_7d?.reduce((min, day) =>
        day.clouds < (min?.clouds || 100) ? day : min
        , forecast.weekly_7d[0]);

    if (loading || !forecast) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                background: '#000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '4px',
                    marginBottom: '30px',
                    textTransform: 'uppercase'
                }}>
                    Analyzing Observation Windows
                </div>
                <div style={{
                    width: '300px',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '50%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                        animation: 'slide 1.5s infinite'
                    }}></div>
                </div>
                <style jsx>{`
          @keyframes slide {
            from { transform: translateX(-100%); }
            to { transform: translateX(400%); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: '#000000',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
                backgroundSize: '100px 100px',
                opacity: 0.3,
                pointerEvents: 'none'
            }}></div>

            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '90px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 80px',
                zIndex: 1000
            }}>
                <Link href="/mission-control" style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#ffffff',
                    textDecoration: 'none',
                    letterSpacing: '2px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase'
                }}>
                    Astralink
                </Link>

                <div style={{ display: 'flex', gap: '50px', alignItems: 'center' }}>
                    <Link href="/mission-control" style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        transition: 'color 0.3s'
                    }}>
                        Mission Control
                    </Link>
                    <div style={{
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        position: 'relative',
                        paddingBottom: '2px'
                    }}>
                        Planning
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: '#00ff88'
                        }}></div>
                    </div>
                    <Link href="/satellites" style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        transition: 'color 0.3s'
                    }}>
                        Satellites
                    </Link>
                </div>
            </nav>

            {/* Location Search */}
            <div style={{
                position: 'fixed',
                top: '120px',
                left: '80px',
                zIndex: 999,
                width: '400px'
            }}>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '2px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '12px',
                        textTransform: 'uppercase'
                    }}>
                        Current Location
                    </div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#00ff88',
                        marginBottom: '16px'
                    }}>
                        {location.displayName}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '16px'
                    }}>
                        {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                    </div>
                    <input
                        type="text"
                        placeholder="Search new location..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    {showResults && searchResults.length > 0 && (
                        <div style={{
                            marginTop: '8px',
                            background: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            {searchResults.map((result, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleLocationSelect(result)}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#ffffff',
                                        marginBottom: '4px'
                                    }}>
                                        {result.display_name}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'rgba(255, 255, 255, 0.4)'
                                    }}>
                                        {result.latitude.toFixed(4)}°, {result.longitude.toFixed(4)}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                paddingTop: '150px',
                paddingBottom: '100px',
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '150px 80px 100px 520px',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ marginBottom: '80px' }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        letterSpacing: '4px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}>
                        Mission Planning Dashboard
                    </div>

                    <h1 style={{
                        fontSize: '96px',
                        fontWeight: '800',
                        lineHeight: '0.9',
                        marginBottom: '40px',
                        letterSpacing: '-4px',
                        background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        When Should<br />We Act?
                    </h1>

                    <p style={{
                        fontSize: '20px',
                        fontWeight: '300',
                        color: 'rgba(255, 255, 255, 0.5)',
                        letterSpacing: '0.5px',
                        maxWidth: '700px',
                        lineHeight: '1.6'
                    }}>
                        Comprehensive 72-hour and 7-day forecast analysis for {location.displayName}. The readiness score combines space weather (Kp index), cloud coverage, and ISS pass elevation to determine optimal observation windows.
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '40px',
                    marginBottom: '60px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '40px'
                }}>
                    <div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '800',
                            color: '#00ff88',
                            marginBottom: '12px'
                        }}>80-100</div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '8px'
                        }}>GREEN - GO</div>
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            lineHeight: '1.6'
                        }}>
                            Excellent conditions. Low Kp (&lt;4), clear skies (&lt;30% clouds), high elevation pass (&gt;50°)
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '800',
                            color: '#ffaa00',
                            marginBottom: '12px'
                        }}>60-79</div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '8px'
                        }}>YELLOW - CONDITIONAL</div>
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            lineHeight: '1.6'
                        }}>
                            Marginal conditions. Moderate Kp (4-6), partial clouds (30-70%), medium elevation (30-50°)
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '800',
                            color: '#ff3366',
                            marginBottom: '12px'
                        }}>0-59</div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '8px'
                        }}>RED - NO-GO</div>
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            lineHeight: '1.6'
                        }}>
                            Poor conditions. High Kp (&gt;6), heavy clouds (&gt;70%), low elevation (&lt;30°)
                        </div>
                    </div>
                </div>

                {forecast.next_optimal_window && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.02) 100%)',
                        border: '2px solid #00ff88',
                        borderRadius: '24px',
                        padding: '60px',
                        marginBottom: '80px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            background: 'linear-gradient(90deg, #00ff88, #00cc66)',
                            boxShadow: '0 0 40px #00ff88'
                        }}></div>

                        <div style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            letterSpacing: '3px',
                            color: '#00ff88',
                            marginBottom: '20px',
                            textTransform: 'uppercase'
                        }}>
                            🎯 Next Optimal Window
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '60px',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '72px',
                                    fontWeight: '800',
                                    lineHeight: '1',
                                    marginBottom: '20px',
                                    letterSpacing: '-3px'
                                }}>
                                    {forecast.next_optimal_window.hour || forecast.next_optimal_window.day_name}
                                </div>
                                <div style={{
                                    fontSize: '18px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    lineHeight: '1.6'
                                }}>
                                    {forecast.next_optimal_window.pass_time && (
                                        <div>ISS Pass: {forecast.next_optimal_window.pass_time}</div>
                                    )}
                                    <div>Elevation: {forecast.next_optimal_window.elevation.toFixed(1)}°</div>
                                    <div>Cloud Cover: {forecast.next_optimal_window.clouds}%</div>
                                    <div>Kp Index: {forecast.next_optimal_window.kp}</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '120px',
                                    fontWeight: '900',
                                    lineHeight: '1',
                                    color: '#00ff88',
                                    letterSpacing: '-6px'
                                }}>
                                    {forecast.next_optimal_window.score}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    marginTop: '10px',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase'
                                }}>
                                    Readiness
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '80px' }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}>
                        72-Hour Detailed Forecast
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '12px'
                    }}>
                        {forecast.hourly_72h.map((window, i) => (
                            <div
                                key={i}
                                style={{
                                    background: window.score >= 80 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${window.score >= 80 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                                    borderRadius: '12px',
                                    padding: '20px 12px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = window.score >= 80 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = window.score >= 80 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 255, 255, 0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    fontSize: '10px',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }}>
                                    {window.day}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginBottom: '12px'
                                }}>
                                    {window.hour}
                                </div>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: '800',
                                    color: getTierColor(window.tier),
                                    marginBottom: '8px',
                                    letterSpacing: '-2px'
                                }}>
                                    {window.score}
                                </div>
                                {window.has_pass && (
                                    <div style={{
                                        fontSize: '16px',
                                        marginTop: '6px'
                                    }}>🛰️</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}>
                        7-Day Overview
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '16px'
                    }}>
                        {forecast.weekly_7d.map((day, i) => (
                            <div
                                key={i}
                                style={{
                                    background: day.score >= 80 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${day.score >= 80 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                                    borderRadius: '16px',
                                    padding: '30px 20px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '1px'
                                }}>
                                    {i === 0 ? 'TODAY' : (day.day_name || '').slice(0, 3).toUpperCase()}
                                </div>
                                <div style={{
                                    fontSize: '64px',
                                    fontWeight: '900',
                                    color: getTierColor(day.tier),
                                    marginBottom: '12px',
                                    letterSpacing: '-3px'
                                }}>
                                    {day.score}
                                </div>
                                <div style={{
                                    fontSize: '10px',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    lineHeight: '1.6'
                                }}>
                                    <div>{day.elevation > 0 ? `${day.elevation.toFixed(0)}° elev` : 'No pass'}</div>
                                    <div>{day.clouds}% clouds</div>
                                    <div>Kp {day.kp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}>
                        7-Day Trends & Risk Analysis
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '40px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '40px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '12px'
                            }}>
                                Kp Index Forecast
                            </div>
                            <div style={{
                                fontSize: '48px',
                                fontWeight: '800',
                                color: forecast.metadata.current_kp <= 4 ? '#00ff88' : forecast.metadata.current_kp <= 6 ? '#ffaa00' : '#ff3366',
                                marginBottom: '8px'
                            }}>
                                {forecast.metadata.current_kp}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                marginBottom: '4px'
                            }}>
                                Current space weather index
                            </div>
                            {highestKpDay && (
                                <div style={{
                                    fontSize: '11px',
                                    color: '#ffaa00',
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    background: 'rgba(255, 170, 0, 0.1)',
                                    borderRadius: '6px'
                                }}>
                                    ⚠️ Highest Kp expected: {highestKpDay.kp} on {highestKpDay.day_name}
                                </div>
                            )}
                            <MiniTrendChart data={kpSeries} valueKey="kp" color="rgba(0,255,136,0.9)" />
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '40px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '12px'
                            }}>
                                Cloud Cover Forecast
                            </div>
                            <div style={{
                                fontSize: '48px',
                                fontWeight: '800',
                                color: forecast.metadata.current_clouds < 30 ? '#00ff88' : forecast.metadata.current_clouds < 60 ? '#ffaa00' : '#ff3366',
                                marginBottom: '8px'
                            }}>
                                {forecast.metadata.current_clouds}%
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                marginBottom: '4px'
                            }}>
                                Current cloud coverage
                            </div>
                            {clearestDay && (
                                <div style={{
                                    fontSize: '11px',
                                    color: '#00ff88',
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    borderRadius: '6px'
                                }}>
                                    ✨ Clearest day: {clearestDay.day_name} ({clearestDay.clouds}% clouds)
                                </div>
                            )}
                            <MiniTrendChart data={cloudSeries} valueKey="clouds" color="rgba(0,191,255,0.9)" />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}>
                        Alert Settings
                    </div>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '40px'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '30px',
                            marginBottom: '30px'
                        }}>
                            <div>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginBottom: '12px',
                                    display: 'block',
                                    letterSpacing: '1px'
                                }}>
                                    MINIMUM SCORE
                                </label>
                                <input
                                    type="number"
                                    value={alertThresholds.minScore}
                                    onChange={(e) => setAlertThresholds({ ...alertThresholds, minScore: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: '#ffffff',
                                        fontSize: '24px',
                                        fontWeight: '700'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginBottom: '12px',
                                    display: 'block',
                                    letterSpacing: '1px'
                                }}>
                                    MAXIMUM Kp
                                </label>
                                <input
                                    type="number"
                                    value={alertThresholds.maxKp}
                                    onChange={(e) => setAlertThresholds({ ...alertThresholds, maxKp: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: '#ffffff',
                                        fontSize: '24px',
                                        fontWeight: '700'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginBottom: '12px',
                                    display: 'block',
                                    letterSpacing: '1px'
                                }}>
                                    MAXIMUM CLOUDS (%)
                                </label>
                                <input
                                    type="number"
                                    value={alertThresholds.maxClouds}
                                    onChange={(e) => setAlertThresholds({ ...alertThresholds, maxClouds: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: '#ffffff',
                                        fontSize: '24px',
                                        fontWeight: '700'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={saveAlertSettings}
                                style={{
                                    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '16px 40px',
                                    color: '#000000',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Save Alert Settings
                            </button>

                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.7)'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={alertsEnabled}
                                    onChange={(e) => setAlertsEnabled(e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                Enable in-app notifications
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '20px'
                }}>
                    <button
                        onClick={exportToCalendar}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '16px 40px',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        📅 Export to Calendar
                    </button>
                </div>
            </div>
        </div>
    );
}