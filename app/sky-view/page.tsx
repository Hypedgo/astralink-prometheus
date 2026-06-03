'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import NavBar from '../NavBar'

const API_BASE = 'https://astralink-prometheus-production.up.railway.app'

const STARS = [
    { ra: 0.0139, dec: 29.0906, mag: 2.06, color: '#fffacd', name: 'Alpheratz' },
    { ra: 0.7294, dec: -17.9869, mag: 3.27, color: '#fff8dc', name: '' },
    { ra: 1.0142, dec: 35.6206, mag: 2.27, color: '#fffacd', name: 'Caph' },
    { ra: 1.6283, dec: 15.1836, mag: 2.04, color: '#fff4e8', name: 'Hamal' },
    { ra: 2.1194, dec: -2.9775, mag: 2.53, color: '#fff8dc', name: 'Menkar' },
    { ra: 3.0886, dec: 4.0897, mag: 2.00, color: '#ffb347', name: 'Aldebaran' },
    { ra: 3.4053, dec: 49.8614, mag: 1.79, color: '#fff4e8', name: 'Mirfak' },
    { ra: 4.5989, dec: 16.5092, mag: 0.85, color: '#ff8c00', name: 'Aldebaran' },
    { ra: 5.2423, dec: -8.2017, mag: 0.13, color: '#9db4ff', name: 'Rigel' },
    { ra: 5.2781, dec: 45.9980, mag: 0.08, color: '#fff4e8', name: 'Capella' },
    { ra: 5.5056, dec: -0.2992, mag: 1.64, color: '#fff8dc', name: 'Alnilam' },
    { ra: 5.5367, dec: 7.4072, mag: 2.75, color: '#ffffff', name: 'Mintaka' },
    { ra: 5.9195, dec: 7.4070, mag: 0.50, color: '#ffb347', name: 'Betelgeuse' },
    { ra: 6.3992, dec: -52.6956, mag: -0.72, color: '#f8f7ff', name: 'Canopus' },
    { ra: 6.7525, dec: -16.7161, mag: -1.46, color: '#9db4ff', name: 'Sirius' },
    { ra: 7.6550, dec: 5.2250, mag: 0.38, color: '#fff4e8', name: 'Procyon' },
    { ra: 7.7553, dec: 28.0262, mag: 0.87, color: '#fff4e8', name: 'Pollux' },
    { ra: 10.1394, dec: 11.9672, mag: 1.35, color: '#ffb347', name: 'Regulus' },
    { ra: 11.8973, dec: 53.6948, mag: 1.77, color: '#fff4e8', name: 'Alioth' },
    { ra: 12.2648, dec: 57.0326, mag: 1.76, color: '#fff4e8', name: 'Dubhe' },
    { ra: 12.4394, dec: -63.0990, mag: 0.77, color: '#9db4ff', name: 'Acrux' },
    { ra: 13.3986, dec: -11.1614, mag: 2.61, color: '#fff8dc', name: 'Spica' },
    { ra: 13.7919, dec: 49.3133, mag: 2.37, color: '#ffffff', name: 'Alkaid' },
    { ra: 14.2610, dec: 19.1825, mag: -0.04, color: '#ffb347', name: 'Arcturus' },
    { ra: 14.6634, dec: -60.3736, mag: 0.61, color: '#9db4ff', name: 'Hadar' },
    { ra: 16.4902, dec: -26.4319, mag: 1.62, color: '#9db4ff', name: 'Antares' },
    { ra: 18.6156, dec: 38.7836, mag: 0.03, color: '#9db4ff', name: 'Vega' },
    { ra: 19.8464, dec: 8.8683, mag: 0.77, color: '#f0f8ff', name: 'Altair' },
    { ra: 20.6906, dec: 45.2804, mag: 1.25, color: '#f0f8ff', name: 'Deneb' },
    { ra: 22.1372, dec: -29.6219, mag: 1.16, color: '#fff8dc', name: 'Fomalhaut' },
]

const PLANETS = [
    { name: 'Venus', color: '#fffde7', size: 4, speed: 0.00015 },
    { name: 'Mars', color: '#ff6b35', size: 3, speed: 0.00008 },
    { name: 'Jupiter', color: '#ffd54f', size: 5, speed: 0.00003 },
    { name: 'Saturn', color: '#fff176', size: 4.5, speed: 0.00001 },
]

