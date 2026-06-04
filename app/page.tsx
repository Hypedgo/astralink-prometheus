'use client';

import Link from 'next/link';
import NavBar from './NavBar'
import { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
    const [stage, setStage] = useState<'enter' | 'video' | 'white' | 'opening'>(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('visited')) {
            return 'opening';
        }
        return 'enter';
    });
    const [eyeOpen, setEyeOpen] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            AOS.init({ duration: 1000, once: true });
        }
    }, []);

    const handleEnter = () => {
        sessionStorage.setItem('visited', 'true');
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
        sessionStorage.setItem('visited', 'true');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1.5;
            setEyeOpen(progress);
            if (progress >= 100) clearInterval(interval);
        }, 30);
    };

    return (
        <>
            {/* STAGE 1: ENTER Screen */}
            {stage === 'enter' && (
                <div onClick={handleEnter} style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ color: '#ffffff', fontSize: '48px', letterSpacing: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '40px' }}>ASTRALINK</div>
                    <div style={{ fontSize: '24px', letterSpacing: '8px', fontWeight: '300', color: '#00ff88', textTransform: 'uppercase', animation: 'pulse 2s ease-in-out infinite' }}>Enter</div>
                </div>
            )}

            {/* STAGE 2: VIDEO */}
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

            {/* STAGE 3: WHITE FLASH */}
            {stage === 'white' && <div style={{ position: 'fixed', inset: 0, background: '#ffffff', zIndex: 9999 }}></div>}

            {/* STAGE 4: Main Site */}
            {stage === 'opening' && (
                <>
                    <NavBar />

                    {/* Hero Section */}
                    <section style={{ background: '#000000', minHeight: '100vh', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)`, backgroundSize: '50px 50px' }}></div>
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
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                                        <img src="/api/placeholder/600/600" alt="Satellite Visualization" style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 2 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section style={{ background: '#000000', padding: '100px 0', borderTop: '1px solid rgba(0, 255, 136, 0.1)' }}>
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
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', transition: 'all 0.3s', cursor: 'pointer' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.transform = 'translateY(-8px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</div>
                                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Mission Control</h3>
                                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Real-time 3D orbital tracking, space weather monitoring, and live telemetry dashboard with mission readiness scoring</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                                    <Link href="/sky-view" style={{ textDecoration: 'none' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', transition: 'all 0.3s', cursor: 'pointer' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.transform = 'translateY(-8px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌌</div>
                                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Sky View</h3>
                                            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Live ISS tracking, 27-star catalog, constellation lines, meteor showers, aurora effects, and telescopic zoom mode</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '16px', padding: '40px', height: '100%', transition: 'all 0.3s', opacity: 0.5 }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛰️</div>
                                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#00ff88', marginBottom: '15px' }}>Coming Soon</h3>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>Advanced satellite operations, pass predictions, and mission planning tools</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0) 100%)', padding: '100px 0', borderTop: '1px solid rgba(0,255,136,0.1)' }}>
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