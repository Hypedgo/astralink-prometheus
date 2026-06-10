'use client';

import { useState, useEffect } from 'react';
import NavBar from '../NavBar';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

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
    trends: { kp: number[]; clouds: number[] };
    metadata: { current_kp: number; current_clouds: number };
}

const T = {
    green: '#00ff88',
    greenDim: 'rgba(0,255,136,0.45)',
    greenBg: 'rgba(0,255,136,0.05)',
    greenBorder: 'rgba(0,255,136,0.22)',
    yellow: '#facc15',
    yellowBg: 'rgba(250,204,21,0.08)',
    yellowBorder: 'rgba(250,204,21,0.25)',
    red: '#f87171',
    redBg: 'rgba(248,113,113,0.07)',
    redBorder: 'rgba(248,113,113,0.25)',
    blue: '#22d3ee',
    textPrimary: '#ffffff',
    textSec: 'rgba(255,255,255,0.6)',
    textMuted: 'rgba(255,255,255,0.25)',
    border: 'rgba(34,211,238,0.15)',
    borderMed: 'rgba(34,211,238,0.3)',
    bg: '#000000',
    bgPanel: 'rgba(0,0,0,0.7)',
    bgHover: 'rgba(34,211,238,0.05)',
    fontHead: "'Audiowide', sans-serif",
    fontBody: "Arial, sans-serif",
    fontSerif: "'DM Serif Display', serif",
} as const;

function tierColor(tier: string) {
    if (tier === 'GREEN') return T.green;
    if (tier === 'YELLOW') return T.yellow;
    return T.red;
}
function tierBorder(tier: string) {
    if (tier === 'GREEN') return T.greenBorder;
    if (tier === 'YELLOW') return T.yellowBorder;
    return T.redBorder;
}
function tierBg(tier: string) {
    if (tier === 'GREEN') return T.greenBg;
    if (tier === 'YELLOW') return T.yellowBg;
    return T.redBg;
}
function tierLabel(tier: string) {
    if (tier === 'GREEN') return '■ GO';
    if (tier === 'YELLOW') return '◐ CAUTION';
    return '✕ NO-GO';
}
function scoreColor(score: number) {
    if (score >= 80) return T.green;
    if (score >= 60) return T.yellow;
    return T.red;
}

function PanelHeader({ title, right }: { title: string; right?: string }) {
    return (
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontFamily: T.fontHead, fontSize: '10px', color: T.textPrimary, letterSpacing: '1.5px' }}>{title}</span>
            {right && <span style={{ fontFamily: T.fontBody, fontSize: '9px', color: T.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>{right}</span>}
        </div>
    );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ border: `1px solid ${T.border}`, background: T.bgPanel, ...style }}>{children}</div>;
}

function CondRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: T.fontBody, fontSize: '12px', color: T.textMuted }}>{label}</span>
            <span style={{ fontFamily: T.fontBody, fontSize: '12px', fontWeight: 700, color: valueColor || T.textPrimary }}>{value}</span>
        </div>
    );
}

