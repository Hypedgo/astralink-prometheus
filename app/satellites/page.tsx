'use client';

import { useState, useEffect } from 'react';
import NavBar from '../NavBar';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
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

const SAT_COLORS: Record<string, string> = {
    ISS: '#00ff88',
    HUBBLE: '#22d3ee',
    TIANGONG: '#ff6b9d',
    STARLINK: '#ffaa00',
};

const SAT_NAMES: Record<string, string> = {
    ISS: "INT'L SPACE STATION",
    HUBBLE: 'HUBBLE SPACE TELESCOPE',
    TIANGONG: 'TIANGONG SPACE STATION',
    STARLINK: 'STARLINK-2411',
};

export default function SatelliteOperations() {
    const [location, setLocation] = useState({
        lat: 34.6868,
        lon: -118.1542,
        name: 'Lancaster, CA',
        displayName: 'Lancaster, California, USA'
    });

    const availableSatellites: SatelliteInfo[] = [
        { id: 'ISS', name: 'International Space Station', norad_id: 25544 },
        { id: 'HUBBLE', name: 'Hubble Space Telescope', norad_id: 20580 },
        { id: 'TIANGONG', name: 'Tiangong Space Station', norad_id: 48274 },
        { id: 'STARLINK', name: 'Starlink-2411', norad_id: 53105 },
    ];

    const [selectedSatellites, setSelectedSatellites] = useState<string[]>(['ISS', 'HUBBLE', 'TIANGONG', 'STARLINK']);
    const [satelliteData, setSatelliteData] = useState<Record<string, SatellitePasses>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [utc, setUtc] = useState('');

    useEffect(() => {
        const tick = () => {
            const n = new Date();
            const p = (v: number) => String(v).padStart(2, '0');
            setUtc(`${p(n.getUTCHours())}:${p(n.getUTCMinutes())}:${p(n.getUTCSeconds())}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        fetchSatelliteData();
    }, [location, selectedSatellites]);

    const fetchSatelliteData = async () => {
        setLoading(true);
        const newData: Record<string, SatellitePasses> = {};
        for (const satId of selectedSatellites) {
            try {
                const response = await fetch(
                    `https://astralink-prometheus-production.up.railway.app/api/satellites/passes?lat=${location.lat}&lon=${location.lon}&satellite_id=${satId}&days=3`
                );
                const data = await response.json();
                if (!data.error && data.satellite && data.passes) {
                    newData[satId] = data;
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
        if (query.length < 2) { setSearchResults([]); setShowResults(false); return; }
        try {
            const response = await fetch(`https://astralink-prometheus-production.up.railway.app/api/geocode?location=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (!data.error) { setSearchResults([data]); setShowResults(true); }
        } catch (error) { console.error('Search failed:', error); }
    };

    const handleLocationSelect = (result: any) => {
        setLocation({ lat: result.latitude, lon: result.longitude, name: result.location_name, displayName: result.display_name });
        setSearchQuery(''); setShowResults(false); setSearchResults([]);
    };

    const toggleSatellite = (satId: string) => {
        setSelectedSatellites(prev =>
            prev.includes(satId) ? prev.filter(id => id !== satId) : [...prev, satId]
        );
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'EXCELLENT': return '#00ff88';
            case 'GOOD': return '#22d3ee';
            case 'FAIR': return '#ffaa00';
            case 'POOR': return '#f87171';
            default: return '#666666';
        }
    };

    const getElevationProfile = (passes: Pass[]) => {
        return passes.slice(0, 5).map((pass) => ({
            name: pass.start_time,
            elevation: pass.max_elevation_deg,
            duration: pass.duration_minutes,
        }));
    };

    // Build timeline across all satellites
    const allPasses = availableSatellites
        .filter(s => satelliteData[s.id])
        .flatMap(s => (satelliteData[s.id].passes || []).slice(0, 3).map(p => ({ ...p, satId: s.id })))
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .slice(0, 6);

    const bestPass = allPasses[0];
    const totalPasses = Object.values(satelliteData).reduce((acc, d) => acc + d.passes.length, 0);

    if (loading) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: '300px' }}>
                <img src="/logo.png" alt="AstraLink" style={{ width: '360px', opacity: 0.9, marginBottom: '-90px' }} />
                <div style={{ width: '360px', height: '3px', background: 'rgba(34,211,238,0.2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '40%', background: '#22d3ee', animation: 'loading 1.4s ease-in-out infinite' }} />
                </div>
                <style>{`@keyframes loading { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', minHeight: '100vh', background: '#000000', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>

            <NavBar />

            {/* UTC bar */}
            <div style={{ borderBottom: '1px solid rgba(0,255,136,0.2)', padding: '7px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.7)', marginTop: '56px' }}>
                <span style={{ fontSize: '11px', color: '#00ff88', letterSpacing: '3px', fontFamily: 'Arial, sans-serif' }}>◈ SPACECRAFT TRACKING</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>UTC {utc}</span>
            </div>

            {/* Location bar */}
            <div style={{ borderBottom: '1px solid rgba(34,211,238,0.12)', padding: '9px 24px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(34,211,238,0.02)', flexWrap: 'wrap' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff88', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#fff', flex: 1 }}>{location.displayName}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{location.lat.toFixed(4)}° N · {Math.abs(location.lon).toFixed(4)}° W</span>
                <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Change location..." value={searchQuery} onChange={e => handleSearch(e.target.value)}
                        style={{ background: '#000', border: '1px solid rgba(34,211,238,0.3)', color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '11px', padding: '6px 10px', width: '180px', outline: 'none' }} />
                    {showResults && searchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, background: '#000', border: '1px solid rgba(34,211,238,0.3)', zIndex: 100, minWidth: '260px' }}>
                            {searchResults.map((r, i) => (
                                <div key={i} onClick={() => handleLocationSelect(r)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(34,211,238,0.1)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,211,238,0.05)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <div style={{ fontSize: '12px', color: '#fff' }}>{r.display_name}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{r.latitude.toFixed(4)}°, {r.longitude.toFixed(4)}°</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '20px 24px 60px' }}>

                {/* Hero description */}
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(34,211,238,0.1)' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>SATELLITE OPERATIONS</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: 1, letterSpacing: '-1px', marginBottom: '10px' }}>What Is In Orbit?</div>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '620px', lineHeight: '1.7', margin: 0 }}>
                                Real-time orbital tracking and visibility intelligence for {selectedSatellites.length} space asset{selectedSatellites.length !== 1 ? 's' : ''} over {location.displayName}. View pass predictions, elevation profiles, and upcoming visibility windows. Toggle satellites below to customize your tracking view.
                            </p>
                        </div>
                        {/* Satellite toggles */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start', flexShrink: 0 }}>
                            {availableSatellites.map(sat => {
                                const active = selectedSatellites.includes(sat.id);
                                const color = SAT_COLORS[sat.id];
                                return (
                                    <button key={sat.id} onClick={() => toggleSatellite(sat.id)}
                                        style={{ fontSize: '10px', border: `1px solid ${active ? color : 'rgba(255,255,255,0.15)'}`, color: active ? color : 'rgba(255,255,255,0.3)', padding: '5px 12px', letterSpacing: '1px', background: active ? `${color}10` : 'transparent', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Arial, sans-serif' }}>
                                        {active ? '✓' : '○'} {sat.id}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(34,211,238,0.08)', marginBottom: '20px' }}>
                    {[
                        { label: 'ACTIVE ASSETS', value: String(selectedSatellites.length), color: '#00ff88' },
                        { label: 'NEXT PASS', value: bestPass ? bestPass.satId : '—', color: '#22d3ee' },
                        { label: 'BEST ELEVATION', value: bestPass ? `${bestPass.max_elevation_deg}°` : '—', color: '#00ff88' },
                        { label: 'TOTAL PASSES', value: String(totalPasses), color: '#ffffff' },
                    ].map(({ label, value, color }, i) => (
                        <div key={i} style={{ background: '#000', padding: '12px 16px', textAlign: 'center', borderTop: `2px solid ${color}` }}>
                            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '5px' }}>{label}</div>
                            <div style={{ fontSize: '26px', color, fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Satellite cards grid */}
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '4px', marginBottom: '12px', borderLeft: '2px solid #00ff88', paddingLeft: '8px' }}>
                    ORBITAL ASSETS — ELEVATION PROFILES
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
                    {availableSatellites.map(sat => {
                        const active = selectedSatellites.includes(sat.id);
                        const data = satelliteData[sat.id];
                        const color = SAT_COLORS[sat.id];
                        const shortName = SAT_NAMES[sat.id];
                        const firstPass = data?.passes?.[0];
                        const elevData = data ? getElevationProfile(data.passes) : [];

                        return (
                            <div key={sat.id} style={{ border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.06)'}`, background: active ? `${color}04` : 'rgba(0,0,0,0.4)', padding: '14px', position: 'relative', overflow: 'hidden', opacity: active ? 1 : 0.45, transition: 'all 0.2s' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: active ? color : 'rgba(255,255,255,0.1)' }} />
                                <div style={{ fontSize: '9px', letterSpacing: '3px', color: active ? color : 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>{sat.id}</div>
                                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', marginBottom: '8px' }}>{shortName}</div>
                                {active && firstPass ? (
                                    <>
                                        <div style={{ fontSize: '28px', color, fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1, marginBottom: '2px' }}>{firstPass.max_elevation_deg}°</div>
                                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '8px' }}>MAX ELEVATION</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{firstPass.start_time}</div>
                                                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>NEXT PASS</div>
                                            </div>
                                            <div style={{ fontSize: '7px', background: `${getQualityColor(firstPass.quality)}15`, border: `1px solid ${getQualityColor(firstPass.quality)}50`, color: getQualityColor(firstPass.quality), padding: '2px 6px', letterSpacing: '1px' }}>
                                                {firstPass.quality}
                                            </div>
                                        </div>
                                        {/* Chart */}
                                        <div style={{ borderTop: `1px solid ${color}15`, paddingTop: '8px' }}>
                                            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', marginBottom: '4px' }}>ELEVATION · 5 PASSES</div>
                                            <div style={{ height: '60px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={elevData} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
                                                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                                        <XAxis dataKey="name" hide />
                                                        <YAxis hide />
                                                        <Tooltip contentStyle={{ background: '#000', border: `1px solid ${color}40`, color: '#fff', fontSize: 10, fontFamily: 'Arial' }} labelStyle={{ color: 'rgba(255,255,255,0.5)' }} />
                                                        <Line type="monotone" dataKey="elevation" stroke={color} strokeWidth={1.5} dot={{ fill: color, r: 2 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '6px', fontSize: '7px', color: 'rgba(255,255,255,0.2)' }}>NORAD {sat.norad_id} · {firstPass.duration_minutes} min avg</div>
                                    </>
                                ) : (
                                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', marginBottom: '8px' }}>{active ? 'NO DATA' : 'NOT TRACKING'}</div>
                                        <div style={{ border: '1px dashed rgba(255,255,255,0.1)', padding: '12px', fontSize: '8px', color: 'rgba(255,255,255,0.15)', letterSpacing: '1px' }}>
                                            {active ? 'AWAITING DATA' : 'ENABLE ABOVE'}
                                        </div>
                                        <div style={{ marginTop: '40px', fontSize: '7px', color: 'rgba(255,255,255,0.15)' }}>NORAD {sat.norad_id}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pass timeline */}
                {allPasses.length > 0 && (
                    <div style={{ border: '1px solid rgba(34,211,238,0.12)', background: 'rgba(0,0,0,0.5)', padding: '14px 18px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '14px', borderLeft: '2px solid #22d3ee', paddingLeft: '8px' }}>UPCOMING PASS TIMELINE</div>
                        <div style={{ position: 'relative', padding: '8px 0' }}>
                            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(34,211,238,0.12)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 1 }}>
                                {allPasses.map((pass, i) => {
                                    const color = SAT_COLORS[pass.satId] || '#ffffff';
                                    const faded = i >= 3;
                                    return (
                                        <div key={i} style={{ textAlign: 'center', opacity: faded ? 0.4 : 1 }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, margin: '0 auto 5px', border: `1px solid ${color}80` }} />
                                            <div style={{ fontSize: '12px', color, fontWeight: 600, letterSpacing: '1px' }}>{pass.start_time}</div>
                                            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', marginTop: '2px', letterSpacing: '1px' }}>{pass.satId}</div>
                                            <div style={{ fontSize: '7px', color: `${color}80`, marginTop: '1px' }}>{pass.max_elevation_deg}°</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed pass tables per satellite */}
                {Object.entries(satelliteData).map(([satId, data]) => {
                    const color = SAT_COLORS[satId] || '#ffffff';
                    return (
                        <div key={satId} style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '3px', height: '28px', background: color }} />
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color }}>{data.satellite.name}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>NORAD {data.satellite.norad_id} · {data.passes.length} visible passes</div>
                                </div>
                            </div>
                            <div style={{ border: `1px solid ${color}15`, background: `${color}03`, padding: '20px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>NEXT 3 DAYS · PASS TIMELINE</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                                    {data.passes.slice(0, 8).map((pass, i) => (
                                        <div key={i}
                                            style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${getQualityColor(pass.quality)}30`, padding: '14px', transition: 'all 0.2s', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '1px' }}>{pass.date}</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{pass.start_time}</div>
                                            <div style={{ fontSize: '26px', fontWeight: 800, color: getQualityColor(pass.quality), lineHeight: 1, marginBottom: '4px' }}>{pass.max_elevation_deg}°</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>max elevation</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{pass.duration_minutes} min</div>
                                                <div style={{ fontSize: '8px', color: getQualityColor(pass.quality), padding: '2px 6px', background: `${getQualityColor(pass.quality)}15`, letterSpacing: '0.5px' }}>{pass.quality}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {selectedSatellites.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.3)' }}>
                        <div style={{ fontSize: '13px', letterSpacing: '3px', marginBottom: '8px' }}>NO SATELLITES SELECTED</div>
                        <div style={{ fontSize: '12px' }}>Toggle satellites above to begin tracking</div>
                    </div>
                )}

                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '1px', textAlign: 'right', marginTop: '10px' }}>
                    Sources: <span style={{ color: 'rgba(255,255,255,0.3)' }}>N2YO</span> · <span style={{ color: 'rgba(255,255,255,0.3)' }}>NOAA SWPC</span> · <span style={{ color: 'rgba(255,255,255,0.3)' }}>Open-Meteo</span>
                </div>
            </div>
        </div>
    );
}