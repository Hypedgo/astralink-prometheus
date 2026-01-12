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
    Legend
} from "recharts";

interface SatelliteInfo {
    id: string;
    name: string;
    norad_id: number;
}

interface Pass {
    start_local: string;
    start_time: string;
    date: string;
    duration_minutes: number;
    max_elevation_deg: number;
    quality: string;
    magnitude: string | number;
}

interface SatellitePasses {
    satellite: SatelliteInfo;
    passes: Pass[];
}

export default function SatelliteOperations() {
    const [location, setLocation] = useState({
        lat: 34.6868,
        lon: -118.1542,
        name: 'Lancaster, CA',
        displayName: 'Lancaster, California, USA'
    });

    const [availableSatellites] = useState<SatelliteInfo[]>([
        { id: 'ISS', name: 'International Space Station', norad_id: 25544 },
        { id: 'HUBBLE', name: 'Hubble Space Telescope', norad_id: 20580 },
        { id: 'TIANGONG', name: 'Tiangong Space Station', norad_id: 48274 },
        { id: 'STARLINK', name: 'Starlink-2411', norad_id: 53105 }
    ]);

    const [selectedSatellites, setSelectedSatellites] = useState<string[]>(['ISS', 'HUBBLE']);
    const [satelliteData, setSatelliteData] = useState<Record<string, SatellitePasses>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchSatelliteData();
    }, [location, selectedSatellites]);

    const fetchSatelliteData = async () => {
        setLoading(true);

        const newData: Record<string, SatellitePasses> = {};

        for (const satId of selectedSatellites) {
            try {
                const response = await fetch(
                    `http://localhost:8000/api/satellites/passes?lat=${location.lat}&lon=${location.lon}&satellite_id=${satId}&days=3`
                );
                const data = await response.json();

                // Only add if we got valid data with satellite info
                if (!data.error && data.satellite && data.passes) {
                    newData[satId] = data;
                } else {
                    console.warn(`Invalid data for ${satId}:`, data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${satId}:`, error);
            }
        }

        setSatelliteData(newData);
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

    const toggleSatellite = (satId: string) => {
        setSelectedSatellites(prev =>
            prev.includes(satId)
                ? prev.filter(id => id !== satId)
                : [...prev, satId]
        );
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'EXCELLENT': return '#00ff88';
            case 'GOOD': return '#00bfff';
            case 'FAIR': return '#ffaa00';
            case 'POOR': return '#ff3366';
            default: return '#666666';
        }
    };

    const getSatelliteColor = (satId: string) => {
        switch (satId) {
            case 'ISS': return '#00ff88';
            case 'HUBBLE': return '#00bfff';
            case 'TIANGONG': return '#ff6b9d';
            case 'STARLINK': return '#ffaa00';
            default: return '#ffffff';
        }
    };

    // Prepare elevation profile data
    const getElevationProfile = (passes: Pass[]) => {
        return passes.slice(0, 5).map((pass, i) => ({
            name: pass.start_time,
            elevation: pass.max_elevation_deg,
            duration: pass.duration_minutes
        }));
    };

    if (loading) {
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
                    Calculating Orbital Geometry
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
            {/* Grid Background */}
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

            {/* Navigation */}
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
                        textTransform: 'uppercase'
                    }}>
                        Mission Control
                    </Link>
                    <Link href="/planning" style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase'
                    }}>
                        Planning
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
                        Satellites
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: '#00bfff'
                        }}></div>
                    </div>
                </div>
            </nav>

            {/* Satellite Selection & Location Search */}
            <div style={{
                position: 'fixed',
                top: '120px',
                left: '80px',
                zIndex: 999,
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {/* Location Search */}
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
                        Observer Location
                    </div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#00bfff',
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
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>
                                        {result.display_name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                                        {result.latitude.toFixed(4)}°, {result.longitude.toFixed(4)}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Satellite Selection */}
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
                        marginBottom: '16px',
                        textTransform: 'uppercase'
                    }}>
                        Track Satellites
                    </div>

                    {availableSatellites.map(sat => (
                        <label
                            key={sat.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                background: selectedSatellites.includes(sat.id) ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: `1px solid ${selectedSatellites.includes(sat.id) ? getSatelliteColor(sat.id) : 'rgba(255, 255, 255, 0.1)'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!selectedSatellites.includes(sat.id)) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!selectedSatellites.includes(sat.id)) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedSatellites.includes(sat.id)}
                                onChange={() => toggleSatellite(sat.id)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: getSatelliteColor(sat.id)
                                }}>
                                    {sat.name}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255, 255, 255, 0.4)'
                                }}>
                                    NORAD {sat.norad_id}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                paddingTop: '150px',
                paddingBottom: '100px',
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '150px 80px 100px 520px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Hero */}
                <div style={{ marginBottom: '80px' }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        letterSpacing: '4px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginBottom: '30px',
                        textTransform: 'uppercase'
                    }}>
                        Satellite Operations
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
                        What Is In<br />Orbit?
                    </h1>

                    <p style={{
                        fontSize: '20px',
                        fontWeight: '300',
                        color: 'rgba(255, 255, 255, 0.5)',
                        letterSpacing: '0.5px',
                        maxWidth: '700px',
                        lineHeight: '1.6'
                    }}>
                        Real-time orbital tracking and visibility intelligence for {selectedSatellites.length} space asset{selectedSatellites.length !== 1 ? 's' : ''} over {location.displayName}.
                    </p>
                </div>

                {/* Satellite Pass Tables */}
                {Object.entries(satelliteData).map(([satId, data]) => (
                    <div key={satId} style={{ marginBottom: '60px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                width: '4px',
                                height: '32px',
                                background: getSatelliteColor(satId),
                                borderRadius: '2px'
                            }}></div>
                            <div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: getSatelliteColor(satId)
                                }}>
                                    {data.satellite.name}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'rgba(255, 255, 255, 0.4)'
                                }}>
                                    NORAD {data.satellite.norad_id} • {data.passes.length} visible passes
                                </div>
                            </div>
                        </div>

                        {/* Pass Timeline */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '30px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                letterSpacing: '2px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                marginBottom: '20px',
                                textTransform: 'uppercase'
                            }}>
                                Next 3 Days • Pass Timeline
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '16px'
                            }}>
                                {data.passes.slice(0, 8).map((pass, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            border: `1px solid ${getQualityColor(pass.quality)}40`,
                                            borderRadius: '12px',
                                            padding: '20px',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '10px',
                                            color: 'rgba(255, 255, 255, 0.4)',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            {pass.date}
                                        </div>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '12px'
                                        }}>
                                            {pass.start_time}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                fontSize: '32px',
                                                fontWeight: '800',
                                                color: getQualityColor(pass.quality)
                                            }}>
                                                {pass.max_elevation_deg}°
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                max elevation
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                {pass.duration_minutes} min
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                color: getQualityColor(pass.quality),
                                                padding: '4px 8px',
                                                background: `${getQualityColor(pass.quality)}20`,
                                                borderRadius: '4px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {pass.quality}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Elevation Profile Chart */}
                        {data.passes.length > 0 && (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '30px'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    letterSpacing: '2px',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    marginBottom: '20px',
                                    textTransform: 'uppercase'
                                }}>
                                    Elevation Profile • Next 5 Passes
                                </div>
                                <div style={{ width: '100%', height: 200 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={getElevationProfile(data.passes)}>
                                            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={40}
                                                label={{ value: 'Elevation (°)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
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
                                            <Line
                                                type="monotone"
                                                dataKey="elevation"
                                                stroke={getSatelliteColor(satId)}
                                                strokeWidth={3}
                                                dot={{ fill: getSatelliteColor(satId), r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {selectedSatellites.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '100px 20px',
                        color: 'rgba(255, 255, 255, 0.4)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛰️</div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>
                            No satellites selected
                        </div>
                        <div style={{ fontSize: '14px', marginTop: '8px' }}>
                            Select satellites from the panel to view orbital data
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}