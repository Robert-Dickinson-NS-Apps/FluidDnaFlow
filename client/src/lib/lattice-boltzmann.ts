// D2Q9 Lattice-Boltzmann implementation for 2D incompressible flow
export class LatticeBotzmann {
  private nx: number;
  private ny: number;
  private omega: number;
  private viscosity: number;
  private velocity: number;
  private reynolds: number;
  
  // D2Q9 velocity directions
  private ex = [0, 1, 0, -1, 0, 1, -1, -1, 1];
  private ey = [0, 0, 1, 0, -1, 1, 1, -1, -1];
  private w = [4/9, 1/9, 1/9, 1/9, 1/9, 1/36, 1/36, 1/36, 1/36];
  
  // Distribution functions
  private f: number[][][];
  private fNew: number[][][];
  
  // Macroscopic quantities
  private rho: number[][];
  private ux: number[][];
  private uy: number[][];
  
  // Obstacles
  private obstacles: boolean[][];
  
  constructor(nx: number, ny: number, params: { viscosity: number; velocity: number; reynolds: number }) {
    this.nx = nx;
    this.ny = ny;
    this.viscosity = params.viscosity;
    this.velocity = params.velocity;
    this.reynolds = params.reynolds;
    this.omega = 1.0 / (3.0 * this.viscosity + 0.5);
    
    // Initialize arrays
    this.f = new Array(nx).fill(0).map(() => new Array(ny).fill(0).map(() => new Array(9).fill(0)));
    this.fNew = new Array(nx).fill(0).map(() => new Array(ny).fill(0).map(() => new Array(9).fill(0)));
    this.rho = new Array(nx).fill(0).map(() => new Array(ny).fill(1.0));
    this.ux = new Array(nx).fill(0).map(() => new Array(ny).fill(0));
    this.uy = new Array(nx).fill(0).map(() => new Array(ny).fill(0));
    this.obstacles = new Array(nx).fill(0).map(() => new Array(ny).fill(false));
  }
  
