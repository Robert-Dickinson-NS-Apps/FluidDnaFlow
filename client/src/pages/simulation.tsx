import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Play, Pause, RotateCcw, Droplets, Share2, Check, Video, X, Crosshair, Columns, Download, Loader2 } from "lucide-react";
import SimulationCanvas from "@/components/simulation/SimulationCanvas";
import ComparisonCanvas from "@/components/simulation/ComparisonCanvas";
import ControlPanel, { presets } from "@/components/simulation/ControlPanel";
import EducationalPanel from "@/components/simulation/EducationalPanel";
import PerformanceMetrics from "@/components/simulation/PerformanceMetrics";
import MethodologyPanel from "@/components/simulation/MethodologyPanel";
import LimitationsDisclaimer from "@/components/simulation/LimitationsDisclaimer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GifRecorder, downloadBlob } from "@/lib/gif-recorder";
import { Slider } from "@/components/ui/slider";

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
  obstacleShape: 'cylinder' | 'square' | 'airfoil' | 'dna';
  showVelocityField: boolean;
  showStreamlines: boolean;
  showPressureField: boolean;
  showVorticity: boolean;
}

export interface ProbeData {
  x: number;
  y: number;
  velocity: number;
  pressure: number;
  vorticity: number;
}

const parseUrlParams = (): Partial<SimulationState> => {
  const params = new URLSearchParams(window.location.search);
  const result: Partial<SimulationState> = {};
  
  const safeParseFloat = (value: string | null, min: number, max: number): number | undefined => {
    if (!value) return undefined;
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < min || parsed > max) return undefined;
    return parsed;
  };
  
  const re = safeParseFloat(params.get('re'), 10, 1000);
  if (re !== undefined) result.reynolds = re;
  
  const v = safeParseFloat(params.get('v'), 0.01, 0.2);
  if (v !== undefined) result.viscosity = v;
  
  const u = safeParseFloat(params.get('u'), 0.1, 5.0);
  if (u !== undefined) result.velocity = u;
  
  const o = safeParseFloat(params.get('o'), 0, 360);
  if (o !== undefined) result.orientation = o;
  
  const validSizes = ['small', 'medium', 'large'];
  const validComplexities = ['simple', 'moderate', 'complex'];
  const validGrids = ['low', 'medium', 'high'];
  
  const size = params.get('size');
  if (size && validSizes.includes(size)) result.dnaSize = size;
  
  const complexity = params.get('complexity');
  if (complexity && validComplexities.includes(complexity)) result.dnaComplexity = complexity;
  
  const grid = params.get('grid');
  if (grid && validGrids.includes(grid)) result.gridResolution = grid;
  
  return result;
};

