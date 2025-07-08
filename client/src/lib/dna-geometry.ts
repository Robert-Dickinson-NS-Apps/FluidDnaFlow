interface DNAGeometryOptions {
  size: string;
  complexity: string;
  orientation: number;
  gridWidth: number;
  gridHeight: number;
}

export class DNAGeometry {
  private size: string;
  private complexity: string;
  private orientation: number;
  private gridWidth: number;
  private gridHeight: number;
  private obstacles: Array<{x: number, y: number, radius: number}>;
  
  constructor(options: DNAGeometryOptions) {
    this.size = options.size;
    this.complexity = options.complexity;
    this.orientation = options.orientation;
    this.gridWidth = options.gridWidth;
    this.gridHeight = options.gridHeight;
    this.obstacles = [];
    
    this.generateDNAStructure();
  }
  
  generateDNAStructure() {
    this.obstacles = [];
    
    // Base parameters
    const centerX = this.gridWidth * 0.25;
    const centerY = this.gridHeight * 0.5;
    
    // Size-dependent parameters
    let baseRadius = 2;
    let numSegments = 5;
    let segmentSpacing = 3;
    
    switch (this.size) {
      case 'small':
        baseRadius = 1.5;
        numSegments = 3;
        segmentSpacing = 2;
        break;
      case 'medium':
        baseRadius = 2;
        numSegments = 5;
        segmentSpacing = 3;
        break;
      case 'large':
        baseRadius = 2.5;
        numSegments = 7;
        segmentSpacing = 4;
        break;
    }
    
    // Complexity-dependent variations
    let radiusVariation = 0;
    let positionVariation = 0;
    
    switch (this.complexity) {
      case 'simple':
        radiusVariation = 0;
        positionVariation = 0;
        break;
      case 'moderate':
        radiusVariation = 0.3;
        positionVariation = 0.5;
        break;
      case 'complex':
        radiusVariation = 0.5;
        positionVariation = 1.0;
        break;
    }
    
    // Generate DNA segments
    for (let i = 0; i < numSegments; i++) {
      const t = i / (numSegments - 1);
      
      // Base helix pattern
      const helixRadius = segmentSpacing * 0.3;
      const helixFreq = 2 * Math.PI * 2; // 2 complete turns
      
      const baseX = centerX + t * segmentSpacing * (numSegments - 1) * 0.5;
      const baseY = centerY + helixRadius * Math.sin(t * helixFreq);
      
      // Apply orientation rotation
      const rotatedX = centerX + (baseX - centerX) * Math.cos(this.orientation * Math.PI / 180) - 
                      (baseY - centerY) * Math.sin(this.orientation * Math.PI / 180);
      const rotatedY = centerY + (baseX - centerX) * Math.sin(this.orientation * Math.PI / 180) + 
                      (baseY - centerY) * Math.cos(this.orientation * Math.PI / 180);
      
      // Add position variation
      const varX = rotatedX + positionVariation * (Math.random() - 0.5);
      const varY = rotatedY + positionVariation * (Math.random() - 0.5);
      
      // Add radius variation
      const radius = baseRadius + radiusVariation * (Math.random() - 0.5);
      
      // Main strand segments
      this.obstacles.push({
        x: Math.max(radius, Math.min(this.gridWidth - radius, varX)),
        y: Math.max(radius, Math.min(this.gridHeight - radius, varY)),
        radius: radius
      });
      
      // Complementary strand (for double helix effect)
      if (this.complexity !== 'simple') {
        const compY = centerY - helixRadius * Math.sin(t * helixFreq);
        const compRotatedX = centerX + (baseX - centerX) * Math.cos(this.orientation * Math.PI / 180) - 
                            (compY - centerY) * Math.sin(this.orientation * Math.PI / 180);
        const compRotatedY = centerY + (baseX - centerX) * Math.sin(this.orientation * Math.PI / 180) + 
                            (compY - centerY) * Math.cos(this.orientation * Math.PI / 180);
        
        const compVarX = compRotatedX + positionVariation * (Math.random() - 0.5);
        const compVarY = compRotatedY + positionVariation * (Math.random() - 0.5);
        const compRadius = baseRadius * 0.8 + radiusVariation * (Math.random() - 0.5);
        
        this.obstacles.push({
          x: Math.max(compRadius, Math.min(this.gridWidth - compRadius, compVarX)),
          y: Math.max(compRadius, Math.min(this.gridHeight - compRadius, compVarY)),
          radius: compRadius
        });
      }
    }
    
    // Add cross-links for complex structures
    if (this.complexity === 'complex') {
      for (let i = 0; i < numSegments - 1; i++) {
        const segment1 = this.obstacles[i * 2];
        const segment2 = this.obstacles[(i + 1) * 2];
        
        // Add intermediate linking segments
        const linkX = (segment1.x + segment2.x) / 2;
        const linkY = (segment1.y + segment2.y) / 2 + 0.5 * (Math.random() - 0.5);
        
        this.obstacles.push({
          x: Math.max(1, Math.min(this.gridWidth - 1, linkX)),
          y: Math.max(1, Math.min(this.gridHeight - 1, linkY)),
          radius: baseRadius * 0.5
        });
      }
    }
  }
  
  setOrientation(orientation: number) {
    this.orientation = orientation;
    this.generateDNAStructure();
  }
  
  getObstacles(): Array<{x: number, y: number, radius: number}> {
    return this.obstacles;
  }
  
  updateSize(size: string) {
    this.size = size;
    this.generateDNAStructure();
  }
  
  updateComplexity(complexity: string) {
    this.complexity = complexity;
    this.generateDNAStructure();
  }
}
