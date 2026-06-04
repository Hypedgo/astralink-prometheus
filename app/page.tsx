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

        const stars = Array.from({ length: 1000 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.2,
            brightness: 0.4 + Math.random() * 0.6,
            twinkleSpeed: 0.3 + Math.random() * 0.7,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: Math.random() > 0.85 ? `${200 + Math.random() * 55},${200 + Math.random() * 55},255` : Math.random() > 0.7 ? `255,${220 + Math.random() * 35},${180 + Math.random() * 50}` : '255,255,255'
        }))

        let animFrame: number
        let t = 0

        const draw = () => {
            t += 0.008
            ctx.fillStyle = '#00000a'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Nebula clouds
            const nebulas = [
                { x: canvas.width * 0.15, y: canvas.height * 0.25, r: 350, color: '30, 80, 200' },
                { x: canvas.width * 0.75, y: canvas.height * 0.55, r: 280, color: '100, 40, 180' },
                { x: canvas.width * 0.45, y: canvas.height * 0.75, r: 220, color: '10, 140, 100' },
                { x: canvas.width * 0.85, y: canvas.height * 0.15, r: 180, color: '180, 60, 100' },
            ]
            nebulas.forEach(n => {
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
                grad.addColorStop(0, `rgba(${n.color}, 0.07)`)
                grad.addColorStop(0.5, `rgba(${n.color}, 0.03)`)
                grad.addColorStop(1, `rgba(${n.color}, 0)`)
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            })

            // Milky Way band
            const mwGrad = ctx.createLinearGradient(0, canvas.height * 0.2, canvas.width, canvas.height * 0.8)
            mwGrad.addColorStop(0, 'rgba(150,160,220,0)')
            mwGrad.addColorStop(0.3, 'rgba(150,160,220,0.04)')
            mwGrad.addColorStop(0.5, 'rgba(170,180,240,0.07)')
            mwGrad.addColorStop(0.7, 'rgba(150,160,220,0.04)')
            mwGrad.addColorStop(1, 'rgba(150,160,220,0)')
            ctx.fillStyle = mwGrad
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Stars
            stars.forEach(star => {
                const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * star.twinkleSpeed + star.twinkleOffset))
                const alpha = twinkle * star.brightness

                if (star.size > 1.4) {
                    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 5)
                    glow.addColorStop(0, `rgba(${star.color}, ${alpha * 0.4})`)
                    glow.addColorStop(1, 'transparent')
                    ctx.fillStyle = glow
                    ctx.beginPath()
                    ctx.arc(star.x, star.y, star.size * 5, 0, Math.PI * 2)
                    ctx.fill()
                }

                ctx.beginPath()
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${star.color}, ${alpha})`
                ctx.fill()
            })

            animFrame = requestAnimationFrame(draw)
        }

        draw()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
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

                    {/* Hero Section */}
                    <section style={{ background: 'transparent', minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                        <div className="container position-relative">
                            <div className="row align-items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                                <div className="col-lg-6 order-2 order-lg-1" data-aos="fade-right">
                                    <div style={{ fontSize: '12px', color: 'rgba(0, 255, 136, 0.7)', letterSpacing: '3px', marginBottom: '20px', fontWeight: '600', textTransform: 'uppercase' }}>Space Operations Platform</div>
                                    <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#ffffff', lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px' }}>
                                        Mission Intelligence<br />
                                        <span style={{ color: '#00ff88' }}>Redefined</span>
                                    </h1>
                                    <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.8', marginBottom: '40px', maxWidth: '500px' }}>
                                        Real-time satellite tracking, orbital forecasting, and space weather analysis for professional observation operations.
                                    </p>
                                    <Link href="/mission-control" style={{ display: 'inline-block', padding: '18px 50px', background: 'linear-gradient(135deg, #00ff88, #00cc66)', border: 'none', borderRadius: '8px', color: '#000000', fontSize: '14px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.3s', boxShadow: '0 10px 40px rgba(0, 255, 136, 0.3)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 255, 136, 0.5)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 255, 136, 0.3)'; }}>
                                        Launch Platform
                                    </Link>
                                </div>
                                <div className="col-lg-6 order-1 order-lg-2" data-aos="fade-left" data-aos-delay="200">
                                    <div style={{ position: 'relative', padding: '40px' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section style={{ background: 'rgba(0,0,0,0.6)', padding: '100px 0', borderTop: '1px solid rgba(0, 255, 136, 0.1)', position: 'relative', zIndex: 1 }}>
                        <div className="container">
                            <div className="row mb-5" data-aos="fade-up">
                                <div className="col-12 text-center">
                                    <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#ffffff', marginBottom: '20px' }}>Comprehensive Operations Suite</h2>
                                    <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '600px', margin: '0 auto' }}>Everything you need for satellite observation and mission planning</p>
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
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', transition: 'all 0.3s', opacity: 0.5, backdropFilter: 'blur(10px)' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛰️</div>
                                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Coming Soon</h3>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Advanced satellite operations, pass predictions, and mission planning tools</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section style={{ background: 'rgba(0,0,0,0.5)', padding: '100px 0', borderTop: '1px solid rgba(0,255,136,0.1)', position: 'relative', zIndex: 1 }}>
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

                    {/* Eye Opening Overlay */}
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