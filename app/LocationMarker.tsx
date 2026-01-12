'use client'

import { useRef } from 'react'
import * as THREE from 'three'

interface LocationMarkerProps {
    latitude: number
    longitude: number
    earthRadius: number
}

export default function LocationMarker({ latitude, longitude, earthRadius }: LocationMarkerProps) {
    const markerRef = useRef<THREE.Group>(null)

    // Convert lat/lon to 3D coordinates
    const phi = (90 - latitude) * (Math.PI / 180)
    const theta = (longitude + 180) * (Math.PI / 180)

    const x = -(earthRadius * Math.sin(phi) * Math.cos(theta))
    const z = earthRadius * Math.sin(phi) * Math.sin(theta)
    const y = earthRadius * Math.cos(phi)

    return (
        <group ref={markerRef} position={[x, y, z]}>
            {/* Pulsing marker pin */}
            <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={1.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Glowing ring around marker */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.08, 0.12, 32]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Tall beam pointing up */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.6]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Point light for glow */}
            <pointLight position={[0, 0.2, 0]} color="#00ffff" intensity={2} distance={1} />
        </group>
    )
}