const CONSTELLATIONS = [
    { name: 'Orion', stars: [8, 10, 12, 11, 9], color: '#4fc3f7' },
    { name: 'Ursa Major', stars: [18, 19, 20, 17], color: '#81c784' },
    { name: 'Summer Triangle', stars: [26, 27, 28], color: '#ffb74d' },
]

function toRad(deg: number) { return deg * Math.PI / 180 }

function getLST(longitude: number) {
    const now = new Date()
    const jd = now.getTime() / 86400000 + 2440587.5
    const T = (jd - 2451545.0) / 36525
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T
    gmst = ((gmst % 360) + 360) % 360
    return (gmst + longitude) / 15
}

function starToXY(ra: number, dec: number, lat: number, lst: number, azOffset: number, altOffset: number, zoom: number, W: number, H: number) {
    const ha = (lst - ra) * 15
    const haR = toRad(ha)
    const decR = toRad(dec)
    const latR = toRad(lat)
    const sinAlt = Math.sin(decR) * Math.sin(latR) + Math.cos(decR) * Math.cos(latR) * Math.cos(haR)
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)))
    const cosAz = (Math.sin(decR) - Math.sin(alt) * Math.sin(latR)) / (Math.cos(alt) * Math.cos(latR) + 0.0001)
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz)))
    if (Math.sin(haR) > 0) az = 2 * Math.PI - az
    const altDeg = alt * 180 / Math.PI
    const azDeg = az * 180 / Math.PI
    const x = W / 2 + (azDeg - azOffset) * zoom
    const y = H / 2 - (altDeg - altOffset) * zoom
    return { x, y, alt: altDeg, visible: altDeg > -10 }
}

