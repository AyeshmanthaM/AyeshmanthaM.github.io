import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const Maintenance: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const circuitBoardRef = useRef<THREE.Group | null>(null);
  const componentsRef = useRef<THREE.Mesh[]>([]);
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a0f);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Create circuit board
    const circuitBoard = new THREE.Group();
    circuitBoardRef.current = circuitBoard;
    scene.add(circuitBoard);

    // Base board
    const boardGeometry = new THREE.BoxGeometry(10, 6, 0.2);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.7,
      metalness: 0.3,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    circuitBoard.add(board);

    // Circuit traces
    const createTrace = (x: number, y: number, width: number, height: number, rotation = 0) => {
      const traceGeometry = new THREE.PlaneGeometry(width, height);
      const traceMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a86ff,
        emissive: 0x3a86ff,
        emissiveIntensity: 0.2,
        roughness: 0.5,
        metalness: 0.8,
      });
      const trace = new THREE.Mesh(traceGeometry, traceMaterial);
      trace.position.set(x, y, 0.11);
      trace.rotation.z = rotation;
      circuitBoard.add(trace);
      return trace;
    };

    // Create horizontal and vertical traces
    for (let i = -4; i <= 4; i += 2) {
      createTrace(i, 0, 0.1, 5);
      createTrace(0, i, 9, 0.1);
    }

    // Create diagonal traces
    createTrace(-3, 2, 3, 0.1, Math.PI / 4);
    createTrace(3, -2, 3, 0.1, Math.PI / 4);
    createTrace(-3, -2, 3, 0.1, -Math.PI / 4);
    createTrace(3, 2, 3, 0.1, -Math.PI / 4);

    // Create components
    const componentColors = [0xff5e5b, 0x39a0ed, 0x4ecdc4, 0xffbe0b, 0xfb6107];
    const componentPositions = [
      [-3, 2, 0.2],
      [3, 2, 0.2],
      [0, 0, 0.2],
      [-3, -2, 0.2],
      [3, -2, 0.2],
      [-2, 1, 0.2],
      [2, -1, 0.2],
      [-1, -2, 0.2],
      [1, 2, 0.2],
    ];

    componentPositions.forEach((pos, i) => {
      const componentGeometry = new THREE.BoxGeometry(
        0.4 + Math.random() * 0.3,
        0.4 + Math.random() * 0.3,
        0.2
      );
      const componentMaterial = new THREE.MeshStandardMaterial({
        color: componentColors[i % componentColors.length],
        emissive: componentColors[i % componentColors.length],
        emissiveIntensity: 0,
        roughness: 0.5,
        metalness: 0.8,
      });
      const component = new THREE.Mesh(componentGeometry, componentMaterial);
      component.position.set(pos[0], pos[1], pos[2]);
      circuitBoard.add(component);
      componentsRef.current.push(component);

      // Add point light for each component
      const light = new THREE.PointLight(
        componentColors[i % componentColors.length],
        0,
        3
      );
      light.position.set(pos[0], pos[1], pos[2] + 0.5);
      circuitBoard.add(light);
      lightsRef.current.push(light);
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation function
    const animate = () => {
      if (!circuitBoardRef.current) return;

      // Gently rotate the circuit board
      circuitBoardRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
      circuitBoardRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.1;

      // Pulse the components
      componentsRef.current.forEach((component, i) => {
        const material = component.material as THREE.MeshStandardMaterial;
        const pulseIntensity = (Math.sin(Date.now() * 0.001 + i) + 1) / 2;
        material.emissiveIntensity = pulseIntensity * 0.5;

        // Update corresponding light intensity
        if (lightsRef.current[i]) {
          lightsRef.current[i].intensity = pulseIntensity * 0.8;
        }
      });

      // Render the scene
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }

      // Copy refs to local variables to avoid stale closure warnings
      const mount = mountRef.current;
      const renderer = rendererRef.current;
      const components = componentsRef.current;

      if (renderer && mount) {
        mount.removeChild(renderer.domElement);
      }

      // Dispose of geometries and materials
      components.forEach(component => {
        component.geometry.dispose();
        (component.material as THREE.Material).dispose();
      });

      if (circuitBoardRef.current) {
        circuitBoardRef.current.clear();
      }

      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Three.js container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl backdrop-blur-sm bg-black/30 p-8 rounded-xl"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-blue-400">System</span> Maintenance
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-0.5 bg-blue-500 mx-auto mb-6"
          />

          <motion.p
            className="text-lg md:text-xl mb-8 text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            I'm currently upgrading my system to bring you an enhanced experience.
            I'm working diligently to complete the maintenance as quickly as possible. Stay tuned!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* <Link 
              to="/contact" 
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-300"
            >
              <Mail size={18} className="mr-2" />
              Contact Us
            </Link> */}

          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 text-sm text-gray-400"
        >
          © {new Date().getFullYear()} Ayeshmantha. Expected completion time: ~ hours.
        </motion.div>
      </div>
    </div>
  );
};

export default Maintenance;