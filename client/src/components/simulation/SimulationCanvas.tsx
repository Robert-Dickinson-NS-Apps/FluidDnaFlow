import { useEffect, useRef, useState, useCallback } from "react";
import { SimulationState, ProbeData } from "@/pages/simulation";
import { LatticeBotzmann } from "@/lib/lattice-boltzmann";
import { ObstacleGenerator } from "@/lib/obstacle-shapes";

interface SimulationCanvasProps {
  simulationState: SimulationState;
  onMetricsUpdate: (metrics: { 
    maxVelocity: number; 
    pressureDrop: number; 
    dragCoefficient: number;
    computedReynolds: number;
    fps: number 
  }) => void;
  onProbe?: (data: ProbeData | null) => void;
  probeData?: ProbeData | null;
}

export default function SimulationCanvas({ simulationState, onMetricsUpdate, onProbe, probeData }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lbmRef = useRef<LatticeBotzmann>();
  const obstacleRef = useRef<ObstacleGenerator>();
  const lastTimeRef = useRef<number>(0);
  const fpsRef = useRef<number[]>([]);

  const [dimensions] = useState({ width: 800, height: 400 });

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !lbmRef.current || !onProbe) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const gridWidth = lbmRef.current.getGridWidth();
    const gridHeight = lbmRef.current.getGridHeight();
    const scaleX = canvas.width / gridWidth;
    const scaleY = canvas.height / gridHeight;

    const gridX = Math.floor(clickX / scaleX);
    const gridY = Math.floor(clickY / scaleY);

    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
      const velocityField = lbmRef.current.getVelocityField();
      const pressureField = lbmRef.current.getPressureField();
      const vorticityField = lbmRef.current.getVorticity();

      const velocity = velocityField[gridX]?.[gridY] ?? 0;
      const pressure = pressureField[gridX]?.[gridY] ?? 0;
      const vorticity = vorticityField[gridX]?.[gridY] ?? 0;

      onProbe({
        x: clickX,
        y: clickY,
        velocity: Math.abs(velocity),
        pressure,
        vorticity,
      });
    }
  }, [onProbe]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize simulation
    const gridWidth = simulationState.gridResolution === 'low' ? 100 : 
                     simulationState.gridResolution === 'medium' ? 200 : 400;
    const gridHeight = Math.floor(gridWidth * 0.5);

    lbmRef.current = new LatticeBotzmann(gridWidth, gridHeight, {
      viscosity: simulationState.viscosity,
      velocity: simulationState.velocity,
      reynolds: simulationState.reynolds,
    });

    obstacleRef.current = new ObstacleGenerator({
      shape: simulationState.obstacleShape,
      size: simulationState.dnaSize,
      orientation: simulationState.orientation,
      gridWidth,
      gridHeight,
    });

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    lbmRef.current.initialize();
    const obstacles = obstacleRef.current.getObstacles();
    lbmRef.current.setObstacles(obstacles);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState.gridResolution, simulationState.dnaSize, simulationState.obstacleShape, dimensions]);

  useEffect(() => {
    if (!lbmRef.current) return;

    // Update LBM parameters
    lbmRef.current.updateParameters({
      viscosity: simulationState.viscosity,
      velocity: simulationState.velocity,
      reynolds: simulationState.reynolds,
    });
  }, [simulationState.viscosity, simulationState.velocity, simulationState.reynolds]);

  useEffect(() => {
    if (!obstacleRef.current || !lbmRef.current) return;

    obstacleRef.current.setOrientation(simulationState.orientation);
    const obstacles = obstacleRef.current.getObstacles();
    lbmRef.current.setObstacles(obstacles);
  }, [simulationState.orientation]);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (!canvasRef.current || !lbmRef.current || !obstacleRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate FPS
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
      fpsRef.current.push(fps);
      if (fpsRef.current.length > 10) fpsRef.current.shift();
      const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;

      if (simulationState.running) {
        // Run LBM step
        lbmRef.current.step();
      }

      // Clear canvas
      ctx.fillStyle = 'hsl(220, 100%, 12%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const velocityField = lbmRef.current.getVelocityField();
      const pressureField = lbmRef.current.getPressureField();
      const obstacles = obstacleRef.current.getObstacles();

      // Draw velocity field
      if (simulationState.showVelocityField) {
        drawVelocityField(ctx, velocityField, canvas.width, canvas.height);
      }

      // Draw pressure field
      if (simulationState.showPressureField) {
        drawPressureField(ctx, pressureField, canvas.width, canvas.height);
      }

      drawObstacle(ctx, obstacles, canvas.width, canvas.height);

      // Draw streamlines
      if (simulationState.showStreamlines) {
        drawStreamlines(ctx, velocityField, canvas.width, canvas.height);
      }

      // Draw vorticity
      if (simulationState.showVorticity) {
        const vorticity = lbmRef.current.getVorticity();
        drawVorticity(ctx, vorticity, canvas.width, canvas.height);
      }

      drawDataOverlay(ctx, {
        reynolds: simulationState.reynolds,
        maxVelocity: lbmRef.current.getMaxVelocity(),
        pressureDrop: lbmRef.current.getPressureDrop(),
        computedReynolds: lbmRef.current.getComputedReynolds(),
      });

      if (probeData) {
        drawProbeMarker(ctx, probeData);
      }

      // Update metrics
      onMetricsUpdate({
        maxVelocity: lbmRef.current.getMaxVelocity(),
        pressureDrop: lbmRef.current.getPressureDrop(),
        dragCoefficient: lbmRef.current.getDragCoefficient(),
        computedReynolds: lbmRef.current.getComputedReynolds(),
        fps: Math.round(avgFps),
      });

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
  }, [simulationState, onMetricsUpdate]);

  const drawVelocityField = (ctx: CanvasRenderingContext2D, velocityField: number[][], width: number, height: number) => {
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
          
          // Color based on velocity magnitude
          const hue = (1 - normalizedVel) * 240; // Blue to red
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          ctx.fillRect(i * scaleX, j * scaleY, scaleX * 2, scaleY * 2);
        }
      }
    }
  };

  const drawPressureField = (ctx: CanvasRenderingContext2D, pressureField: number[][], width: number, height: number) => {
    if (!pressureField || pressureField.length === 0 || !pressureField[0]) return;
    
    const gridWidth = pressureField.length;
    const gridHeight = pressureField[0].length;
    const scaleX = width / gridWidth;
    const scaleY = height / gridHeight;

    for (let i = 0; i < gridWidth; i += 2) {
      for (let j = 0; j < gridHeight; j += 2) {
        if (pressureField[i] && pressureField[i][j] !== undefined) {
          const pressure = pressureField[i][j];
          const normalizedPressure = Math.min(Math.max(pressure, 0), 1);
          
          ctx.fillStyle = `hsla(300, 70%, 50%, ${normalizedPressure * 0.5})`;
          ctx.fillRect(i * scaleX, j * scaleY, scaleX * 2, scaleY * 2);
        }
      }
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacles: Array<{x: number, y: number, radius: number}>, width: number, height: number) => {
    const gridWidth = lbmRef.current?.getGridWidth() || 200;
    const gridHeight = lbmRef.current?.getGridHeight() || 100;
    const scaleX = width / gridWidth;
    const scaleY = height / gridHeight;

    ctx.fillStyle = 'hsl(0, 80%, 60%)';
    obstacles.forEach(obstacle => {
      ctx.beginPath();
      ctx.arc(obstacle.x * scaleX, obstacle.y * scaleY, obstacle.radius * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawProbeMarker = (ctx: CanvasRenderingContext2D, probe: ProbeData) => {
    ctx.strokeStyle = 'hsl(60, 100%, 50%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(probe.x, probe.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'hsla(0, 0%, 0%, 0.85)';
    const boxWidth = 140;
    const boxHeight = 60;
    const boxX = Math.min(probe.x + 15, canvasRef.current!.width - boxWidth - 10);
    const boxY = Math.min(probe.y - 30, canvasRef.current!.height - boxHeight - 10);
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = 'hsl(60, 100%, 70%)';
    ctx.font = '11px "Roboto Mono", monospace';
    ctx.fillText(`Vel: ${probe.velocity.toFixed(4)}`, boxX + 8, boxY + 18);
    ctx.fillText(`P: ${(probe.pressure * 10000).toFixed(2)} x10⁻⁴`, boxX + 8, boxY + 34);
    ctx.fillText(`ω: ${probe.vorticity.toFixed(4)}`, boxX + 8, boxY + 50);
  };

  const drawStreamlines = (ctx: CanvasRenderingContext2D, velocityField: number[][], width: number, height: number) => {
    if (!lbmRef.current || !velocityField || velocityField.length === 0 || !velocityField[0]) return;

    const streamlines = lbmRef.current.getStreamlines();
    const gridWidth = velocityField.length;
    const gridHeight = velocityField[0].length;
    const scaleX = width / gridWidth;
    const scaleY = height / gridHeight;

    ctx.strokeStyle = 'hsl(120, 100%, 60%)';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;

    streamlines.forEach(line => {
      if (line && line.length > 0) {
        ctx.beginPath();
        line.forEach((point, index) => {
          if (point && typeof point.x === 'number' && typeof point.y === 'number') {
            const x = point.x * scaleX;
            const y = point.y * scaleY;
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
  };

  const drawVorticity = (ctx: CanvasRenderingContext2D, vorticity: number[][], width: number, height: number) => {
    if (!vorticity || vorticity.length === 0 || !vorticity[0]) return;
    
    const gridWidth = vorticity.length;
    const gridHeight = vorticity[0].length;
    const scaleX = width / gridWidth;
    const scaleY = height / gridHeight;

    for (let i = 0; i < gridWidth; i += 3) {
      for (let j = 0; j < gridHeight; j += 3) {
        if (vorticity[i] && vorticity[i][j] !== undefined) {
          const vort = Math.abs(vorticity[i][j]);
          const normalizedVort = Math.min(vort / 5.0, 1.0);
          
          if (normalizedVort > 0.1) {
            ctx.fillStyle = `hsla(60, 100%, 50%, ${normalizedVort * 0.6})`;
            ctx.fillRect(i * scaleX, j * scaleY, scaleX * 3, scaleY * 3);
          }
        }
      }
    }
  };

  const drawDataOverlay = (ctx: CanvasRenderingContext2D, data: { reynolds: number; maxVelocity: number; pressureDrop: number; computedReynolds: number }) => {
    ctx.fillStyle = 'hsla(0, 0%, 0%, 0.8)';
    ctx.fillRect(canvasRef.current!.width - 200, 10, 190, 95);

    ctx.fillStyle = 'hsl(120, 100%, 60%)';
    ctx.font = '12px "Roboto Mono", monospace';
    ctx.fillText(`Input Re: ${data.reynolds.toFixed(0)}`, canvasRef.current!.width - 190, 28);
    ctx.fillText(`Computed Re: ${data.computedReynolds.toFixed(0)}`, canvasRef.current!.width - 190, 46);
    ctx.fillText(`Max Vel: ${data.maxVelocity.toFixed(3)}`, canvasRef.current!.width - 190, 64);
    ctx.fillText(`dP: ${(data.pressureDrop * 10000).toFixed(2)} x10^-4`, canvasRef.current!.width - 190, 82);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="simulation-canvas w-full rounded-lg cursor-crosshair"
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
      />
      {probeData && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-yellow-300 text-xs px-2 py-1 rounded font-mono">
          Click anywhere to probe flow values
        </div>
      )}
    </div>
  );
}
