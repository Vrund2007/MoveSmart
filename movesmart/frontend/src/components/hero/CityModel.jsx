// components/hero/CityModel.jsx
// Production 3D City Model component with dramatic 3D camera fly-through (position, angle, lookAt, and translation) scrubbed on scroll
import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

function CityScene({ onLoaded }) {
  const groupRef = useRef();
  const gltf = useGLTF('/model.glb');
  const { camera } = useThree();
  const initialized = useRef(false);

  // Dynamic Camera Target (lookAt) object animated by GSAP
  const cameraTarget = useRef({ x: 3.31, y: 1.27, z: -0.17 });

  useEffect(() => {
    if (initialized.current || !groupRef.current) return;

    const s = 0.00095;
    gltf.scene.scale.setScalar(s);
    gltf.scene.position.set(26 * s, 0, 2244 * s);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    camera.position.set(-6.90, 5.69, -20.51);
    camera.lookAt(cameraTarget.current.x, cameraTarget.current.y, cameraTarget.current.z);
    camera.updateProjectionMatrix();

    initialized.current = true;
    if (onLoaded) onLoaded();
  }, [gltf, camera, onLoaded]);

  // Master GSAP ScrollTrigger timeline scrubbing camera position, lookAt target, and 3D model position/angle
  useGSAP(() => {
    if (prefersReducedMotion || !groupRef.current || !camera) return;

    const target = cameraTarget.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
      },
    });

    // 0. Hero Resting State
    gsap.set(camera.position, { x: -6.90, y: 5.69, z: -20.51 });
    gsap.set(target, { x: 3.31, y: 1.27, z: -0.17 });
    gsap.set(groupRef.current.position, { x: 0, y: 0, z: 0 });
    gsap.set(groupRef.current.rotation, { y: 0, x: 0, z: 0 });

    // 1. Hero -> Demo Section (Cinematic wide angle lowering gently, subtle background city rotation)
    tl.to(camera.position, { x: -4.8, y: 4.5, z: -17.5, ease: 'sine.inOut' }, 0)
      .to(target, { x: 2.6, y: 1.1, z: -0.1, ease: 'sine.inOut' }, 0)
      .to(groupRef.current.position, { x: -1.0, y: -0.2, z: 0.8, ease: 'sine.inOut' }, 0)
      .to(groupRef.current.rotation, { y: 0.5, ease: 'sine.inOut' }, 0)

    // 2. Demo -> How It Works (Fly into street level buildings)
      .to(camera.position, { x: 3.5, y: 2.2, z: -7.5, ease: 'sine.inOut' }, 1)
      .to(target, { x: 1.0, y: 0.6, z: -0.8, ease: 'sine.inOut' }, 1)
      .to(groupRef.current.position, { x: -2.0, y: -0.4, z: 2.2, ease: 'sine.inOut' }, 1)
      .to(groupRef.current.rotation, { y: 1.2, ease: 'sine.inOut' }, 1)

    // 3. How It Works -> Choose Role (Pan around commercial towers)
      .to(camera.position, { x: 11.0, y: 3.8, z: -8.8, ease: 'sine.inOut' }, 2)
      .to(target, { x: 3.5, y: 1.3, z: 1.8, ease: 'sine.inOut' }, 2)
      .to(groupRef.current.position, { x: 2.2, y: 0.1, z: -1.2, ease: 'sine.inOut' }, 2)
      .to(groupRef.current.rotation, { y: 2.1, ease: 'sine.inOut' }, 2)

    // 4. Choose Role -> Horizontal Sideways Scroll (Smooth elevated vista)
      .to(camera.position, { x: 0.0, y: 15.0, z: -4.0, ease: 'sine.inOut' }, 3)
      .to(target, { x: 0.0, y: 0.5, z: 0.0, ease: 'sine.inOut' }, 3)
      .to(groupRef.current.position, { x: 0, y: 0, z: 0, ease: 'sine.inOut' }, 3)
      .to(groupRef.current.rotation, { y: 3.14, ease: 'sine.inOut' }, 3)

    // 5. Horizontal Scroll -> Verified Listings (Zoom closer to residential level)
      .to(camera.position, { x: -7.0, y: 3.0, z: -7.5, ease: 'sine.inOut' }, 4)
      .to(target, { x: -1.0, y: 1.2, z: -0.5, ease: 'sine.inOut' }, 4)
      .to(groupRef.current.position, { x: -1.5, y: -0.2, z: 1.2, ease: 'sine.inOut' }, 4)
      .to(groupRef.current.rotation, { y: 4.2, ease: 'sine.inOut' }, 4)

    // 6. Verified Listings -> Statistics & Final CTA (Dramatic wide-angle panorama sweep)
      .to(camera.position, { x: -10.5, y: 8.5, z: -22.0, ease: 'sine.inOut' }, 5)
      .to(target, { x: 2.5, y: 1.0, z: 0.0, ease: 'sine.inOut' }, 5)
      .to(groupRef.current.position, { x: 0, y: 0, z: 0, ease: 'sine.inOut' }, 5)
      .to(groupRef.current.rotation, { y: 5.5, ease: 'sine.inOut' }, 5);

    return () => tl.kill();
  }, { dependencies: [gltf] });

  // Frame loop setting camera lookAt every frame without overwriting GSAP's scroll scrub
  useFrame(() => {
    if (!camera || !cameraTarget.current) return;
    camera.lookAt(
      cameraTarget.current.x,
      cameraTarget.current.y,
      cameraTarget.current.z
    );
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function ModelErrorFallback({ error }) {
  // eslint-disable-next-line no-console
  console.error('[CityModel] GLB load error:', error);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-[#393E46] text-sm font-medium">City view unavailable</p>
    </div>
  );
}

class ModelErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    return this.state.hasError
      ? <ModelErrorFallback error={this.state.error} />
      : this.props.children;
  }
}

export default function CityModel({ onModelLoaded }) {
  return (
    <ModelErrorBoundary>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          shadows
          frameloop="always"
          camera={{
            position: [-6.90, 5.69, -20.51],
            fov: 40,
            near: 0.1,
            far: 500,
          }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={1.0} />
          <hemisphereLight skyColor="#FFFFFF" groundColor="#777777" intensity={0.75} />

          <directionalLight
            position={[18, 24, 14]}
            intensity={2.3}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={100}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <directionalLight position={[-15, 10, -12]} intensity={0.6} />

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.3}
            scale={28}
            blur={3}
            far={12}
            color="#222831"
          />

          <Suspense fallback={null}>
            <CityScene onLoaded={onModelLoaded} />
          </Suspense>
        </Canvas>
      </div>
    </ModelErrorBoundary>
  );
}

useGLTF.preload('/model.glb');
