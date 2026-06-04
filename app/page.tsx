'use client';

import Link from 'next/link';
import NavBar from './NavBar'
import { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function SpaceBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let cx = canvas.width / 2
        let cy = canvas.height / 2

        // Nebula cloud definitions — static but animating opacity
        const nebulas = [
            { x: 0.15, y: 0.35, rx: 0.28, ry: 0.35, color: '40,80,200', opacity: 0.18, phase: 0 },
            { x: 0.75, y: 0.2, rx: 0.32, ry: 0.28, color: '80,40,180', opacity: 0.16, phase: 1.2 },
            { x: 0.85, y: 0.55, rx: 0.25, ry: 0.3, color: '30,60,220', opacity: 0.14, phase: 2.4 },
            { x: 0.4, y: 0.7, rx: 0.2, ry: 0.22, color: '120,30,160', opacity: 0.12, phase: 0.8 },
            { x: 0.6, y: 0.1, rx: 0.22, ry: 0.18, color: '60,90,210', opacity: 0.13, phase: 1.8 },
        ]

        const stars = Array.from({ length: 900 }, () => {
            const angle = Math.random() * Math.PI * 2
            const dist = 5 + Math.random() * Math.max(canvas.width, canvas.height) * 0.7
            return {
                angle,
                dist,
                speed: 0.4 + Math.random() * 1.2,
                size: 0.3 + Math.random() * 2,
                opacity: 0.5 + Math.random() * 0.5,
                color: Math.random() > 0.9 ? '180,200,255' : Math.random() > 0.8 ? '255,220,180' : '255,255,255'
            }
        })


        const shootingStars: { x: number, y: number, vx: number, vy: number, len: number, life: number, maxLife: number }[] = []
        let shootTimer = 0
        let animFrame: number
        let t = 0

        const spawnShoot = () => {
            const angle = Math.random() * Math.PI * 2
            shootingStars.push({
                x: cx + Math.cos(angle) * 80,
                y: cy + Math.sin(angle) * 80,
                vx: Math.cos(angle) * 18,
                vy: Math.sin(angle) * 18,
                len: 120 + Math.random() * 80,
                life: 0,
                maxLife: 25 + Math.random() * 15,
            })
        }

        const drawCrossStar = (x: number, y: number, size: number, alpha: number) => {
            const arms = [
                [0, -1], [0, 1], [-1, 0], [1, 0],
                [-0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [0.5, -0.5]
            ]
            arms.forEach(([dx, dy], i) => {
                const len = i < 4 ? size * 6 : size * 3
                const grad = ctx.createLinearGradient(x, y, x + dx * len, y + dy * len)
                grad.addColorStop(0, `rgba(255,255,255,${alpha})`)
                grad.addColorStop(1, 'rgba(255,255,255,0)')
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(x + dx * len, y + dy * len)
                ctx.strokeStyle = grad
                ctx.lineWidth = i < 4 ? 1.5 : 0.8
                ctx.stroke()
            })
            const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 8)
            glow.addColorStop(0, `rgba(200,220,255,${alpha * 0.8})`)
            glow.addColorStop(0.3, `rgba(150,180,255,${alpha * 0.3})`)
            glow.addColorStop(1, 'transparent')
            ctx.fillStyle = glow
            ctx.beginPath()
            ctx.arc(x, y, size * 8, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,255,${alpha})`
            ctx.fill()
        }

        const draw = () => {
            t += 0.008
            shootTimer++

            // Deep dark space base
            ctx.fillStyle = '#00000f'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw nebula clouds
            nebulas.forEach(n => {
                const pulse = 0.85 + 0.15 * Math.sin(t * 0.4 + n.phase)
                const nx = n.x * canvas.width
                const ny = n.y * canvas.height
                const rx = n.rx * canvas.width
                const ry = n.ry * canvas.height

                // Multi-layer blob for each nebula
                for (let layer = 0; layer < 4; layer++) {
                    const lx = nx + (Math.sin(t * 0.1 + layer * 1.5) * rx * 0.08)
                    const ly = ny + (Math.cos(t * 0.12 + layer * 1.2) * ry * 0.08)
                    const lrx = rx * (0.5 + layer * 0.18)
                    const lry = ry * (0.5 + layer * 0.15)
                    const lalpha = (n.opacity * pulse) / (layer + 1)

                    ctx.save()
                    ctx.translate(lx, ly)
                    ctx.scale(1, lry / lrx)
                    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, lrx)
                    grad.addColorStop(0, `rgba(${n.color},${lalpha})`)
                    grad.addColorStop(0.4, `rgba(${n.color},${lalpha * 0.6})`)
                    grad.addColorStop(0.7, `rgba(${n.color},${lalpha * 0.2})`)
                    grad.addColorStop(1, `rgba(${n.color},0)`)
                    ctx.fillStyle = grad
                    ctx.beginPath()
                    ctx.arc(0, 0, lrx, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.restore()
                }
            })

            // Vanishing point — subtle center glow
            const vp = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.4)
            vp.addColorStop(0, 'rgba(5,5,20,0.5)')
            vp.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = vp
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Moving stars flying toward viewer
            stars.forEach(s => {
                s.dist += s.speed
                const sx = cx + Math.cos(s.angle) * s.dist
                const sy = cy + Math.sin(s.angle) * s.dist

                if (sx < -20 || sx > canvas.width + 20 || sy < -20 || sy > canvas.height + 20) {
                    s.dist = 5 + Math.random() * 30
                    s.angle = Math.random() * Math.PI * 2
                    s.speed = 1.2 + Math.random() * 3.5
                    return
                }

                const maxDist = Math.max(canvas.width, canvas.height) * 0.7
                const proximity = Math.min(1, s.dist / maxDist)
                const size = s.size * (0.1 + proximity * 2)
                const alpha = s.opacity * Math.min(1, proximity * 3)

                if (s.speed > 2 && proximity > 0.15) {
                    const trailLen = s.speed * proximity * 10
                    const tx = cx + Math.cos(s.angle) * (s.dist - trailLen)
                    const ty = cy + Math.sin(s.angle) * (s.dist - trailLen)
                    const grad = ctx.createLinearGradient(sx, sy, tx, ty)
                    grad.addColorStop(0, `rgba(${s.color},${alpha * 0.9})`)
                    grad.addColorStop(1, `rgba(${s.color},0)`)
                    ctx.beginPath()
                    ctx.moveTo(sx, sy)
                    ctx.lineTo(tx, ty)
                    ctx.strokeStyle = grad
                    ctx.lineWidth = Math.max(0.3, size * 0.5)
                    ctx.stroke()
                }

                if (size > 1.2) {
                    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 4)
                    glow.addColorStop(0, `rgba(${s.color},${alpha * 0.6})`)
                    glow.addColorStop(1, 'transparent')
                    ctx.fillStyle = glow
                    ctx.beginPath()
                    ctx.arc(sx, sy, size * 4, 0, Math.PI * 2)
                    ctx.fill()
                }

                ctx.beginPath()
                ctx.arc(sx, sy, Math.max(0.2, size), 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${s.color},${alpha})`
                ctx.fill()
            })

            // Shooting stars
            if (shootTimer > 150 && Math.random() < 0.04) { spawnShoot(); shootTimer = 0 }
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i]
                ss.life++
                ss.x += ss.vx
                ss.y += ss.vy
                const p = ss.life / ss.maxLife
                const a = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7
                const steps = ss.len / 15
                const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * steps, ss.y - ss.vy * steps)
                grad.addColorStop(0, `rgba(255,255,255,${a})`)
                grad.addColorStop(1, 'rgba(255,255,255,0)')
                ctx.beginPath()
                ctx.moveTo(ss.x, ss.y)
                ctx.lineTo(ss.x - ss.vx * steps, ss.y - ss.vy * steps)
                ctx.strokeStyle = grad
                ctx.lineWidth = 1.8
                ctx.stroke()
                if (ss.life >= ss.maxLife) shootingStars.splice(i, 1)
            }

            animFrame = requestAnimationFrame(draw)
        }

        draw()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            cx = canvas.width / 2
            cy = canvas.height / 2
        }
        window.addEventListener('resize', handleResize)
        return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', handleResize) }
    }, [])

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}