  initialize() {
    // Initialize equilibrium distribution
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        const rho = 1.0;
        const ux = i < 10 ? this.velocity : 0; // Inlet velocity
        const uy = 0;
        
        this.rho[i][j] = rho;
        this.ux[i][j] = ux;
        this.uy[i][j] = uy;
        
        for (let k = 0; k < 9; k++) {
          this.f[i][j][k] = this.equilibrium(k, rho, ux, uy);
        }
      }
    }
  }
  
  equilibrium(k: number, rho: number, ux: number, uy: number): number {
    const cu = 3.0 * (this.ex[k] * ux + this.ey[k] * uy);
    const usqr = 3.0 / 2.0 * (ux * ux + uy * uy);
    return rho * this.w[k] * (1.0 + cu + 0.5 * cu * cu - usqr);
  }
  
  step() {
    // Collision step
    this.collision();
    
    // Streaming step
    this.streaming();
    
    // Boundary conditions
    this.applyBoundaryConditions();
    
    // Update macroscopic quantities
    this.updateMacroscopic();
  }
  
  collision() {
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        if (this.obstacles[i][j]) continue;
        
        const rho = this.rho[i][j];
        const ux = this.ux[i][j];
        const uy = this.uy[i][j];
        
        for (let k = 0; k < 9; k++) {
          const feq = this.equilibrium(k, rho, ux, uy);
          this.f[i][j][k] = this.f[i][j][k] - this.omega * (this.f[i][j][k] - feq);
        }
      }
    }
  }
  
  streaming() {
    // Copy f to fNew
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        for (let k = 0; k < 9; k++) {
          this.fNew[i][j][k] = this.f[i][j][k];
        }
      }
    }
    
    // Stream
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        for (let k = 0; k < 9; k++) {
          const ni = i + this.ex[k];
          const nj = j + this.ey[k];
          
          if (ni >= 0 && ni < this.nx && nj >= 0 && nj < this.ny) {
            this.fNew[ni][nj][k] = this.f[i][j][k];
          }
        }
      }
    }
    
    // Copy back
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        for (let k = 0; k < 9; k++) {
          this.f[i][j][k] = this.fNew[i][j][k];
        }
      }
    }
  }
  
  applyBoundaryConditions() {
    // Left boundary (inlet)
    for (let j = 0; j < this.ny; j++) {
      const rho = 1.0;
      const ux = this.velocity;
      const uy = 0;
      
      for (let k = 0; k < 9; k++) {
        this.f[0][j][k] = this.equilibrium(k, rho, ux, uy);
      }
    }
    
    // Right boundary (outlet)
    for (let j = 0; j < this.ny; j++) {
      for (let k = 0; k < 9; k++) {
        this.f[this.nx - 1][j][k] = this.f[this.nx - 2][j][k];
      }
    }
    
    // Top and bottom boundaries (walls)
    for (let i = 0; i < this.nx; i++) {
      // Bottom wall
      this.f[i][0][2] = this.f[i][0][4];
      this.f[i][0][5] = this.f[i][0][7];
      this.f[i][0][6] = this.f[i][0][8];
      
      // Top wall
      this.f[i][this.ny - 1][4] = this.f[i][this.ny - 1][2];
      this.f[i][this.ny - 1][7] = this.f[i][this.ny - 1][5];
      this.f[i][this.ny - 1][8] = this.f[i][this.ny - 1][6];
    }
    
    // Obstacle boundaries (bounce-back)
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        if (this.obstacles[i][j]) {
          // Bounce back
          const temp = [...this.f[i][j]];
          this.f[i][j][1] = temp[3];
          this.f[i][j][2] = temp[4];
          this.f[i][j][3] = temp[1];
          this.f[i][j][4] = temp[2];
          this.f[i][j][5] = temp[7];
          this.f[i][j][6] = temp[8];
          this.f[i][j][7] = temp[5];
          this.f[i][j][8] = temp[6];
        }
      }
    }
  }
  
  updateMacroscopic() {
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        if (this.obstacles[i] && this.obstacles[i][j]) continue;
        
        let rho = 0;
        let ux = 0;
        let uy = 0;
        
        for (let k = 0; k < 9; k++) {
          if (this.f[i] && this.f[i][j] && this.f[i][j][k] !== undefined) {
            rho += this.f[i][j][k];
            ux += this.f[i][j][k] * this.ex[k];
            uy += this.f[i][j][k] * this.ey[k];
          }
        }
        
        if (rho > 0) {
          this.rho[i][j] = rho;
          this.ux[i][j] = ux / rho;
          this.uy[i][j] = uy / rho;
        } else {
          this.rho[i][j] = 1.0;
          this.ux[i][j] = 0;
          this.uy[i][j] = 0;
        }
      }
    }
  }
  
  setObstacles(obstacles: Array<{x: number, y: number, radius: number}>) {
    // Clear existing obstacles
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        this.obstacles[i][j] = false;
      }
    }
    
    // Set new obstacles
    obstacles.forEach(obstacle => {
      const centerX = Math.round(obstacle.x);
      const centerY = Math.round(obstacle.y);
      const radius = Math.ceil(obstacle.radius);
      
      // Ensure bounds are valid
      const minI = Math.max(0, centerX - radius);
      const maxI = Math.min(this.nx - 1, centerX + radius);
      const minJ = Math.max(0, centerY - radius);
      const maxJ = Math.min(this.ny - 1, centerY + radius);
      
      for (let i = minI; i <= maxI; i++) {
        for (let j = minJ; j <= maxJ; j++) {
          // Additional bounds check
          if (i >= 0 && i < this.nx && j >= 0 && j < this.ny) {
            const dist = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);
            if (dist <= radius) {
              this.obstacles[i][j] = true;
            }
          }
        }
      }
    });
  }
  
  updateParameters(params: { viscosity: number; velocity: number; reynolds: number }) {
    this.viscosity = params.viscosity;
    this.velocity = params.velocity;
    this.reynolds = params.reynolds;
    this.omega = 1.0 / (3.0 * this.viscosity + 0.5);
  }
  
  getVelocityField(): number[][] {
    const field = new Array(this.nx);
    for (let i = 0; i < this.nx; i++) {
      field[i] = new Array(this.ny);
      for (let j = 0; j < this.ny; j++) {
        field[i][j] = Math.sqrt(this.ux[i][j] ** 2 + this.uy[i][j] ** 2);
      }
    }
    return field;
  }
  
  getPressureField(): number[][] {
    const field = new Array(this.nx);
    for (let i = 0; i < this.nx; i++) {
      field[i] = new Array(this.ny);
      for (let j = 0; j < this.ny; j++) {
        field[i][j] = this.rho[i][j] / 3.0; // Pressure approximation
      }
    }
    return field;
  }
  
  getVorticity(): number[][] {
    const vorticity = new Array(this.nx);
    for (let i = 0; i < this.nx; i++) {
      vorticity[i] = new Array(this.ny).fill(0);
    }
    
    for (let i = 1; i < this.nx - 1; i++) {
      for (let j = 1; j < this.ny - 1; j++) {
        const dudy = (this.ux[i][j + 1] - this.ux[i][j - 1]) / 2.0;
        const dvdx = (this.uy[i + 1][j] - this.uy[i - 1][j]) / 2.0;
        vorticity[i][j] = dvdx - dudy;
      }
    }
    return vorticity;
  }
  
  getStreamlines(): Array<Array<{x: number, y: number}>> {
    const streamlines: Array<Array<{x: number, y: number}>> = [];
    const stepSize = 0.5;
    const maxSteps = 200;
    
    // Start streamlines from left side
    for (let j = 5; j < this.ny - 5; j += 8) {
      const line: Array<{x: number, y: number}> = [];
      let x = 5;
      let y = j;
      
      for (let step = 0; step < maxSteps; step++) {
        if (x < 0 || x >= this.nx - 1 || y < 0 || y >= this.ny - 1) break;
        
        const i = Math.floor(x);
        const j = Math.floor(y);
        
        // Bounds check
        if (i < 0 || i >= this.nx || j < 0 || j >= this.ny) break;
        if (!this.ux[i] || !this.uy[i] || this.ux[i][j] === undefined || this.uy[i][j] === undefined) break;
        if (this.obstacles[i] && this.obstacles[i][j]) break;
        
        line.push({x, y});
        
        // RK4 integration
        const ux = this.ux[i][j];
        const uy = this.uy[i][j];
        const speed = Math.sqrt(ux * ux + uy * uy);
        
        if (speed < 0.001 || !isFinite(speed)) break;
        
        x += stepSize * ux / speed;
        y += stepSize * uy / speed;
        
        if (!isFinite(x) || !isFinite(y)) break;
      }
      
      if (line.length > 5) {
        streamlines.push(line);
      }
    }
    
    return streamlines;
  }
  
  getMaxVelocity(): number {
    let maxVel = 0;
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        const vel = Math.sqrt(this.ux[i][j] ** 2 + this.uy[i][j] ** 2);
        maxVel = Math.max(maxVel, vel);
      }
    }
    return maxVel;
  }
  
  getPressureDrop(): number {
    let inletPressure = 0;
    let outletPressure = 0;
    let count = 0;
    
    for (let j = 0; j < this.ny; j++) {
      inletPressure += this.rho[5][j] / 3.0;
      outletPressure += this.rho[this.nx - 5][j] / 3.0;
      count++;
    }
    
    return (inletPressure - outletPressure) / count;
  }
  
  getGridWidth(): number {
    return this.nx;
  }
  
  getGridHeight(): number {
    return this.ny;
  }
}