const buildShareUrl = (state: SimulationState): string => {
  const params = new URLSearchParams();
  params.set('re', state.reynolds.toString());
  params.set('v', state.viscosity.toString());
  params.set('u', state.velocity.toString());
  params.set('o', state.orientation.toString());
  params.set('size', state.dnaSize);
  params.set('complexity', state.dnaComplexity);
  params.set('grid', state.gridResolution);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export default function Simulation() {
  const [, setLocation] = useLocation();
  const [showPhysicalUnits, setShowPhysicalUnits] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [probeData, setProbeData] = useState<ProbeData | null>(null);
  
  const [comparisonMode, setComparisonMode] = useState(false);
  const [reynoldsA, setReynoldsA] = useState(50);
  const [reynoldsB, setReynoldsB] = useState(300);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const gifRecorderRef = useRef<GifRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      gifRecorderRef.current = null;
    };
  }, []);
  
  const [simulationState, setSimulationState] = useState<SimulationState>(() => {
    const urlParams = parseUrlParams();
    return {
      running: false,
      reynolds: urlParams.reynolds ?? 150,
      viscosity: urlParams.viscosity ?? 0.1,
      velocity: urlParams.velocity ?? 2.0,
      orientation: urlParams.orientation ?? 0,
      gridResolution: urlParams.gridResolution ?? "medium",
      timeStep: 0.01,
      dnaSize: urlParams.dnaSize ?? "medium",
      dnaComplexity: urlParams.dnaComplexity ?? "moderate",
      obstacleShape: 'cylinder',
      showVelocityField: true,
      showStreamlines: true,
      showPressureField: false,
      showVorticity: false,
    };
  });

  const [metrics, setMetrics] = useState({
    maxVelocity: 0,
    pressureDrop: 0,
    dragCoefficient: 0,
    computedReynolds: 0,
    fps: 0,
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

  const handleApplyPreset = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets];
    if (preset) {
      setSimulationState(prev => ({
        ...prev,
        reynolds: preset.reynolds,
        viscosity: preset.viscosity,
        velocity: preset.velocity,
      }));
    }
  };

  const handleCopyShareLink = async () => {
    const url = buildShareUrl(simulationState);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearProbe = () => {
    setProbeData(null);
  };

  const handleStartRecording = async () => {
    const canvas = document.querySelector('.simulation-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    gifRecorderRef.current = new GifRecorder({ maxFrames: 60, frameDelay: 100 });
    await gifRecorderRef.current.start(canvas.width, canvas.height);
    setIsRecording(true);
    setRecordingProgress(0);

    if (!simulationState.running) {
      setSimulationState(prev => ({ ...prev, running: true }));
    }

    recordingIntervalRef.current = window.setInterval(() => {
      const recorder = gifRecorderRef.current;
      if (!recorder || !recorder.isRecording()) {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        return;
      }

      const canvas = document.querySelector('.simulation-canvas') as HTMLCanvasElement;
      if (canvas) {
        const added = recorder.addFrame(canvas);
        setRecordingProgress(recorder.getProgress() * 100);
        
        if (!added || recorder.getFrameCount() >= recorder.getMaxFrames()) {
          handleStopRecording();
        }
      }
    }, 100);
  };

  const handleStopRecording = async () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    const recorder = gifRecorderRef.current;
    if (!recorder) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      const blob = await recorder.stop();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      downloadBlob(blob, `fluid-simulation-${timestamp}.gif`);
    } catch (error) {
      console.error('Failed to generate GIF:', error);
    } finally {
      setIsProcessing(false);
      setRecordingProgress(0);
      gifRecorderRef.current = null;
    }
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
              <Droplets className="text-primary text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fluid Flow Visualization</h1>
                <p className="text-sm text-muted-foreground">Educational Demonstration of 2D Laminar Flow</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2">
                <Link href="/">
                  <Button variant="secondary" size="sm">Simulation</Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="ghost" size="sm">About</Button>
                </Link>
                <Link href="/docs">
                  <Button variant="ghost" size="sm">Documentation</Button>
                </Link>
              </nav>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge()}
              </div>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={handleCopyShareLink} variant="outline" size="icon">
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? "Link copied!" : "Copy shareable link"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {probeData && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={handleClearProbe} variant="outline" size="icon">
                              <X className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear probe marker</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => setComparisonMode(!comparisonMode)} 
                            variant={comparisonMode ? "default" : "outline"} 
                            size="icon"
                          >
                            <Columns className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{comparisonMode ? "Exit comparison mode" : "Compare Reynolds numbers"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            variant={isRecording ? "destructive" : "outline"}
                            size="icon"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isRecording ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Video className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isProcessing ? "Processing GIF..." : isRecording ? `Recording ${Math.round(recordingProgress)}%` : "Record GIF"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {isRecording && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-red-500 font-medium flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                        Recording...
                      </span>
                      <span className="text-sm text-muted-foreground">{Math.round(recordingProgress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-100" 
                        style={{ width: `${recordingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {comparisonMode ? (
                  <>
                    <div className="mb-4 p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium">Left: Re = {reynoldsA}</Label>
                          <Slider
                            value={[reynoldsA]}
                            onValueChange={([v]) => setReynoldsA(v)}
                            min={10}
                            max={500}
                            step={10}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Right: Re = {reynoldsB}</Label>
                          <Slider
                            value={[reynoldsB]}
                            onValueChange={([v]) => setReynoldsB(v)}
                            min={10}
                            max={500}
                            step={10}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                    <ComparisonCanvas
                      simulationState={simulationState}
                      reynoldsA={reynoldsA}
                      reynoldsB={reynoldsB}
                    />
                  </>
                ) : (
                  <SimulationCanvas
                    simulationState={simulationState}
                    onMetricsUpdate={setMetrics}
                    onProbe={setProbeData}
                    probeData={probeData}
                  />
                )}

                {/* Visualization Controls */}
                <div className="mt-6 bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Visualization Options</h3>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="unit-toggle" className="text-sm text-muted-foreground">
                        {showPhysicalUnits ? "Physical Units" : "Lattice Units"}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Switch
                                id="unit-toggle"
                                checked={showPhysicalUnits}
                                onCheckedChange={setShowPhysicalUnits}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Toggle between lattice units (simulation native) and approximate physical units (with assumed scaling)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
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
              onApplyPreset={handleApplyPreset}
            />
            <EducationalPanel />
          </div>
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics metrics={metrics} reynolds={simulationState.reynolds} showPhysicalUnits={showPhysicalUnits} />

        {/* Methodology and Limitations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MethodologyPanel />
          <LimitationsDisclaimer />
        </div>
      </div>
    </div>
  );
}
