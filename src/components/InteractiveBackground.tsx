"use client";

import React, { useRef, useEffect } from 'react';
import { cities, City } from '../app/lib/cities';

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

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cityParticlesRef = useRef<Particle[]>([]);
  const fillerParticlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  // --- PERFORMANS İÇİN AYARLANMIŞ PARAMETRELER ---
  const FILLER_PARTICLE_DENSITY = 7500; // Sayıyı büyüttük (daha az nokta, daha iyi performans)
  const CONNECTION_DISTANCE = 120; // Mesafeyi azalttık (daha az çizgi, daha iyi performans)
  const MOUSE_CONNECTION_DISTANCE = 250; 
  // --- Parametreler Sonu ---

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setup = () => {
      // ... setup fonksiyonunun geri kalanı aynı, değişiklik yok ...
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
      const project = (lon: number, lat: number) => ({
        x: (lon - lonMin) * scale + offsetX,
        y: (canvas.height - ((lat - latMin) * scale + offsetY))
      });
      cityParticlesRef.current = cities.map(city => ({
        ...city, ...project(city.lon, city.lat), type: 'city',
        screenX: 0, screenY: 0, radius: 2.5, opacity: 0,
      }));
      fillerParticlesRef.current = [];
      const fillerCount = Math.floor((canvas.width * canvas.height) / FILLER_PARTICLE_DENSITY);
      for (let i = 0; i < fillerCount; i++) {
        fillerParticlesRef.current.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: Math.random() * 0.4 - 0.2, vy: Math.random() * 0.4 - 0.2,
          type: 'filler', screenX: 0, screenY: 0, radius: 1, opacity: 0,
        });
      }
    };

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
            // ... pozisyon güncelleme kısmı aynı, değişiklik yok ...
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
            // ... parçacık ve şehir ismi çizim kısmı aynı, değişiklik yok ...
            ctx.beginPath();
            ctx.arc(p.screenX, p.screenY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.type === 'city' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            if (p.type === 'city') {
                const dxMouse = p.screenX - mouseRef.current.x;
                const dyMouse = p.screenY - mouseRef.current.y;
                const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distanceMouse < 30) p.opacity = Math.min(1, p.opacity + 0.1);
                else p.opacity = Math.max(0, p.opacity - 0.1);
                if (p.opacity > 0 && p.name) {
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
            
            // OPTİMİZASYON 1: Parlama efekti sadece fare çizgilerinde
            const dxMouse = p1.screenX - mouseRef.current.x;
            const dyMouse = p1.screenY - mouseRef.current.y;
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distanceMouse < MOUSE_CONNECTION_DISTANCE) {
                ctx.beginPath();
                ctx.moveTo(p1.screenX, p1.screenY);
                ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                ctx.strokeStyle = `rgba(255, 0, 255, ${0.8 - distanceMouse / MOUSE_CONNECTION_DISTANCE})`;
                ctx.lineWidth = 1; 
                ctx.shadowColor = 'magenta'; 
                ctx.shadowBlur = 15; 
                ctx.stroke();
                ctx.shadowBlur = 0; 
            }

            // OPTİMİZASYON 2: İç çizgilerde parlama yok, daha kalın ve parlaklar
            for (let j = i + 1; j < allPoints.length; j++) {
                const p2 = allPoints[j];
                const dx = p1.screenX - p2.screenX;
                const dy = p1.screenY - p2.screenY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONNECTION_DISTANCE) {
                    ctx.beginPath();
                    ctx.moveTo(p1.screenX, p1.screenY);
                    ctx.lineTo(p2.screenX, p2.screenY);
                    // Parlaklığı artırmak için opaklık değerini yükselttik
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 - distance / CONNECTION_DISTANCE})`;
                    // Kalınlığı artırdık
                    ctx.lineWidth = 0.7;
                    // shadowBlur ve shadowColor buradan kaldırıldı.
                    ctx.stroke();
                }
            }
        }
        
        animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    setup();
    animate();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', setup);

    return () => {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', setup);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default InteractiveBackground;