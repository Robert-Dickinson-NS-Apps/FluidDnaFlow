import { useEffect, useRef, useState } from "react";
import { SimulationState } from "@/pages/simulation";
import { LatticeBotzmann } from "@/lib/lattice-boltzmann";
import { ObstacleGenerator } from "@/lib/obstacle-shapes";

interface ComparisonCanvasProps {
  simulationState: SimulationState;
  reynoldsA: number;
  reynoldsB: number;
}

export default function ComparisonCanvas({ simulationState, reynoldsA, reynoldsB }: ComparisonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lbmARef = useRef<LatticeBotzmann>();
  const lbmBRef = useRef<LatticeBotzmann>();
  const obstacleRef = useRef<ObstacleGenerator>();
  const lastTimeRef = useRef<number>(0);

  const [dimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridWidth = simulationState.gridResolution === 'low' ? 100 : 
                     simulationState.gridResolution === 'medium' ? 200 : 400;
    const gridHeight = Math.floor(gridWidth * 0.5);
    const halfWidth = Math.floor(gridWidth / 2);

    lbmARef.current = new LatticeBotzmann(halfWidth, gridHeight, {
      viscosity: simulationState.viscosity,
      velocity: simulationState.velocity,
      reynolds: reynoldsA,
    });

    lbmBRef.current = new LatticeBotzmann(halfWidth, gridHeight, {
      viscosity: simulationState.viscosity,
      velocity: simulationState.velocity,
      reynolds: reynoldsB,
    });

    obstacleRef.current = new ObstacleGenerator({
      shape: simulationState.obstacleShape,
      size: simulationState.dnaSize,
      orientation: simulationState.orientation,
      gridWidth: halfWidth,
      gridHeight,
    });

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    lbmARef.current.initialize();
    lbmBRef.current.initialize();
    const obstacles = obstacleRef.current.getObstacles();
    lbmARef.current.setObstacles(obstacles);
    lbmBRef.current.setObstacles(obstacles);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState.gridResolution, simulationState.dnaSize, simulationState.obstacleShape, reynoldsA, reynoldsB, dimensions]);

  useEffect(() => {
    if (lbmARef.current) {
      lbmARef.current.updateParameters({
        viscosity: simulationState.viscosity,
        velocity: simulationState.velocity,
        reynolds: reynoldsA,
      });
    }
    if (lbmBRef.current) {
      lbmBRef.current.updateParameters({
        viscosity: simulationState.viscosity,
        velocity: simulationState.velocity,
        reynolds: reynoldsB,
      });
    }
  }, [simulationState.viscosity, simulationState.velocity, reynoldsA, reynoldsB]);

  useEffect(() => {
    if (!obstacleRef.current || !lbmARef.current || !lbmBRef.current) return;

    obstacleRef.current.setOrientation(simulationState.orientation);
    const obstacles = obstacleRef.current.getObstacles();
    lbmARef.current.setObstacles(obstacles);
    lbmBRef.current.setObstacles(obstacles);
  }, [simulationState.orientation]);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (!canvasRef.current || !lbmARef.current || !lbmBRef.current || !obstacleRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      lastTimeRef.current = currentTime;

      if (simulationState.running) {
        lbmARef.current.step();
        lbmBRef.current.step();
      }

      ctx.fillStyle = 'hsl(220, 100%, 12%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const halfWidth = canvas.width / 2;

      drawSimulation(ctx, lbmARef.current, obstacleRef.current, 0, 0, halfWidth - 2, canvas.height, `Re = ${reynoldsA}`);
      drawSimulation(ctx, lbmBRef.current, obstacleRef.current, halfWidth + 2, 0, halfWidth - 2, canvas.height, `Re = ${reynoldsB}`);

      ctx.strokeStyle = 'hsl(0, 0%, 50%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(halfWidth, 0);
      ctx.lineTo(halfWidth, canvas.height);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    if (simulationState.running || !animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState, reynoldsA, reynoldsB]);

  const drawSimulation = (
    ctx: CanvasRenderingContext2D, 
    lbm: LatticeBotzmann, 
    obstacles: ObstacleGenerator,
    offsetX: number, 
    offsetY: number, 
    width: number, 
    height: number,
    label: string
  ) => {
    const velocityField = lbm.getVelocityField();
    if (!velocityField || velocityField.length === 0 || !velocityField[0]) return;

    const gridWidth = velocityField.length;
    const gridHeight = velocityField[0].length;
    const scaleX = width / gridWidth;
    const scaleY = height / gridHeight;

    for (let i = 0; i < gridWidth; i += 4) {
      for (let j = 0; j < gridHeight; j += 4) {
        if (velocityField[i] && velocityField[i][j] !== undefined) {
          const velocity = Math.sqrt(velocityField[i][j] * velocityField[i][j]);
          const normalizedVel = Math.min(velocity / 3.0, 1.0);
          
          const hue = (1 - normalizedVel) * 240;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          ctx.fillRect(offsetX + i * scaleX, offsetY + j * scaleY, scaleX * 2, scaleY * 2);
        }
      }
    }

    const obstacleList = obstacles.getObstacles();
    ctx.fillStyle = 'hsl(0, 80%, 60%)';
    obstacleList.forEach(obstacle => {
      ctx.beginPath();
      ctx.arc(offsetX + obstacle.x * scaleX, offsetY + obstacle.y * scaleY, obstacle.radius * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });

    if (simulationState.showStreamlines) {
      const streamlines = lbm.getStreamlines();
      ctx.strokeStyle = 'hsl(120, 100%, 60%)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;

      streamlines.forEach(line => {
        if (line && line.length > 0) {
          ctx.beginPath();
          line.forEach((point, index) => {
            if (point && typeof point.x === 'number' && typeof point.y === 'number') {
              const x = offsetX + point.x * scaleX;
              const y = offsetY + point.y * scaleY;
              if (index === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
          });
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'hsla(0, 0%, 0%, 0.8)';
    ctx.fillRect(offsetX + 5, offsetY + 5, 100, 25);
    ctx.fillStyle = 'hsl(120, 100%, 60%)';
    ctx.font = 'bold 14px "Roboto Mono", monospace';
    ctx.fillText(label, offsetX + 15, offsetY + 22);

    ctx.fillStyle = 'hsla(0, 0%, 0%, 0.7)';
    ctx.fillRect(offsetX + 5, height - 55, 120, 50);
    ctx.fillStyle = 'hsl(0, 0%, 90%)';
    ctx.font = '11px "Roboto Mono", monospace';
    ctx.fillText(`Max Vel: ${lbm.getMaxVelocity().toFixed(3)}`, offsetX + 10, height - 38);
    ctx.fillText(`Cd: ${lbm.getDragCoefficient().toFixed(3)}`, offsetX + 10, height - 22);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="simulation-canvas w-full rounded-lg"
        width={dimensions.width}
        height={dimensions.height}
      />
      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
        Side-by-side Reynolds number comparison
      </div>
    </div>
  );
}
