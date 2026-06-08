'use client';

import NavBar from './NavBar'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

function SpinningGlobe() {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.002; });
    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2.2, 64, 64]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}

function SpinningSatellite() {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.004;
            groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
        }
    });
    return (
        <group ref={groupRef}>
            <mesh><boxGeometry args={[0.5, 0.12, 0.12]} /><meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} /></mesh>
            <mesh position={[0, 0.08, 0]}><boxGeometry args={[2.0, 0.6, 0.03]} /><meshStandardMaterial color="#1a3d6b" metalness={0.6} /></mesh>
            <mesh position={[0, -0.1, 0]}><boxGeometry args={[0.2, 0.1, 0.2]} /><meshStandardMaterial color="#cccccc" metalness={0.9} /></mesh>
        </group>
    );
}

function SpinningMoon() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.002; });
    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2.2, 64, 64]} />
            <meshStandardMaterial color="#999999" roughness={0.95} />
        </mesh>
    );
}

function SpinningPlanet() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.003; });
    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2.2, 64, 64]} />
            <meshStandardMaterial color="#1a3a5c" roughness={0.6} metalness={0.2} />
        </mesh>
    );
}

function Scene({ type }: { type: string }) {
    return (
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} style={{ background: 'transparent' }} gl={{ alpha: true }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
            <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#8888ff" />
            <Suspense fallback={null}>
                {type === 'globe' && <SpinningGlobe />}
                {type === 'satellite' && <SpinningSatellite />}
                {type === 'moon' && <SpinningMoon />}
                {type === 'plan' && <SpinningPlanet />}
            </Suspense>
        </Canvas>
    );
}

