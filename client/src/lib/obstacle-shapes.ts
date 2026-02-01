export type ObstacleShape = 'cylinder' | 'square' | 'airfoil' | 'dna';

interface ObstacleOptions {
  shape: ObstacleShape;
  size: string;
  orientation: number;
  gridWidth: number;
  gridHeight: number;
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

export class ObstacleGenerator {
  private shape: ObstacleShape;
  private size: string;
  private orientation: number;
  private gridWidth: number;
  private gridHeight: number;
  private obstacles: Obstacle[];

  constructor(options: ObstacleOptions) {
    this.shape = options.shape;
    this.size = options.size;
    this.orientation = options.orientation;
    this.gridWidth = options.gridWidth;
    this.gridHeight = options.gridHeight;
    this.obstacles = [];
    this.generate();
  }

  private generate() {
    this.obstacles = [];
    const centerX = this.gridWidth * 0.25;
    const centerY = this.gridHeight * 0.5;

    let baseRadius = this.size === 'small' ? 4 : this.size === 'medium' ? 6 : 8;

    switch (this.shape) {
      case 'cylinder':
        this.generateCylinder(centerX, centerY, baseRadius);
        break;
      case 'square':
        this.generateSquare(centerX, centerY, baseRadius);
        break;
      case 'airfoil':
        this.generateAirfoil(centerX, centerY, baseRadius);
        break;
      case 'dna':
        this.generateDNA(centerX, centerY, baseRadius);
        break;
    }
  }

  private generateCylinder(cx: number, cy: number, radius: number) {
    const numPoints = Math.max(12, Math.floor(radius * 3));
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = cx + radius * 0.8 * Math.cos(angle);
      const y = cy + radius * 0.8 * Math.sin(angle);
      this.obstacles.push({ x, y, radius: radius * 0.3 });
    }
    this.obstacles.push({ x: cx, y: cy, radius: radius * 0.5 });
  }

  private generateSquare(cx: number, cy: number, size: number) {
    const halfSize = size;
    const spacing = size * 0.4;
    
    const rotRad = this.orientation * Math.PI / 180;
    const corners = [
      [-halfSize, -halfSize], [halfSize, -halfSize],
      [halfSize, halfSize], [-halfSize, halfSize]
    ];

    for (let side = 0; side < 4; side++) {
      const [x1, y1] = corners[side];
      const [x2, y2] = corners[(side + 1) % 4];
      const numPoints = Math.ceil(Math.abs(x2 - x1 + y2 - y1) / spacing) + 1;
      
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lx = x1 + t * (x2 - x1);
        const ly = y1 + t * (y2 - y1);
        
        const rx = cx + lx * Math.cos(rotRad) - ly * Math.sin(rotRad);
        const ry = cy + lx * Math.sin(rotRad) + ly * Math.cos(rotRad);
        
        this.obstacles.push({ x: rx, y: ry, radius: size * 0.25 });
      }
    }
  }

  private generateAirfoil(cx: number, cy: number, scale: number) {
    const chord = scale * 3;
    const thickness = scale * 0.6;
    const numPoints = 20;
    const rotRad = this.orientation * Math.PI / 180;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = t * chord - chord / 2;
      
      const y_thick = thickness * (
        0.2969 * Math.sqrt(Math.abs(t)) -
        0.1260 * t -
        0.3516 * t * t +
        0.2843 * t * t * t -
        0.1015 * t * t * t * t
      ) * 5;

      const rx_upper = cx + x * Math.cos(rotRad) - y_thick * Math.sin(rotRad);
      const ry_upper = cy + x * Math.sin(rotRad) + y_thick * Math.cos(rotRad);
      this.obstacles.push({ x: rx_upper, y: ry_upper, radius: scale * 0.2 });

      if (y_thick > 0.1) {
        const rx_lower = cx + x * Math.cos(rotRad) + y_thick * Math.sin(rotRad);
        const ry_lower = cy + x * Math.sin(rotRad) - y_thick * Math.cos(rotRad);
        this.obstacles.push({ x: rx_lower, y: ry_lower, radius: scale * 0.2 });
      }
    }
  }

  private generateDNA(cx: number, cy: number, baseRadius: number) {
    const numSegments = this.size === 'small' ? 3 : this.size === 'medium' ? 5 : 7;
    const segmentSpacing = this.size === 'small' ? 2 : this.size === 'medium' ? 3 : 4;
    const helixRadius = segmentSpacing * 0.3;
    const helixFreq = 2 * Math.PI * 2;
    const rotRad = this.orientation * Math.PI / 180;

    for (let i = 0; i < numSegments; i++) {
      const t = i / (numSegments - 1);
      const baseX = t * segmentSpacing * (numSegments - 1) * 0.5;
      const baseY = helixRadius * Math.sin(t * helixFreq);

      const rx = cx + baseX * Math.cos(rotRad) - baseY * Math.sin(rotRad);
      const ry = cy + baseX * Math.sin(rotRad) + baseY * Math.cos(rotRad);
      this.obstacles.push({ x: rx, y: ry, radius: baseRadius * 0.3 });

      const compY = -helixRadius * Math.sin(t * helixFreq);
      const crx = cx + baseX * Math.cos(rotRad) - compY * Math.sin(rotRad);
      const cry = cy + baseX * Math.sin(rotRad) + compY * Math.cos(rotRad);
      this.obstacles.push({ x: crx, y: cry, radius: baseRadius * 0.25 });
    }
  }

  setOrientation(orientation: number) {
    this.orientation = orientation;
    this.generate();
  }

  setShape(shape: ObstacleShape) {
    this.shape = shape;
    this.generate();
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  getShape(): ObstacleShape {
    return this.shape;
  }

  static getShapeInfo(shape: ObstacleShape): { name: string; expectedCd: string; description: string } {
    const info: Record<ObstacleShape, { name: string; expectedCd: string; description: string }> = {
      cylinder: { name: 'Cylinder', expectedCd: '~1.0-1.2', description: 'Classic bluff body, symmetric wake' },
      square: { name: 'Square', expectedCd: '~2.0-2.2', description: 'Sharp corners, high drag' },
      airfoil: { name: 'Airfoil (NACA)', expectedCd: '~0.02-0.05', description: 'Streamlined, low drag' },
      dna: { name: 'DNA Helix', expectedCd: 'Variable', description: 'Complex multi-body wake' },
    };
    return info[shape];
  }
}
