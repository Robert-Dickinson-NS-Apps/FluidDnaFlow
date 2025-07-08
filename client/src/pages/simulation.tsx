import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, HelpCircle, Dna } from "lucide-react";
import SimulationCanvas from "@/components/simulation/SimulationCanvas";
import ControlPanel from "@/components/simulation/ControlPanel";
import EducationalPanel from "@/components/simulation/EducationalPanel";
import PerformanceMetrics from "@/components/simulation/PerformanceMetrics";

export interface SimulationState {
  running: boolean;
  reynolds: number;
  viscosity: number;
  velocity: number;
  orientation: number;
  gridResolution: string;
  timeStep: number;
  dnaSize: string;
  dnaComplexity: string;
  showVelocityField: boolean;
  showStreamlines: boolean;
  showPressureField: boolean;
  showVorticity: boolean;
}

export default function Simulation() {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    running: false,
    reynolds: 150,
    viscosity: 0.1,
    velocity: 2.0,
    orientation: 0,
    gridResolution: "medium",
    timeStep: 0.01,
    dnaSize: "medium",
    dnaComplexity: "moderate",
    showVelocityField: true,
    showStreamlines: true,
    showPressureField: false,
    showVorticity: false,
  });

  const [metrics, setMetrics] = useState({
    maxVelocity: 2.45,
    pressureDrop: 0.12,
    fps: 60,
  });

  const handleStart = () => {
    setSimulationState(prev => ({ ...prev, running: true }));
  };

  const handlePause = () => {
    setSimulationState(prev => ({ ...prev, running: false }));
  };

  const handleReset = () => {
    setSimulationState(prev => ({
      ...prev,
      running: false,
      reynolds: 150,
      viscosity: 0.1,
      velocity: 2.0,
      orientation: 0,
    }));
  };

  const handleParameterChange = (parameter: keyof SimulationState, value: any) => {
    setSimulationState(prev => ({ ...prev, [parameter]: value }));
  };

  const getStatusBadge = () => {
    if (simulationState.running) {
      return <Badge className="bg-green-600">Running</Badge>;
    }
    return <Badge className="bg-blue-600">Ready</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Dna className="text-primary text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CFD Simulation</h1>
                <p className="text-sm text-muted-foreground">2D Laminar Flow around DNA Molecule</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge()}
              </div>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Simulation Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Simulation Viewport</h2>
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleStart} className="bg-primary hover:bg-primary/90">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                    <Button onClick={handlePause} variant="secondary">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button onClick={handleReset} className="bg-accent hover:bg-accent/90">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <SimulationCanvas
                  simulationState={simulationState}
                  onMetricsUpdate={setMetrics}
                />

                {/* Visualization Controls */}
                <div className="mt-6 bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Visualization Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={simulationState.showVelocityField}
                        onChange={(e) => handleParameterChange('showVelocityField', e.target.checked)}
                        className="text-primary"
                      />
                      <span className="text-sm">Velocity Field</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={simulationState.showStreamlines}
                        onChange={(e) => handleParameterChange('showStreamlines', e.target.checked)}
                        className="text-primary"
                      />
                      <span className="text-sm">Streamlines</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={simulationState.showPressureField}
                        onChange={(e) => handleParameterChange('showPressureField', e.target.checked)}
                        className="text-primary"
                      />
                      <span className="text-sm">Pressure Field</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={simulationState.showVorticity}
                        onChange={(e) => handleParameterChange('showVorticity', e.target.checked)}
                        className="text-primary"
                      />
                      <span className="text-sm">Vorticity</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel
              simulationState={simulationState}
              onParameterChange={handleParameterChange}
            />
            <EducationalPanel />
          </div>
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics metrics={metrics} reynolds={simulationState.reynolds} />
      </div>
    </div>
  );
}
