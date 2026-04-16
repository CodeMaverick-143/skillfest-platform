'use client';

import React, { useEffect, useRef } from 'react';

const ParticleText = ({ text = 'Top Contributors' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const setCanvasSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    
    setCanvasSize();

    let mouse = {
      x: undefined as number | undefined,
      y: undefined as number | undefined,
      radius: 180
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = undefined;
      mouse.y = undefined;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      originalSize: number;

      constructor(x: number, y: number, color: string) {
        this.x = x + (Math.random() * 20 - 10); // Start slightly offset
        this.y = y + (Math.random() * 20 - 10);
        this.size = Math.random() * 1.5 + 0.8; 
        this.originalSize = this.size;
        this.baseX = x; 
        this.baseY = y;
        this.density = (Math.random() * 40) + 5; 
        this.color = color;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        
        // Add a subtle glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
      }

      update() {
        let dx = (mouse.x ?? -1000) - this.x;
        let dy = (mouse.y ?? -1000) - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius && mouse.x !== undefined) {
          this.x -= directionX;
          this.y -= directionY;
          // Enlarge when hovered
          this.size = this.originalSize * 2.2;
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 15; 
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 15;
          }
          this.size = this.originalSize;
        }
      }
    }

    const init = () => {
      particlesArray = [];
      
      let fontSize = 160;
      ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
      
      let textWidth = ctx.measureText(text).width;
      while (textWidth > canvas.width * 0.85 && fontSize > 40) {
         fontSize -= 5;
         ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
         textWidth = ctx.measureText(text).width;
      }

      ctx.fillStyle = 'white';
      // Center the text correctly taking baseline into account
      ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) + (fontSize / 3));

      const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const step = 5; // Denser particles
      
      // Darks/Golds/Grays palette for premium dark text effect on bright background
      const colors = ['#000000', '#1a1a1a', '#262626', '#404040', '#525252'];

      for (let y = 0; y < textCoordinates.height; y += step) {
        for (let x = 0; x < textCoordinates.width; x += step) {
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particlesArray.push(new Particle(x, y, color));
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.shadowBlur = 0;
      
      // Use destination-out to fade out the previous frame for a trailing effect without solid background
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      setCanvasSize();
      init(); 
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block', 
        width: '100%', 
        height: '100%', 
        background: 'transparent',
        cursor: 'crosshair',
        borderRadius: 'inherit'
      }} 
    />
  );
};

export default ParticleText;