function MiniAreaChart({ data, color }: { data: { x: string; y: number }[]; color: string }) {
    return (
        <div style={{ width: '100%', height: 80, marginTop: 10 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`grad-${color.replace(/[^a-z]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="x" tick={{ fill: T.textMuted, fontSize: 9, fontFamily: T.fontBody }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textMuted, fontSize: 9, fontFamily: T.fontBody }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ background: '#000000', border: `1px solid ${T.borderMed}`, borderRadius: 4, color: T.textPrimary, fontSize: 11, fontFamily: T.fontBody }} labelStyle={{ color: T.textMuted }} />
                    <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} fill={`url(#grad-${color.replace(/[^a-z]/gi, '')})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <img src="/logo.png" alt="AstraLink" style={{ width: '180px', opacity: 0.9 }} />
            <div style={{ width: '180px', height: '2px', background: 'rgba(34,211,238,0.2)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: '#22d3ee', animation: 'scan 1.4s ease-in-out infinite' }} />
            </div>
            <style>{`@keyframes scan { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
        </div>
    );
}

export default function MissionPlanning() {
    const [location, setLocation] = useState({ lat: 34.6868, lon: -118.1542, name: 'Lancaster, CA', displayName: 'Lancaster, California, USA' });
    const [forecast, setForecast] = useState<DetailedForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [alertThresholds, setAlertThresholds] = useState({ minScore: 80, maxKp: 4, maxClouds: 30 });
    const [alertsEnabled, setAlertsEnabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [utc, setUtc] = useState('');
    const [saved, setSaved] = useState(false);

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
        fetchForecast();
        const raw = localStorage.getItem('astralink_alerts');
        if (raw) {
            const parsed = JSON.parse(raw);
            setAlertThresholds(parsed.thresholds);
            setAlertsEnabled(parsed.enabled);
        }
    }, [location]);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://astralink-prometheus-production.up.railway.app/api/forecast/detailed?lat=${location.lat}&lon=${location.lon}`);
            const data = await res.json();
            setForecast(data);
        } catch (e) { console.error('Failed to fetch forecast:', e); }
        setLoading(false);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) { setSearchResults([]); setShowResults(false); return; }
        try {
            const res = await fetch(`https://astralink-prometheus-production.up.railway.app/api/geocode?location=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (!data.error) { setSearchResults([data]); setShowResults(true); }
        } catch (e) { console.error('Search failed:', e); }
    };

    const handleLocationSelect = (result: any) => {
        setLocation({ lat: result.latitude, lon: result.longitude, name: result.location_name, displayName: result.display_name });
        setSearchQuery(''); setShowResults(false); setSearchResults([]);
    };

    const saveAlertSettings = () => {
        localStorage.setItem('astralink_alerts', JSON.stringify({ thresholds: alertThresholds, enabled: alertsEnabled }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const exportToCalendar = () => {
        if (!forecast) return;
        const windows = [...forecast.hourly_72h.filter(w => w.score >= alertThresholds.minScore && w.has_pass), ...forecast.weekly_7d.filter(w => w.score >= alertThresholds.minScore)];
        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AstraLink//Mission Planning//EN\n';
        windows.slice(0, 10).forEach((w, i) => {
            const t = (w.time || w.date || new Date().toISOString()).replace(/[-:]/g, '').split('.')[0] + 'Z';
            ics += `BEGIN:VEVENT\nUID:astralink-${i}@astralink.com\nDTSTAMP:${t}\nDTSTART:${t}\nSUMMARY:ISS Observation - Score ${w.score}\nDESCRIPTION:Score: ${w.score}/100\\nElevation: ${w.elevation}°\\nClouds: ${w.clouds}%\\nKp: ${w.kp}\nEND:VEVENT\n`;
        });
        ics += 'END:VCALENDAR';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
        a.download = 'astralink-observation-windows.ics';
        a.click();
    };

    const kpSeries = forecast?.weekly_7d?.map((d, i) => ({ x: (d.day_name || `D${i + 1}`).slice(0, 3), y: d.kp })) ?? [];
    const cloudSeries = forecast?.weekly_7d?.map((d, i) => ({ x: (d.day_name || `D${i + 1}`).slice(0, 3), y: d.clouds })) ?? [];
    const highestKpDay = forecast?.weekly_7d?.reduce((max, d) => d.kp > (max?.kp ?? 0) ? d : max, forecast.weekly_7d[0]);
    const clearestDay = forecast?.weekly_7d?.reduce((min, d) => d.clouds < (min?.clouds ?? 100) ? d : min, forecast.weekly_7d[0]);

    if (loading || !forecast) return <LoadingScreen />;

    // Compute score and tier from best available data
    const currentScore = forecast.next_optimal_window?.score ?? Math.round(
        (forecast.metadata.current_kp <= 3 ? 40 : forecast.metadata.current_kp <= 5 ? 25 : 10) +
        (forecast.metadata.current_clouds < 30 ? 40 : forecast.metadata.current_clouds < 60 ? 25 : 10) +
        15
    );
    const currentTier: 'GREEN' | 'YELLOW' | 'RED' = currentScore >= 80 ? 'GREEN' : currentScore >= 60 ? 'YELLOW' : 'RED';

    return (
        <div style={{ width: '100vw', minHeight: '100vh', background: T.bg, color: T.textPrimary, fontFamily: T.fontBody }}>
            <NavBar />

            {/* UTC bar */}
            <div style={{ borderBottom: `1px solid ${T.greenBorder}`, padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.8)', marginTop: '56px' }}>
                <div style={{ fontFamily: T.fontHead, fontSize: '11px', color: T.green, letterSpacing: '2px' }}>◈ MISSION PLANNING</div>
                <div style={{ fontFamily: T.fontBody, fontSize: '11px', color: T.textMuted, letterSpacing: '1px' }}>UTC {utc}</div>
            </div>

            <div style={{ padding: '0 20px 60px' }}>

                {/* Location bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', border: `1px solid ${T.border}`, borderTop: 'none', background: 'rgba(0,0,0,0.5)', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.green, flexShrink: 0 }} />
                    <span style={{ fontFamily: T.fontBody, fontSize: '13px', color: T.textPrimary, flex: 1 }}>{location.displayName}</span>
                    <span style={{ fontFamily: T.fontBody, fontSize: '11px', color: T.textMuted }}>{location.lat.toFixed(4)}° N · {Math.abs(location.lon).toFixed(4)}° W</span>
                    <div style={{ position: 'relative' }}>
                        <input type="text" placeholder="Change location..." value={searchQuery} onChange={e => handleSearch(e.target.value)}
                            style={{ background: '#000000', border: `1px solid ${T.borderMed}`, color: T.textPrimary, fontFamily: T.fontBody, fontSize: '11px', padding: '6px 10px', width: '180px', outline: 'none' }} />
                        {showResults && searchResults.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#000000', border: `1px solid ${T.borderMed}`, zIndex: 100, minWidth: '260px' }}>
                                {searchResults.map((r, i) => (
                                    <div key={i} onClick={() => handleLocationSelect(r)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: `1px solid ${T.border}` }}
                                        onMouseEnter={e => (e.currentTarget.style.background = T.bgHover)}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        <div style={{ fontFamily: T.fontBody, fontSize: '12px', color: T.textPrimary }}>{r.display_name}</div>
                                        <div style={{ fontFamily: T.fontBody, fontSize: '10px', color: T.textMuted, marginTop: '2px' }}>{r.latitude.toFixed(4)}°, {r.longitude.toFixed(4)}°</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mission Readiness */}
                <Panel style={{ marginBottom: '14px' }}>
                    <PanelHeader title="Mission Readiness" right={location.name} />
                    <div style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <div style={{ fontFamily: T.fontSerif, fontSize: '56px', color: scoreColor(currentScore), lineHeight: 1, flexShrink: 0 }}>
                                {currentScore}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, marginBottom: '7px' }}>
                                    <div style={{ height: '100%', width: `${currentScore}%`, background: scoreColor(currentScore), transition: 'width 0.5s ease' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: T.fontHead, fontSize: '9px', color: scoreColor(currentScore), border: `1px solid ${tierBorder(currentTier)}`, background: tierBg(currentTier), padding: '3px 10px', letterSpacing: '2px' }}>
                                        {currentTier === 'GREEN' ? '▶ GO FOR OPERATIONS' : currentTier === 'YELLOW' ? '◐ CONDITIONAL GO' : '✕ NO-GO'}
                                    </span>
                                    <span style={{ fontFamily: T.fontBody, fontSize: '10px', color: T.textMuted }}>/ 100</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '28px', paddingTop: '12px', borderTop: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Kp Index', value: String(forecast.metadata.current_kp), color: forecast.metadata.current_kp <= 4 ? T.green : T.yellow },
                                { label: 'Cloud Cover', value: `${forecast.metadata.current_clouds}%`, color: forecast.metadata.current_clouds < 30 ? T.green : forecast.metadata.current_clouds < 60 ? T.yellow : T.red },
                                ...(forecast.next_optimal_window ? [
                                    { label: 'Elevation', value: `${forecast.next_optimal_window.elevation.toFixed(1)}°`, color: T.textPrimary },
                                    { label: 'Pass Time', value: forecast.next_optimal_window.pass_time || forecast.next_optimal_window.hour || '—', color: T.blue },
                                    { label: 'Next Window', value: forecast.next_optimal_window.hour || forecast.next_optimal_window.day_name || '—', color: T.textPrimary },
                                ] : []),
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div style={{ fontFamily: T.fontBody, fontSize: '9px', color: T.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
                                    <div style={{ fontFamily: T.fontBody, fontSize: '14px', fontWeight: 700, color }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* Forecast + Brief */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,280px) 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Panel>
                        <PanelHeader title="Readiness Forecast" right="7-day" />
                        <div style={{ padding: '10px 14px' }}>
                            {forecast.weekly_7d.map((day, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: i < forecast.weekly_7d.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                                    <span style={{ fontFamily: T.fontBody, fontSize: '11px', color: T.textSec, width: '88px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day +${i}`}
                                    </span>
                                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '9px', color: T.border, overflow: 'hidden', whiteSpace: 'nowrap', letterSpacing: '3px' }}>
                                        ......................
                                    </span>
                                    <span style={{ fontFamily: T.fontSerif, fontSize: '22px', color: tierColor(day.tier), width: '36px', textAlign: 'right', lineHeight: 1 }}>{day.score}</span>
                                    <span style={{ fontFamily: T.fontHead, fontSize: '8px', color: tierColor(day.tier), width: '76px', textAlign: 'right', letterSpacing: '1px' }}>{tierLabel(day.tier)}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel>
                        <PanelHeader title="Mission Brief" right="Live conditions" />
                        <div style={{ padding: '12px 14px' }}>
                            {[
                                `Geomagnetic conditions ${forecast.metadata.current_kp <= 3 ? 'stable' : 'elevated'} — Kp ${forecast.metadata.current_kp}, ${forecast.metadata.current_kp <= 4 ? 'below' : 'above'} alert threshold`,
                                `Cloud cover currently ${forecast.metadata.current_clouds}% — ${forecast.metadata.current_clouds < 30 ? 'clear skies, optimal for observation' : forecast.metadata.current_clouds < 60 ? 'partial cloud cover, conditions marginal' : 'heavy cloud cover, observation not recommended'}`,
                                forecast.next_optimal_window ? `Next optimal window: score ${forecast.next_optimal_window.score}/100 — elevation ${forecast.next_optimal_window.elevation.toFixed(1)}°, clouds ${forecast.next_optimal_window.clouds}%` : 'No high-scoring window detected in the next 72 hours',
                                clearestDay ? `Clearest upcoming day: ${clearestDay.day_name} (${clearestDay.clouds}% cloud cover, score ${clearestDay.score})` : '',
                                highestKpDay ? `Peak geomagnetic activity forecast: Kp ${highestKpDay.kp} on ${highestKpDay.day_name} — plan around this window` : '',
                                `7-day GO windows: ${forecast.weekly_7d.filter(d => d.tier === 'GREEN').length} of 7 days suitable for operations`,
                            ].filter(Boolean).map((line, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', padding: '5px 0', borderBottom: `1px solid ${T.border}`, fontFamily: T.fontBody, fontSize: '12px', color: T.textSec, lineHeight: '1.5' }}>
                                    <span style={{ color: T.greenDim, flexShrink: 0 }}>▸</span>{line}
                                </div>
                            ))}
                            {forecast.next_optimal_window && (
                                <div style={{ marginTop: '12px', border: `1px solid ${T.greenBorder}`, background: T.greenBg, padding: '10px 12px' }}>
                                    <div style={{ fontFamily: T.fontHead, fontSize: '8px', color: T.greenDim, letterSpacing: '2px', marginBottom: '5px' }}>RECOMMENDATION</div>
                                    <div style={{ fontFamily: T.fontBody, fontSize: '12px', color: T.textPrimary }}>
                                        Primary window: {forecast.next_optimal_window.hour || forecast.next_optimal_window.day_name}
                                        {forecast.next_optimal_window.pass_time ? ` · ISS pass ${forecast.next_optimal_window.pass_time}` : ''}
                                    </div>
                                </div>
                            )}
                            <div style={{ fontFamily: T.fontBody, fontSize: '9px', color: T.textMuted, marginTop: '10px', paddingTop: '8px', borderTop: `1px solid ${T.border}` }}>
                                Sources: <span style={{ color: T.textSec }}>NOAA SWPC</span> · <span style={{ color: T.textSec }}>Open-Meteo</span> · <span style={{ color: T.textSec }}>N2YO</span>
                            </div>
                        </div>
                    </Panel>
                </div>

                {/* Earth + Space conditions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Panel>
                        <PanelHeader title="Earth Conditions" />
                        <div style={{ padding: '10px 14px' }}>
                            <CondRow label="Cloud Cover" value={`${forecast.metadata.current_clouds}%`} valueColor={forecast.metadata.current_clouds < 30 ? T.green : forecast.metadata.current_clouds < 60 ? T.yellow : T.red} />
                            <CondRow label="Visibility" value={forecast.metadata.current_clouds < 30 ? 'Excellent' : forecast.metadata.current_clouds < 60 ? 'Good' : 'Poor'} />
                            <CondRow label="Sky Quality" value={forecast.metadata.current_clouds < 30 ? 'Clear' : forecast.metadata.current_clouds < 60 ? 'Partly cloudy' : 'Overcast'} />
                        </div>
                    </Panel>
                    <Panel>
                        <PanelHeader title="Space Conditions" />
                        <div style={{ padding: '10px 14px' }}>
                            <CondRow label="Kp Index" value={`${forecast.metadata.current_kp} — ${forecast.metadata.current_kp <= 3 ? 'Low' : forecast.metadata.current_kp <= 5 ? 'Moderate' : 'High'}`} valueColor={forecast.metadata.current_kp <= 3 ? T.green : forecast.metadata.current_kp <= 5 ? T.yellow : T.red} />
                            <CondRow label="Geomagnetic" value={forecast.metadata.current_kp <= 3 ? 'Stable' : 'Active'} valueColor={forecast.metadata.current_kp <= 3 ? T.green : T.yellow} />
                            <CondRow label="Auroral Activity" value={forecast.metadata.current_kp <= 3 ? 'Low' : forecast.metadata.current_kp <= 5 ? 'Moderate' : 'High'} />
                        </div>
                    </Panel>
                </div>

                {/* Readiness scale */}
                <Panel style={{ marginBottom: '14px' }}>
                    <PanelHeader title="Readiness Scale" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${T.border}` }}>
                        {[
                            { range: '80 – 100', tier: 'GREEN' as const, label: '■ GO', desc: 'Kp <4 · Clouds <30% · Elevation >50°' },
                            { range: '60 – 79', tier: 'YELLOW' as const, label: '◐ CAUTION', desc: 'Kp 4–6 · Clouds 30–70% · Elevation 30–50°' },
                            { range: '0 – 59', tier: 'RED' as const, label: '✕ NO-GO', desc: 'Kp >6 · Clouds >70% · Elevation <30°' },
                        ].map(({ range, tier, label, desc }, i) => (
                            <div key={tier} style={{ padding: '14px', borderRight: i < 2 ? `1px solid ${T.border}` : 'none', background: tierBg(tier) }}>
                                <div style={{ fontFamily: T.fontSerif, fontSize: '28px', color: tierColor(tier), marginBottom: '4px' }}>{range}</div>
                                <div style={{ fontFamily: T.fontHead, fontSize: '9px', color: tierColor(tier), letterSpacing: '1.5px', marginBottom: '6px' }}>{label}</div>
                                <div style={{ fontFamily: T.fontBody, fontSize: '11px', color: T.textMuted }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* 72-hour hourly grid */}
                <Panel style={{ marginBottom: '14px' }}>
                    <PanelHeader title="72-Hour Hourly Forecast" right="🛰 = ISS pass window" />
                    <div style={{ padding: '12px 14px' }}>
                        {(() => {
                            const byDay: Record<string, ForecastWindow[]> = {};
                            forecast.hourly_72h.forEach(w => {
                                const key = w.day || 'Unknown';
                                if (!byDay[key]) byDay[key] = [];
                                byDay[key].push(w);
                            });
                            return Object.entries(byDay).map(([day, windows]) => (
                                <div key={day} style={{ marginBottom: '12px' }}>
                                    <div style={{ fontFamily: T.fontHead, fontSize: '8px', color: T.textMuted, letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' }}>{day}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '4px' }}>
                                        {windows.map((w, i) => (
                                            <div key={i} style={{ border: `1px solid ${w.has_pass ? tierBorder(w.tier) : T.border}`, background: w.has_pass ? tierBg(w.tier) : T.bg, padding: '7px 4px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = w.has_pass ? tierBg(w.tier) : T.bgHover)}
                                                onMouseLeave={e => (e.currentTarget.style.background = w.has_pass ? tierBg(w.tier) : T.bg)}>
                                                <div style={{ fontFamily: T.fontBody, fontSize: '9px', color: T.textMuted, marginBottom: '2px' }}>{w.hour}</div>
                                                <div style={{ fontFamily: T.fontSerif, fontSize: '20px', color: tierColor(w.tier), lineHeight: 1, marginBottom: '2px' }}>{w.score}</div>
                                                {w.has_pass && <div style={{ fontSize: '10px', opacity: 0.7 }}>🛰</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </Panel>

                {/* Trend charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Panel>
                        <PanelHeader title="Kp Index Trend" right="7-day forecast" />
                        <div style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div>
                                    <div style={{ fontFamily: T.fontSerif, fontSize: '36px', color: forecast.metadata.current_kp <= 4 ? T.green : T.yellow, lineHeight: 1 }}>{forecast.metadata.current_kp}</div>
                                    <div style={{ fontFamily: T.fontBody, fontSize: '10px', color: T.textMuted, marginTop: '2px' }}>Current Kp index</div>
                                </div>
                                {highestKpDay && (
                                    <div style={{ fontFamily: T.fontBody, fontSize: '10px', color: T.yellow, background: T.yellowBg, border: `1px solid ${T.yellowBorder}`, padding: '5px 8px', textAlign: 'right' }}>
                                        ⚠ Peak Kp {highestKpDay.kp}<br /><span style={{ color: T.textMuted }}>{highestKpDay.day_name}</span>
                                    </div>
                                )}
                            </div>
                            <MiniAreaChart data={kpSeries} color={T.green} />
                        </div>
                    </Panel>
                    <Panel>
                        <PanelHeader title="Cloud Cover Trend" right="7-day forecast" />
                        <div style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div>
                                    <div style={{ fontFamily: T.fontSerif, fontSize: '36px', color: forecast.metadata.current_clouds < 30 ? T.green : forecast.metadata.current_clouds < 60 ? T.yellow : T.red, lineHeight: 1 }}>{forecast.metadata.current_clouds}%</div>
                                    <div style={{ fontFamily: T.fontBody, fontSize: '10px', color: T.textMuted, marginTop: '2px' }}>Current cloud cover</div>
                                </div>
                                {clearestDay && (
                                    <div style={{ fontFamily: T.fontBody, fontSize: '10px', color: T.green, background: T.greenBg, border: `1px solid ${T.greenBorder}`, padding: '5px 8px', textAlign: 'right' }}>
                                        ✓ Clearest: {clearestDay.day_name}<br /><span style={{ color: T.textMuted }}>{clearestDay.clouds}% clouds</span>
                                    </div>
                                )}
                            </div>
                            <MiniAreaChart data={cloudSeries} color={T.blue} />
                        </div>
                    </Panel>
                </div>

                {/* Alert thresholds */}
                <Panel style={{ marginBottom: '14px' }}>
                    <PanelHeader title="Alert Thresholds" right="Saved locally" />
                    <div style={{ padding: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                            {[
                                { label: 'Min Score', key: 'minScore' as const, value: alertThresholds.minScore },
                                { label: 'Max Kp Index', key: 'maxKp' as const, value: alertThresholds.maxKp },
                                { label: 'Max Cloud Cover %', key: 'maxClouds' as const, value: alertThresholds.maxClouds },
                            ].map(({ label, key, value }) => (
                                <div key={key}>
                                    <label style={{ fontFamily: T.fontHead, fontSize: '8px', color: T.textMuted, letterSpacing: '2px', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
                                    <input type="number" value={value} onChange={e => setAlertThresholds({ ...alertThresholds, [key]: parseInt(e.target.value) })}
                                        style={{ width: '100%', background: '#000000', border: `1px solid ${T.borderMed}`, color: T.textPrimary, fontFamily: T.fontSerif, fontSize: '28px', padding: '8px 10px', outline: 'none' }}
                                        onFocus={e => (e.currentTarget.style.borderColor = T.greenBorder)}
                                        onBlur={e => (e.currentTarget.style.borderColor = T.borderMed)} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button onClick={saveAlertSettings}
                                style={{ background: 'transparent', color: T.green, border: `1px solid ${T.green}`, fontFamily: T.fontHead, fontSize: '9px', letterSpacing: '2px', padding: '10px 22px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = '#000'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.green; }}>
                                {saved ? 'SAVED ✓' : 'SAVE SETTINGS'}
                            </button>
                            <button onClick={exportToCalendar}
                                style={{ background: 'transparent', color: T.textSec, border: `1px solid ${T.border}`, fontFamily: T.fontBody, fontSize: '11px', padding: '10px 18px', cursor: 'pointer', letterSpacing: '0.5px' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderMed)}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                                ↓ Export .ICS Calendar
                            </button>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: T.fontBody, fontSize: '11px', color: T.textMuted, cursor: 'pointer' }}>
                                <input type="checkbox" checked={alertsEnabled} onChange={e => setAlertsEnabled(e.target.checked)} style={{ width: '14px', height: '14px' }} />
                                In-app notifications
                            </label>
                        </div>
                    </div>
                </Panel>

            </div>
        </div>
    );
}