// src/components/InteractiveBackground.tsx
"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { cities } from '../app/lib/cities';

type ParticleType = 'city' | 'filler';
interface Particle {
  name?: string;
  type: ParticleType;
  x: number; 
  y: number;
  screenX: number;
  screenY: number;
  vx?: number;
  vy?: number;
  radius: number;
  opacity: number;
}

// YENİ: Component'in dışarıdan alacağı props'lar için tip tanımları
interface TracerColor {
  rgb: string;
  shadow: string;
}
interface InteractiveBackgroundProps {
  tracerColor: TracerColor;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ tracerColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cityParticlesRef = useRef<Particle[]>([]);
  const fillerParticlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  const FILLER_PARTICLE_DENSITY = 7500;
  const CONNECTION_DISTANCE = 120;
  const MOUSE_CONNECTION_DISTANCE = 250; 

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    const lonMin = 25.5, lonMax = 45.0, latMin = 35.5, latMax = 42.5;
    const mapWidth = lonMax - lonMin, mapHeight = latMax - latMin;
    const canvasAspectRatio = canvas.width / canvas.height, mapAspectRatio = mapWidth / mapHeight;
    const padding = 50; 
    let scale, offsetX, offsetY;
    if (canvasAspectRatio > mapAspectRatio) {
      scale = (canvas.height - padding * 2) / mapHeight;
      offsetX = (canvas.width - mapWidth * scale) / 2;
      offsetY = padding;
    } else {
      scale = (canvas.width - padding * 2) / mapWidth;
      offsetX = padding;
      offsetY = (canvas.height - mapHeight * scale) / 2;
    }
    const project = (lon: number, lat: number) => ({ x: (lon - lonMin) * scale + offsetX, y: (canvas.height - ((lat - latMin) * scale + offsetY)) });
    cityParticlesRef.current = cities.map(city => ({ ...city, ...project(city.lon, city.lat), type: 'city', screenX: 0, screenY: 0, radius: 2.5, opacity: 0 }));
    fillerParticlesRef.current = [];
    const fillerCount = Math.floor((canvas.width * canvas.height) / FILLER_PARTICLE_DENSITY);
    for (let i = 0; i < fillerCount; i++) {
      fillerParticlesRef.current.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: Math.random() * 0.4 - 0.2, vy: Math.random() * 0.4 - 0.2, type: 'filler', screenX: 0, screenY: 0, radius: 1, opacity: 0 });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.0002;
      const yaw = Math.sin(time * 0.7) * 0.15;
      const pitch = Math.cos(time) * 0.1;
      const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
      const centerX = canvas.width / 2, centerY = canvas.height / 2;
      const allPoints = [...cityParticlesRef.current, ...fillerParticlesRef.current];
      
      allPoints.forEach(p => { 
        if (p.type === 'filler' && p.vx !== undefined && p.vy !== undefined) { 
            p.x += p.vx; p.y += p.vy; 
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1; 
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1; 
            p.screenX = p.x; p.screenY = p.y; 
        } else { 
            let x = p.x - centerX, y = p.y - centerY, z = 0; 
            let x1 = x * cosYaw - z * sinYaw, z1 = x * sinYaw + z * cosYaw; 
            let y2 = y * cosPitch - z1 * sinPitch; 
            p.screenX = x1 + centerX; p.screenY = y2 + centerY; 
        } 
      });
      
      allPoints.forEach(p => { 
        ctx.beginPath(); 
        ctx.arc(p.screenX, p.screenY, p.radius, 0, Math.PI * 2); 
        ctx.fillStyle = p.type === 'city' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)'; 
        ctx.fill(); 
        if (p.type === 'city' && p.name) { 
            const dxMouse = p.screenX - mouseRef.current.x, dyMouse = p.screenY - mouseRef.current.y; 
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse); 
            if (distanceMouse < 30) p.opacity = Math.min(1, p.opacity + 0.1); 
            else p.opacity = Math.max(0, p.opacity - 0.1); 
            if (p.opacity > 0) { 
                ctx.font = '12px "Courier New", monospace'; 
                ctx.fillStyle = `rgba(0, 255, 255, ${p.opacity})`; 
                ctx.shadowColor = 'cyan'; ctx.shadowBlur = 10; 
                ctx.fillText(p.name, p.screenX + 8, p.screenY + 4); 
                ctx.shadowBlur = 0; 
            } 
        } 
      });
      
      for (let i = 0; i < allPoints.length; i++) { 
        const p1 = allPoints[i]; 
        const dxMouse = p1.screenX - mouseRef.current.x, dyMouse = p1.screenY - mouseRef.current.y; 
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse); 
        if (distanceMouse < MOUSE_CONNECTION_DISTANCE) { 
            ctx.beginPath(); ctx.moveTo(p1.screenX, p1.screenY); ctx.lineTo(mouseRef.current.x, mouseRef.current.y); 
            const opacity = 0.8 - distanceMouse / MOUSE_CONNECTION_DISTANCE;
            ctx.strokeStyle = `rgba(${tracerColor.rgb}, ${opacity})`; 
            ctx.lineWidth = 1; ctx.shadowColor = tracerColor.shadow; ctx.shadowBlur = 15; ctx.stroke(); ctx.shadowBlur = 0; 
        } 
        for (let j = i + 1; j < allPoints.length; j++) { 
            const p2 = allPoints[j]; 
            const dx = p1.screenX - p2.screenX, dy = p1.screenY - p2.screenY; 
            const distance = Math.sqrt(dx * dx + dy * dy); 
            if (distance < CONNECTION_DISTANCE) { 
                ctx.beginPath(); ctx.moveTo(p1.screenX, p1.screenY); ctx.lineTo(p2.screenX, p2.screenY); 
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 - distance / CONNECTION_DISTANCE})`; 
                ctx.lineWidth = 0.7; ctx.stroke(); 
            } 
        } 
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const debouncedSetup = debounce(setupCanvas, 100);
    const resizeObserver = new ResizeObserver(() => debouncedSetup());
    if (canvas) resizeObserver.observe(canvas);
    
    setupCanvas();
    animate();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setupCanvas, tracerColor]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default InteractiveBackground;