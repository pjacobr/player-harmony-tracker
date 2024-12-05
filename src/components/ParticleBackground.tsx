import { useEffect, useRef } from 'react';
import p5 from 'p5';

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const particles: Particle[] = [];
      const numParticles = 200;

      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        
        constructor() {
          this.pos = p.createVector(p.random(p.width), p.random(p.height));
          this.vel = p5.Vector.random2D().mult(0.5);
          this.acc = p.createVector(0, 0);
        }

        update() {
          // Follow mouse with subtle attraction
          if (p.mouseX !== 0 && p.mouseY !== 0) {
            const mouse = p.createVector(p.mouseX, p.mouseY);
            const dir = p5.Vector.sub(mouse, this.pos);
            dir.normalize();
            dir.mult(0.1);
            this.acc = dir;
          }

          this.vel.add(this.acc);
          this.vel.limit(2);
          this.pos.add(this.vel);
          this.acc.mult(0);

          // Wrap around edges
          if (this.pos.x > p.width) this.pos.x = 0;
          if (this.pos.x < 0) this.pos.x = p.width;
          if (this.pos.y > p.height) this.pos.y = 0;
          if (this.pos.y < 0) this.pos.y = p.height;
        }

        draw() {
          p.noStroke();
          const alpha = p.map(this.vel.mag(), 0, 2, 50, 150);
          p.fill(100, 108, 255, alpha);
          p.circle(this.pos.x, this.pos.y, 4);
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.position(0, 0);
        canvas.style('z-index', '-1');
        canvas.style('position', 'fixed');
        
        // Initialize particles
        for (let i = 0; i < numParticles; i++) {
          particles.push(new Particle());
        }
      };

      p.draw = () => {
        p.clear();
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    // Create new p5 instance
    const p5Instance = new p5(sketch, containerRef.current);

    // Cleanup
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;