export default function LandingPage() {
    const [stage, setStage] = useState<'enter' | 'video' | 'white' | 'opening'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('visited')) return 'opening';
        return 'enter';
    });
    const [eyeOpen, setEyeOpen] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('visited')) return 100;
        return 0;
    });
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') AOS.init({ duration: 1000, once: true });
    }, []);

    const handleEnter = () => {
        localStorage.setItem('visited', 'true');
        setStage('video');
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.play().catch(() => {
                    if (videoRef.current) { videoRef.current.muted = true; videoRef.current.play(); }
                });
            }
        }, 100);
    };

    const handleSkipVideo = () => {
        if (videoRef.current) videoRef.current.pause();
        handleVideoEnd();
    };

    const handleVideoEnd = () => {
        setStage('white');
        setTimeout(() => { setStage('opening'); animateEyeOpen(); }, 300);
    };

    const animateEyeOpen = () => {
        localStorage.setItem('visited', 'true');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1.5;
            setEyeOpen(progress);
            if (progress >= 100) clearInterval(interval);
        }, 30);
    };

    return (
        <>
            {stage === 'enter' && (
                <div onClick={handleEnter} style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ color: '#ffffff', fontSize: '48px', letterSpacing: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '40px' }}>ASTRALINK</div>
                    <div style={{ fontSize: '24px', letterSpacing: '8px', fontWeight: '300', color: '#00ff88', textTransform: 'uppercase', animation: 'pulse 2s ease-in-out infinite' }}>Enter</div>
                </div>
            )}

            {stage === 'video' && (
                <div style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 9999 }}>
                    <video ref={videoRef} onEnded={handleVideoEnd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline>
                        <source src="/intro-video.mp4" type="video/mp4" />
                    </video>
                    <button onClick={handleSkipVideo} style={{ position: 'absolute', bottom: '40px', right: '40px', padding: '12px 24px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', zIndex: 60 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}>
                        Skip →
                    </button>
                </div>
            )}

            {stage === 'white' && <div style={{ position: 'fixed', inset: 0, background: '#ffffff', zIndex: 9999 }}></div>}

            {stage === 'opening' && (
                <>
                    <SpaceBackground />
                    <NavBar />

                    <section style={{ background: 'transparent', minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
                        <div className="container position-relative">
                            <div className="row align-items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                                <div className="col-lg-6 order-2 order-lg-1" data-aos="fade-right">
                                    <div style={{ fontSize: '12px', color: 'rgba(0,255,136,0.7)', letterSpacing: '3px', marginBottom: '20px', fontWeight: '600', textTransform: 'uppercase' }}>Space Operations Platform</div>
                                    <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#ffffff', lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px' }}>
                                        Mission Intelligence<br />
                                        <span style={{ color: '#00ff88' }}>Redefined</span>
                                    </h1>
                                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '40px', maxWidth: '500px' }}>
                                        Real-time satellite tracking, orbital forecasting, and space weather analysis for professional observation operations.
                                    </p>
                                    <Link href="/mission-control" style={{ display: 'inline-block', padding: '18px 50px', background: 'linear-gradient(135deg, #00ff88, #00cc66)', border: 'none', borderRadius: '8px', color: '#000000', fontSize: '14px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.3s', boxShadow: '0 10px 40px rgba(0,255,136,0.3)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,255,136,0.5)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,255,136,0.3)'; }}>
                                        Launch Platform
                                    </Link>
                                </div>
                                <div className="col-lg-6 order-1 order-lg-2" data-aos="fade-left" data-aos-delay="200">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                        <div style={{ width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ background: 'rgba(0,0,0,0.82)', padding: '100px 0', borderTop: '1px solid rgba(0,255,136,0.1)', position: 'relative', zIndex: 1 }}>
                        <div className="container">
                            <div className="row mb-5" data-aos="fade-up">
                                <div className="col-12 text-center">
                                    <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#ffffff', marginBottom: '20px' }}>Comprehensive Operations Suite</h2>
                                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto' }}>Everything you need for satellite observation and mission planning</p>
                                </div>
                            </div>
                            <div className="row g-4">
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
                                    <Link href="/mission-control" style={{ textDecoration: 'none' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', transition: 'all 0.3s', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.transform = 'translateY(-8px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</div>
                                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Mission Control</h3>
                                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Real-time 3D orbital tracking, space weather monitoring, and live telemetry dashboard with mission readiness scoring</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                                    <Link href="/sky-view" style={{ textDecoration: 'none' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', transition: 'all 0.3s', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.transform = 'translateY(-8px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌌</div>
                                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Sky View</h3>
                                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Live ISS tracking, 27-star catalog, constellation lines, meteor showers, aurora effects, and telescopic zoom mode</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', opacity: 0.5, backdropFilter: 'blur(10px)' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛰️</div>
                                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Coming Soon</h3>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Advanced satellite operations, pass predictions, and mission planning tools</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ background: 'rgba(0,0,0,0.82)', padding: '100px 0', borderTop: '1px solid rgba(0,255,136,0.1)', position: 'relative', zIndex: 1 }}>
                        <div className="container">
                            <div className="row g-4 text-center">
                                {[{ num: '4', label: 'Satellites Tracked' }, { num: '24/7', label: 'Real-Time Tracking' }, { num: '27', label: 'Star Catalog' }, { num: 'LIVE', label: 'Space Weather' }].map((stat, i) => (
                                    <div key={i} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={`${(i + 1) * 100}`}>
                                        <div style={{ fontSize: '64px', fontWeight: '900', color: '#00ff88', marginBottom: '10px' }}>{stat.num}</div>
                                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 85%, rgba(255,255,255,0.8) 95%, transparent 100%)', transform: `translateY(-${eyeOpen}%)`, transition: 'transform 0.05s ease-out', filter: 'blur(1px)' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #ffffff 0%, #ffffff 85%, rgba(255,255,255,0.8) 95%, transparent 100%)', transform: `translateY(${eyeOpen}%)`, transition: 'transform 0.05s ease-out', filter: 'blur(1px)' }}></div>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)', opacity: 1 - (eyeOpen / 100), transition: 'opacity 0.05s linear' }}></div>
                    </div>
                </>
            )}

            <style jsx>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </>
    );
}
