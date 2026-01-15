'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Stars } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import LocationSearch from '../LocationSearch'
import LocationMarker from '../LocationMarker'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

// Space Weather Component
function SpaceWeather() {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://services.swpc.noaa.gov/products/noaa-scales.json')
        const data = await response.json()
        setWeather(data)
      } catch (error) {
        console.error('Error fetching space weather:', error)
      }
    }
    fetchWeather()
    const interval = setInterval(fetchWeather, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (!weather) return null

  const currentConditions = weather[0] || {}

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '300px'
    }}>
      <div style={{ fontSize: '12px', color: '#22d3ee', marginBottom: '12px', letterSpacing: '2px' }}>
        SPACE WEATHER
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Solar Radiation</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            S{currentConditions['S']?.Scale || 0}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Radio Blackout</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            R{currentConditions['R']?.Scale || 0}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Geomagnetic Storm</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            G{currentConditions['G']?.Scale || 0}
          </span>
        </div>
      </div>
    </div>
  )
}

// Earth Weather Component
function EarthWeather({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover`
        )
        const data = await response.json()
        setWeather(data.current)
      } catch (error) {
        console.error('Error fetching weather:', error)
      }
    }
    fetchWeather()
  }, [latitude, longitude])

  if (!weather) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '360px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '300px'
    }}>
      <div style={{ fontSize: '12px', color: '#22d3ee', marginBottom: '12px', letterSpacing: '2px' }}>
        EARTH WEATHER
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Temperature</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            {weather.temperature_2m}°C
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Humidity</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            {weather.relative_humidity_2m}%
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Wind Speed</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            {weather.wind_speed_10m} km/h
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Cloud Cover</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>
            {weather.cloud_cover}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Mission Readiness Component
function MissionReadiness({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [readiness, setReadiness] = useState<number>(0)

  useEffect(() => {
    const calculateReadiness = async () => {
      try {
        // Fetch weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,wind_speed_10m`
        )
        const weather = await weatherRes.json()

        // Calculate score based on conditions
        let score = 100

        // Cloud cover penalty
        const clouds = weather.current.cloud_cover
        if (clouds > 50) score -= (clouds - 50) * 0.5

        // Wind speed penalty
        const wind = weather.current.wind_speed_10m
        if (wind > 20) score -= (wind - 20) * 2

        // Time of day bonus (prefer night for observations)
        const hour = new Date().getHours()
        if (hour >= 20 || hour <= 6) score += 10

        setReadiness(Math.max(0, Math.min(100, Math.round(score))))
      } catch (error) {
        console.error('Error calculating readiness:', error)
        setReadiness(50)
      }
    }

    calculateReadiness()
    const interval = setInterval(calculateReadiness, 60000) // 1 minute
    return () => clearInterval(interval)
  }, [latitude, longitude])

  const getColor = () => {
    if (readiness >= 80) return '#22c55e'
    if (readiness >= 50) return '#eab308'
    return '#ef4444'
  }

  const getStatus = () => {
    if (readiness >= 80) return 'OPTIMAL'
    if (readiness >= 50) return 'ACCEPTABLE'
    return 'SUBOPTIMAL'
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${getColor()}`,
      borderRadius: '8px',
      padding: '20px',
      minWidth: '200px'
    }}>
      <div style={{ fontSize: '12px', color: '#22d3ee', marginBottom: '12px', letterSpacing: '2px' }}>
        MISSION READINESS
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          fontSize: '36px',
          color: getColor(),
          fontWeight: '800'
        }}>
          {readiness}
        </div>
        <div>
          <div style={{ fontSize: '14px', color: getColor(), fontWeight: '600' }}>
            {getStatus()}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
            Observation Conditions
          </div>
        </div>
      </div>
    </div>
  )
}

// System Status Component
function SystemStatus() {
  return (
    <div style={{
      position: 'fixed',
      top: '120px',
      left: '30px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '8px',
      padding: '15px 20px'
    }}>
      <div style={{ fontSize: '10px', color: '#22d3ee', marginBottom: '10px', letterSpacing: '2px' }}>
        SYSTEM STATUS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e'
          }} />
          <span style={{ fontSize: '11px', color: '#fff' }}>Space Weather (NOAA)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e'
          }} />
          <span style={{ fontSize: '11px', color: '#fff' }}>Earth Weather (Open-Meteo)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e'
          }} />
          <span style={{ fontSize: '11px', color: '#fff' }}>ISS Tracking (Live)</span>
        </div>
      </div>
    </div>
  )
}

function Earth() {
  const earthTexture = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
  )

  return (
    <Sphere args={[2.5, 64, 64]}>
      <meshStandardMaterial
        map={earthTexture}
        roughness={0.8}
        metalness={0.2}
      />
    </Sphere>
  )
}

function ISS() {
  const issRef = useRef<THREE.Group>(null)
  const radius = 2.65
  const tilt = 0.25

  useFrame(({ clock }) => {
    if (issRef.current) {
      const t = clock.getElapsedTime() * 0.4
      issRef.current.position.x = Math.cos(t) * radius
      issRef.current.position.y = Math.sin(t) * tilt
      issRef.current.position.z = Math.sin(t) * radius
      issRef.current.rotation.y = t + Math.PI / 2
      issRef.current.rotation.z = 0.08
    }
  })

  return (
    <group ref={issRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.015]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.06]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.05]} />
        <meshStandardMaterial color="#dddddd" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[-0.04, -0.015, 0]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.9}
          roughness={0.1}
          emissive="#4488ff"
          emissiveIntensity={0.4}
        />
      </mesh>

      <group position={[-0.06, 0.045, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.1, 0.003]} />
          <meshStandardMaterial color="#1a3d6b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.151, 0.101, 0.002]} />
          <meshBasicMaterial color="#3a7dbb" wireframe />
        </mesh>
      </group>

      <group position={[0.06, 0.045, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.1, 0.003]} />
          <meshStandardMaterial color="#1a3d6b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.151, 0.101, 0.002]} />
          <meshBasicMaterial color="#3a7dbb" wireframe />
        </mesh>
      </group>

      <group position={[-0.06, -0.045, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.1, 0.003]} />
          <meshStandardMaterial color="#1a3d6b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.151, 0.101, 0.002]} />
          <meshBasicMaterial color="#3a7dbb" wireframe />
        </mesh>
      </group>

      <group position={[0.06, -0.045, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.1, 0.003]} />
          <meshStandardMaterial color="#1a3d6b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.151, 0.101, 0.002]} />
          <meshBasicMaterial color="#3a7dbb" wireframe />
        </mesh>
      </group>

      <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.003]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0, 0, -0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.003]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0.06, 0.025, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.03]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.6} />
      </mesh>

      <mesh position={[-0.06, 0.025, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.03]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.6} />
      </mesh>

      <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.012, 0.02]} />
        <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
      </mesh>

      <pointLight position={[0.06, 0, 0]} color="#00ff00" intensity={1} distance={0.3} />
      <pointLight position={[-0.06, 0, 0]} color="#ff0000" intensity={1} distance={0.3} />
      <pointLight position={[0, 0.04, 0]} color="#ffffff" intensity={0.8} distance={0.25} />

      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

function CameraController({ location, controlsRef }: { location: { latitude: number; longitude: number }, controlsRef: any }) {
  const { camera } = useThree()
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!controlsRef.current) return

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    controlsRef.current.autoRotate = false
    controlsRef.current.enabled = false

    const phi = (90 - location.latitude) * (Math.PI / 180)
    const theta = (location.longitude + 180) * (Math.PI / 180)
    const distance = 6

    const targetX = -(distance * Math.sin(phi) * Math.cos(theta))
    const targetZ = distance * Math.sin(phi) * Math.sin(theta)
    const targetY = distance * Math.cos(phi)

    const startPos = camera.position.clone()
    const endPos = new THREE.Vector3(targetX, targetY, targetZ)

    const duration = 2000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      camera.position.lerpVectors(startPos, endPos, eased)
      camera.lookAt(0, 0, 0)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        if (controlsRef.current) {
          controlsRef.current.enabled = true
          controlsRef.current.autoRotate = true
        }
        animationRef.current = null
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [location.latitude, location.longitude, camera, controlsRef])

  return null
}

export default function Home() {
  const controlsRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState({
    name: 'Lancaster, CA',
    latitude: 34.6868,
    longitude: -118.1542,
    displayName: 'Lancaster, California, USA'
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleLocationSelect = (newLocation: {
    name: string
    latitude: number
    longitude: number
    displayName: string
  }) => {
    setLocation(newLocation)
  }

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#22d3ee',
        fontSize: '14px',
        letterSpacing: '3px',
        fontWeight: '600'
      }}>
        <div style={{
          fontSize: '24px',
          marginBottom: '20px',
          letterSpacing: '4px'
        }}>
          ASTRALINK PROMETHEUS
        </div>
        <div style={{
          fontSize: '12px',
          color: '#888',
          letterSpacing: '2px'
        }}>
          INITIALIZING MISSION CONTROL SYSTEMS...
        </div>
        <div style={{
          marginTop: '30px',
          width: '200px',
          height: '2px',
          background: 'rgba(34, 211, 238, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '40%',
            background: '#22d3ee',
            animation: 'loading 2s ease-in-out infinite'
          }} />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(250%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      {/* Location Display */}
      <div style={{
        position: 'fixed',
        top: '30px',
        left: '30px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(34, 211, 238, 0.3)',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '300px'
      }}>
        <div style={{ fontSize: '12px', color: '#22d3ee', marginBottom: '8px', letterSpacing: '2px' }}>
          MISSION LOCATION
        </div>
        <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>
          {location.displayName}
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
          {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
        </div>
      </div>

      <SystemStatus />
      <SpaceWeather />
      <EarthWeather latitude={location.latitude} longitude={location.longitude} />
      <MissionReadiness latitude={location.latitude} longitude={location.longitude} />
      <LocationSearch onLocationSelect={handleLocationSelect} />

      {/* Navigation Links */}
      <Link
        href="/sky-view"
        style={{
          position: 'fixed',
          top: '30px',
          right: '30px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0',
          padding: '14px 28px',
          color: '#ffffff',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '1px',
          transition: 'all 0.3s ease',
          fontFamily: "'Helvetica Neue', Arial, sans-serif"
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
        SKY VIEW
      </Link>

      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '30px',
          right: '180px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0',
          padding: '14px 28px',
          color: '#ffffff',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '1px',
          transition: 'all 0.3s ease',
          fontFamily: "'Helvetica Neue', Arial, sans-serif"
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
        HOME
      </Link>

      <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-3, -2, -3]} intensity={0.6} color="#8888ff" />
        <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />

        <Earth />
        <LocationMarker
          latitude={location.latitude}
          longitude={location.longitude}
          earthRadius={2.5}
        />
        <ISS />

        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={false}
          minDistance={3.5}
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.25}
        />
        <CameraController location={location} controlsRef={controlsRef} />
      </Canvas>
    </div>
  )
}