export default function SkyView() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [location, setLocation] = useState({ name: 'Lancaster, CA', latitude: 34.6868, longitude: -118.1542, displayName: 'Lancaster, California, USA' })
    const [isDay, setIsDay] = useState(false)
    const [zoom, setZoom] = useState(8)
    const [azOffset, setAzOffset] = useState(180)
    const [altOffset, setAltOffset] = useState(20)
    const [isDragging, setIsDragging] = useState(false)
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
    const [searchQuery, setSearchQuery] = useState('')
    const [issPos, setIssPos] = useState({ az: 0, alt: 0, visible: false })
    const [time, setTime] = useState(new Date())
    const [planetPositions, setPlanetPositions] = useState<any[]>([])

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const fetchISS = async () => {
            try {
                const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
                const data = await res.json()
                const alt = (data.latitude - location.latitude) * 0.5
                setIssPos({ az: ((data.longitude - location.longitude + 360) % 360), alt, visible: alt > -10 })
            } catch (e) { }
        }
        fetchISS()
        const interval = setInterval(fetchISS, 5000)
        return () => clearInterval(interval)
    }, [location])

    useEffect(() => {
        const now = Date.now() / 1000
        const positions = PLANETS.map((planet, i) => {
            const angle = (now * planet.speed * (i + 1)) % (2 * Math.PI)
            return { ...planet, ra: (angle * 12 / Math.PI + 6) % 24, dec: Math.sin(angle) * 23.5 }
        })
        setPlanetPositions(positions)
    }, [time])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const W = canvas.width
        const H = canvas.height
        const lst = getLST(location.longitude)
        const groundY = H / 2 + altOffset * zoom

        // Background
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
        if (isDay) {
            skyGrad.addColorStop(0, '#0d47a1')
            skyGrad.addColorStop(0.7, '#42a5f5')
            skyGrad.addColorStop(1, '#e3f2fd')
        } else {
            skyGrad.addColorStop(0, '#000005')
            skyGrad.addColorStop(0.7, '#050510')
            skyGrad.addColorStop(1, '#0a0a1a')
        }
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, W, H)

        // Ground
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, H)
        if (isDay) {
            groundGrad.addColorStop(0, '#388e3c')
            groundGrad.addColorStop(1, '#1b5e20')
        } else {
            groundGrad.addColorStop(0, '#1a2a0a')
            groundGrad.addColorStop(1, '#0d150a')
        }
        ctx.fillStyle = groundGrad
        if (groundY < H) ctx.fillRect(0, groundY, W, H - groundY)

        // Horizon line
        ctx.strokeStyle = isDay ? 'rgba(56,142,60,0.8)' : 'rgba(0,255,136,0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(W, groundY)
        ctx.stroke()

        // Cardinal directions
        const dirs = [
            { label: 'N', az: 0 }, { label: 'NE', az: 45 }, { label: 'E', az: 90 },
            { label: 'SE', az: 135 }, { label: 'S', az: 180 }, { label: 'SW', az: 225 },
            { label: 'W', az: 270 }, { label: 'NW', az: 315 }
        ]
        ctx.font = 'bold 13px monospace'
        dirs.forEach(d => {
            const x = W / 2 + (d.az - azOffset) * zoom
            if (x > 20 && x < W - 20) {
                ctx.fillStyle = isDay ? 'rgba(0,0,0,0.7)' : 'rgba(0,255,136,0.7)'
                ctx.fillText(d.label, x - 6, groundY - 10)
                ctx.strokeStyle = isDay ? 'rgba(0,0,0,0.3)' : 'rgba(0,255,136,0.3)'
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(x, groundY - 5)
                ctx.lineTo(x, groundY + 5)
                ctx.stroke()
            }
        })

        if (!isDay) {
            // Milky Way band
            const mwGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, H * 0.6)
            mwGrad.addColorStop(0, 'rgba(100,100,180,0)')
            mwGrad.addColorStop(0.4, 'rgba(150,150,210,0.05)')
            mwGrad.addColorStop(0.6, 'rgba(150,150,210,0.08)')
            mwGrad.addColorStop(1, 'rgba(100,100,180,0)')
            ctx.fillStyle = mwGrad
            ctx.fillRect(0, 0, W, groundY)

            // Constellation lines
            CONSTELLATIONS.forEach(constellation => {
                ctx.strokeStyle = constellation.color + '50'
                ctx.lineWidth = 0.8
                ctx.setLineDash([5, 5])
                for (let i = 0; i < constellation.stars.length - 1; i++) {
                    const s1 = STARS[constellation.stars[i]]
                    const s2 = STARS[constellation.stars[i + 1]]
                    if (!s1 || !s2) continue
                    const p1 = starToXY(s1.ra, s1.dec, location.latitude, lst, azOffset, altOffset, zoom, W, H)
                    const p2 = starToXY(s2.ra, s2.dec, location.latitude, lst, azOffset, altOffset, zoom, W, H)
                    if (p1.visible && p2.visible && p1.x > 0 && p1.x < W && p2.x > 0 && p2.x < W) {
                        ctx.beginPath()
                        ctx.moveTo(p1.x, p1.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }
                ctx.setLineDash([])
            })

            // Stars
            STARS.forEach(star => {
                const pos = starToXY(star.ra, star.dec, location.latitude, lst, azOffset, altOffset, zoom, W, H)
                if (!pos.visible || pos.x < -50 || pos.x > W + 50 || pos.y < -50 || pos.y > H + 50) return
                const size = Math.max(0.5, (6 - star.mag) * 0.6)
                const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 4)
                glow.addColorStop(0, star.color)
                glow.addColorStop(1, 'transparent')
                ctx.fillStyle = glow
                ctx.beginPath()
                ctx.arc(pos.x, pos.y, size * 4, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = '#ffffff'
                ctx.beginPath()
                ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
                ctx.fill()
                if (star.name && star.mag < 1.5 && pos.x > 0 && pos.x < W && pos.y > 0 && pos.y < H) {
                    ctx.fillStyle = 'rgba(180,220,255,0.9)'
                    ctx.font = '11px monospace'
                    ctx.fillText(star.name, pos.x + size + 5, pos.y - 3)
                }
            })

            // Planets
            planetPositions.forEach(planet => {
                const pos = starToXY(planet.ra, planet.dec, location.latitude, lst, azOffset, altOffset, zoom, W, H)
                if (!pos.visible || pos.x < 0 || pos.x > W || pos.y < 0 || pos.y > H) return
                const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, planet.size * 5)
                glow.addColorStop(0, planet.color)
                glow.addColorStop(1, 'transparent')
                ctx.fillStyle = glow
                ctx.beginPath()
                ctx.arc(pos.x, pos.y, planet.size * 5, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = planet.color
                ctx.beginPath()
                ctx.arc(pos.x, pos.y, planet.size, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = 'rgba(255,220,100,0.9)'
                ctx.font = 'bold 11px monospace'
                ctx.fillText(planet.name, pos.x + planet.size + 5, pos.y - 3)
            })
        } else {
            // Sun
            const sunDec = 23.5 * Math.sin(toRad((time.getMonth() / 12) * 360 - 80))
            const sunPos = starToXY(12, sunDec, location.latitude, lst, azOffset, altOffset, zoom, W, H)
            if (sunPos.x > 0 && sunPos.x < W && sunPos.y > 0 && sunPos.y < groundY) {
                const sunGlow = ctx.createRadialGradient(sunPos.x, sunPos.y, 0, sunPos.x, sunPos.y, 80)
                sunGlow.addColorStop(0, 'rgba(255,255,180,0.9)')
                sunGlow.addColorStop(0.4, 'rgba(255,200,50,0.4)')
                sunGlow.addColorStop(1, 'transparent')
                ctx.fillStyle = sunGlow
                ctx.beginPath()
                ctx.arc(sunPos.x, sunPos.y, 80, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = '#fff9c4'
                ctx.beginPath()
                ctx.arc(sunPos.x, sunPos.y, 22, 0, Math.PI * 2)
                ctx.fill()
                ctx.fillStyle = 'rgba(255,255,200,0.9)'
                ctx.font = 'bold 12px monospace'
                ctx.fillText('☀ Sun', sunPos.x + 26, sunPos.y + 4)
            }
        }

        // ISS
        if (issPos.visible) {
            const issX = W / 2 + (issPos.az - azOffset) * zoom
            const issY = H / 2 - (issPos.alt - altOffset) * zoom
            if (issX > 0 && issX < W && issY > 0 && issY < groundY) {
                ctx.fillStyle = '#00ff88'
                ctx.beginPath()
                ctx.arc(issX, issY, 5, 0, Math.PI * 2)
                ctx.fill()
                ctx.strokeStyle = '#00ff88'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(issX - 12, issY)
                ctx.lineTo(issX + 12, issY)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(issX, issY - 5)
                ctx.lineTo(issX, issY + 5)
                ctx.stroke()
                ctx.fillStyle = 'rgba(0,255,136,0.95)'
                ctx.font = 'bold 11px monospace'
                ctx.fillText('ISS 🛰', issX + 10, issY - 8)
                ctx.strokeStyle = 'rgba(0,255,136,0.25)'
                ctx.lineWidth = 1
                ctx.setLineDash([3, 6])
                ctx.beginPath()
                ctx.moveTo(issX - 50, issY + 5)
                ctx.lineTo(issX, issY)
                ctx.stroke()
                ctx.setLineDash([])
            }
        }

        // HUD
        const hudColor = isDay ? 'rgba(0,0,0,0.7)' : 'rgba(0,255,136,0.8)'
        ctx.font = '11px monospace'
        ctx.fillStyle = hudColor
        ctx.fillText(`📍 ${location.name}`, 16, H - 56)
        ctx.fillText(`🕐 ${time.toLocaleTimeString()}  🗓 ${time.toLocaleDateString()}`, 16, H - 40)
        ctx.fillText(`🌐 ${location.latitude.toFixed(2)}°N, ${location.longitude.toFixed(2)}°E`, 16, H - 24)
        ctx.fillText(`🔭 Zoom ${zoom}x  |  Az ${azOffset.toFixed(0)}°  |  Alt ${altOffset.toFixed(0)}°`, 16, H - 8)

    }, [location, isDay, zoom, azOffset, altOffset, issPos, time, planetPositions])

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setLastMouse({ x: e.clientX, y: e.clientY }) }
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        setAzOffset(prev => prev - (e.clientX - lastMouse.x) / zoom)
        setAltOffset(prev => prev + (e.clientY - lastMouse.y) / zoom)
        setLastMouse({ x: e.clientX, y: e.clientY })
    }
    const handleMouseUp = () => setIsDragging(false)

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        try {
            const res = await fetch(`${API_BASE}/api/geocode?location=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()
            if (!data.error) {
                setLocation({ name: searchQuery, latitude: data.latitude, longitude: data.longitude, displayName: data.display_name })
                setSearchQuery('')
            }
        } catch (e) { }
    }

    const btnStyle: React.CSSProperties = {
        width: '44px', height: '44px',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(0,217,255,0.4)',
        color: '#00d9ff', fontSize: '22px',
        cursor: 'pointer', fontFamily: 'monospace',
        borderRadius: '6px', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
    }

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', position: 'relative' }}>
            <NavBar />`n      <canvas
                ref={canvasRef}
                width={typeof window !== 'undefined' ? window.innerWidth : 1440}
                height={typeof window !== 'undefined' ? window.innerHeight : 900}
                style={{ display: 'block', cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Top Nav */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 100, borderBottom: '1px solid rgba(0,217,255,0.15)' }}>
                <div style={{ color: '#00d9ff', fontFamily: 'monospace', fontWeight: 700, fontSize: '15px', letterSpacing: '3px' }}>🔭 SKY VIEW — PLANETARIUM</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[{ href: '/mission-control', label: 'MISSION CONTROL' }, { href: '/planning', label: 'PLANNING' }, { href: '/satellites', label: 'SATELLITES' }].map(l => (
                        <Link key={l.href} href={l.href} style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', fontFamily: 'monospace', padding: '7px 14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', borderRadius: '3px' }}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Zoom + Reset controls */}
            <div style={{ position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100 }}>
                <button onClick={() => setZoom(z => Math.min(z + 2, 30))} style={btnStyle}>+</button>
                <button onClick={() => setZoom(z => Math.max(z - 2, 2))} style={btnStyle}>−</button>
                <button onClick={() => { setAzOffset(180); setAltOffset(20); setZoom(8) }} style={{ ...btnStyle, fontSize: '16px' }}>↺</button>
            </div>

            {/* Day/Night toggle */}
            <div style={{ position: 'fixed', top: '72px', right: '20px', zIndex: 100 }}>
                <button onClick={() => setIsDay(d => !d)} style={{ padding: '10px 18px', background: isDay ? 'rgba(255,193,7,0.15)' : 'rgba(0,0,50,0.85)', border: `1px solid ${isDay ? '#ffc107' : 'rgba(0,217,255,0.4)'}`, color: isDay ? '#ffc107' : '#00d9ff', fontSize: '13px', cursor: 'pointer', fontFamily: 'monospace', borderRadius: '4px', letterSpacing: '1px' }}>
                    {isDay ? '☀️ DAY MODE' : '🌙 NIGHT MODE'}
                </button>
            </div>

            {/* Location panel */}
            <div style={{ position: 'fixed', top: '72px', left: '20px', zIndex: 100, width: '300px' }}>
                <div style={{ background: 'rgba(0,0,0,0.88)', border: '1px solid rgba(0,217,255,0.3)', borderRadius: '8px', padding: '14px', backdropFilter: 'blur(10px)', marginBottom: '8px' }}>
                    <div style={{ color: '#00d9ff', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '6px' }}>📍 OBSERVATION POINT</div>
                    <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace', marginBottom: '10px', opacity: 0.85, lineHeight: 1.4 }}>{location.displayName}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                            type="text" value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            placeholder="e.g. Tokyo, Paris..."
                            style={{ flex: 1, background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,217,255,0.25)', borderRadius: '4px', padding: '7px 10px', color: '#fff', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
                        />
                        <button onClick={handleSearch} style={{ padding: '7px 12px', background: 'rgba(0,217,255,0.2)', border: '1px solid rgba(0,217,255,0.5)', color: '#00d9ff', fontSize: '12px', cursor: 'pointer', fontFamily: 'monospace', borderRadius: '4px' }}>GO</button>
                    </div>
                </div>

                {/* Legend */}
                <div style={{ background: 'rgba(0,0,0,0.88)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 14px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '8px' }}>LEGEND</div>
                    {[
                        { color: '#9db4ff', label: 'Blue-white star' },
                        { color: '#ffb347', label: 'Orange/red giant' },
                        { color: '#ffd54f', label: 'Planet' },
                        { color: '#00ff88', label: 'ISS (live, updates 5s)' },
                        { color: '#4fc3f7', label: 'Constellation line' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontFamily: 'monospace' }}>{item.label}</span>
                        </div>
                    ))}
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'monospace', marginTop: '8px', lineHeight: 1.5 }}>
                        🖱 Drag to look around<br />+ / − to zoom
                    </div>
                </div>
            </div>

            {/* ISS status */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100, background: 'rgba(0,0,0,0.88)', border: `1px solid ${issPos.visible ? '#00ff88' : 'rgba(255,255,255,0.15)'}`, borderRadius: '8px', padding: '12px 16px', backdropFilter: 'blur(10px)', minWidth: '200px' }}>
                <div style={{ color: '#00d9ff', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '6px' }}>🛰 ISS LIVE TRACKING</div>
                <div style={{ color: issPos.visible ? '#00ff88' : 'rgba(255,255,255,0.35)', fontSize: '12px', fontFamily: 'monospace', marginBottom: '4px' }}>
                    {issPos.visible ? '● VISIBLE OVERHEAD' : '● BELOW HORIZON'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'monospace' }}>
                    Az: {issPos.az.toFixed(1)}°  Alt: {issPos.alt.toFixed(1)}°
                </div>
            </div>
        </div>
    )
}