const destinations = [
    { name: 'Mission Control', tag: 'ORBITAL OPERATIONS', description: 'Real-time 3D orbital tracking, space weather monitoring, ISS pass predictions, and live mission readiness scoring. Your command center for everything in orbit.', type: 'globe', href: '/mission-control' },
    { name: 'Sky View', tag: 'STELLAR NAVIGATION', description: 'A live planetarium in your browser. Track stars, constellations, planets, and the ISS position in real time from your exact location on Earth.', type: 'moon', href: '/sky-view' },
    { name: 'Satellites', tag: 'SPACECRAFT TRACKING', description: 'Track active satellites in orbit. View pass predictions, orbital data, and real-time positions for a growing catalog of spacecraft.', type: 'satellite', href: '/satellites' },
    { name: 'Planning', tag: 'MISSION PLANNING', description: 'Plan your observation sessions. Get optimal viewing windows, weather forecasts, and mission readiness scores for upcoming ISS passes.', type: 'plan', href: '/planning' },
];

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (heroVideoRef.current) heroVideoRef.current.play().catch(() => { });
    }, []);

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const videoOpacity = Math.max(0, 1 - scrollY / (vh * 0.5));
    const textOpacity = Math.max(0, 1 - scrollY / (vh * 0.25));
    const section2Opacity = Math.min(1, Math.max(0, (scrollY - vh * 0.4) / (vh * 0.3)));
    const section2FadeOut = Math.max(0, 1 - (scrollY - vh * 1.2) / (vh * 0.3));
    const section3Opacity = Math.min(1, Math.max(0, (scrollY - vh * 1.8) / (vh * 0.3)));
    const section3FadeOut = Math.max(0, 1 - (scrollY - vh * 2.8) / (vh * 0.3));
    const section4Opacity = Math.min(1, Math.max(0, (scrollY - vh * 3.2) / (vh * 0.3)));

    const dest = destinations[activeIndex];

    return (
        <div style={{ background: '#000000' }}>

            {/* SECTION 1 — Video hero */}
            <div style={{ height: '130vh', position: 'relative' }}>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, opacity: videoOpacity, transition: 'opacity 0.05s linear' }}>
                    <video ref={heroVideoRef} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                        <source src="/satellite-video.mp4" type="video/mp4" />
                    </video>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)' }}></div>
                </div>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}><NavBar /></div>
                <div style={{ position: 'fixed', bottom: '80px', left: '60px', zIndex: 50, opacity: textOpacity, transition: 'opacity 0.05s linear', pointerEvents: 'none' }}>
                    <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '44px', color: '#ffffff', margin: 0, lineHeight: '1.25', maxWidth: '580px', textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}>
                        An updated intelligence<br />for Earth and Space.
                    </p>
                </div>
            </div>

            {/* SECTION 2 — What Is AstraLink */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: Math.min(section2Opacity, section2FadeOut), transition: 'opacity 0.1s linear', overflow: 'hidden' }}>
                <div style={{ width: '50%', padding: '100px 60px 100px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '56px', fontWeight: '700', color: '#ffffff', margin: '0 0 32px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>What Is AstraLink?</h1>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.8' }}>
                        AstraLink is an aerospace intelligence platform that combines real world space and earth data, AI, and visualization into one single mission support system. What would usually only be available to experts in aerospace or aviation is now available to you with a matter of a few clicks. Jeremiah 33:3
                    </p>
                </div>
                <div style={{ width: '50%', height: '100vh', position: 'relative', flexShrink: 0 }}>
                    <Image src="/what-is-astralink.jpg" alt="What Is AstraLink" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>

            {/* SPACER */}
            <div style={{ height: '40vh', background: '#000000', position: 'relative', zIndex: 20 }}></div>

            {/* SECTION 3 — The Goal */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: Math.min(section3Opacity, section3FadeOut), transition: 'opacity 0.1s linear', overflow: 'hidden' }}>
                <div style={{ width: '50%', padding: '100px 60px 100px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '56px', fontWeight: '700', color: '#ffffff', margin: '0 0 32px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>The Goal?</h1>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.8' }}>
                        The goal is to provide an interactive mission control system for all. I don't want to gatekeep access or knowledge to only experts but make it available for everyone. The site started off as just an idea of trying to see if I can make a mission brief system for pilots to see if conditions are good enough to fly through. Then the site just took on a life of its own. I will still continue to add and refine things every chance I get. Proverbs 9:10
                    </p>
                </div>
                <div style={{ width: '50%', height: '100vh', position: 'relative', flexShrink: 0, opacity: section3Opacity, transition: 'opacity 0.3s linear' }}>
                    <Image src="/child-aerospace.jpg" alt="The Goal" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>

            {/* SPACER */}
            <div style={{ height: '40vh', background: '#000000', position: 'relative', zIndex: 20 }}></div>

            {/* SECTION 4 — Choose Your Destination */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, opacity: section4Opacity, transition: 'opacity 0.1s linear' }}>

                {/* Scanline overlay for video game feel */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.015) 2px, rgba(0,255,136,0.015) 4px)', pointerEvents: 'none', zIndex: 1 }}></div>

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ fontSize: '11px', letterSpacing: '6px', color: '#00ff88', fontFamily: 'monospace', marginBottom: '12px' }}>SELECT MISSION MODULE</div>
                        <h1 style={{ fontFamily: '"Audiowide", cursive', fontSize: '38px', color: '#ffffff', margin: 0, letterSpacing: '3px' }}>
                            CHOOSE YOUR DESTINATION
                        </h1>
                    </div>

                    {/* Main area */}
                    <div style={{ width: '100%', maxWidth: '1300px', display: 'flex', alignItems: 'center', gap: '20px' }}>

                        {/* Left Arrow */}
                        <button onClick={() => setActiveIndex((activeIndex - 1 + destinations.length) % destinations.length)}
                            style={{ background: 'none', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '2px', width: '48px', height: '48px', color: '#00ff88', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', fontFamily: 'monospace' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.1)'; e.currentTarget.style.borderColor = '#00ff88'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; }}>
                            ‹
                        </button>

                        {/* Card */}
                        <div style={{ flex: 1, position: 'relative', height: '75vh', display: 'flex', flexDirection: 'row', background: 'rgba(0,10,5,0.8)', overflow: 'hidden' }}>

                            {/* Corner brackets */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '50px', height: '50px', borderTop: '2px solid #00ff88', borderLeft: '2px solid #00ff88', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '50px', height: '50px', borderTop: '2px solid #00ff88', borderRight: '2px solid #00ff88', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '50px', height: '50px', borderBottom: '2px solid #00ff88', borderLeft: '2px solid #00ff88', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '50px', height: '50px', borderBottom: '2px solid #00ff88', borderRight: '2px solid #00ff88', zIndex: 10 }}></div>

                            {/* Corner dots */}
                            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', zIndex: 10 }}></div>

                            {/* Left — Text */}
                            <div style={{ width: '42%', padding: '60px 40px 60px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(0,255,136,0.1)' }}>
                                <div style={{ fontSize: '10px', letterSpacing: '5px', color: '#00ff88', marginBottom: '8px', fontFamily: 'monospace', opacity: 0.8 }}>
                                    {dest.tag}
                                </div>
                                <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', marginBottom: '24px', fontFamily: 'monospace' }}>
                                    MODULE {String(activeIndex + 1).padStart(2, '0')} OF {String(destinations.length).padStart(2, '0')}
                                </div>
                                <h2 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '44px', fontWeight: '700', color: '#ffffff', margin: '0 0 28px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>
                                    {dest.name}
                                </h2>
                                <div style={{ width: '40px', height: '2px', background: '#00ff88', marginBottom: '28px' }}></div>
                                <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8', margin: '0 0 48px 0' }}>
                                    {dest.description}
                                </p>
                                <Link href={dest.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 28px', background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', fontSize: '12px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', textDecoration: 'none', width: 'fit-content', transition: 'all 0.2s', fontFamily: 'monospace' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#00ff88'; e.currentTarget.style.color = '#000000'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00ff88'; }}>
                                    INITIATE LAUNCH <span style={{ fontSize: '16px' }}>→</span>
                                </Link>
                            </div>

                            {/* Right — 3D Visual */}
                            <div style={{ width: '58%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Glow behind globe */}
                                <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                                <Scene type={dest.type} />
                            </div>

                        </div>

                        {/* Right Arrow */}
                        <button onClick={() => setActiveIndex((activeIndex + 1) % destinations.length)}
                            style={{ background: 'none', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '2px', width: '48px', height: '48px', color: '#00ff88', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', fontFamily: 'monospace' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.1)'; e.currentTarget.style.borderColor = '#00ff88'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; }}>
                            ›
                        </button>

                    </div>

                    {/* Dots */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '28px', alignItems: 'center' }}>
                        {destinations.map((_, i) => (
                            <button key={i} onClick={() => setActiveIndex(i)}
                                style={{ width: i === activeIndex ? '28px' : '8px', height: '4px', borderRadius: '2px', background: i === activeIndex ? '#00ff88' : 'rgba(0,255,136,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}>
                            </button>
                        ))}
                    </div>

                </div>
            </div>

        </div>
    );
}