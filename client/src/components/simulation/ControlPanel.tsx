import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SimulationState } from "@/pages/simulation";
import { HelpCircle, Zap } from "lucide-react";

interface ControlPanelProps {
  simulationState: SimulationState;
  onParameterChange: (parameter: keyof SimulationState, value: any) => void;
  onApplyPreset: (preset: string) => void;
}

const presets = {
  laminar: { name: "Laminar Flow", reynolds: 50, viscosity: 0.15, velocity: 1.0, description: "Smooth, layered flow at low Re" },
  vortex: { name: "Vortex Street", reynolds: 200, viscosity: 0.08, velocity: 2.5, description: "Kármán vortex shedding pattern" },
  turbulent: { name: "High Re Turbulence", reynolds: 800, viscosity: 0.02, velocity: 4.0, description: "Chaotic flow at high Re" },
};

const tooltips = {
  reynolds: "Reynolds number (Re) = inertial forces / viscous forces. Low Re (<100) = laminar flow, High Re (>500) = turbulent tendencies.",
  viscosity: "Kinematic viscosity (ν) measures fluid's resistance to flow. Higher viscosity = more 'thick' or 'syrupy' fluid.",
  velocity: "Inlet velocity determines how fast fluid enters the domain. Higher velocity increases Reynolds number.",
  orientation: "Rotates the obstacle geometry. Affects flow separation and wake patterns.",
};

export default function ControlPanel({ simulationState, onParameterChange, onApplyPreset }: ControlPanelProps) {
  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
          
          <div className="mb-6">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Quick Presets
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => onApplyPreset(key)}
                >
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Reynolds Number <span className="text-gray-500">(Re)</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 cursor-help text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{tooltips.reynolds}</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            <input
              type="range"
              className="parameter-slider w-full"
              min="10"
              max="1000"
              value={simulationState.reynolds}
              onChange={(e) => onParameterChange('reynolds', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10</span>
              <span>1000</span>
            </div>
            <div className="mt-2 text-sm font-mono">
              Current: <span>{simulationState.reynolds}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              Viscosity <span className="text-gray-500">(ν)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 cursor-help text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltips.viscosity}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <input
              type="range"
              className="parameter-slider w-full"
              min="0.01"
              max="0.2"
              step="0.01"
              value={simulationState.viscosity}
              onChange={(e) => onParameterChange('viscosity', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.01</span>
              <span>0.2</span>
            </div>
            <div className="mt-2 text-sm font-mono">
              Current: <span>{simulationState.viscosity}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              Inlet Velocity <span className="text-gray-500">(lattice units)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 cursor-help text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltips.velocity}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <input
              type="range"
              className="parameter-slider w-full"
              min="0.1"
              max="5.0"
              step="0.1"
              value={simulationState.velocity}
              onChange={(e) => onParameterChange('velocity', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.1</span>
              <span>5.0</span>
            </div>
            <div className="mt-2 text-sm font-mono">
              Current: <span>{simulationState.velocity}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              Obstacle Orientation <span className="text-gray-500">(degrees)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 cursor-help text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltips.orientation}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <input
              type="range"
              className="parameter-slider w-full"
              min="0"
              max="360"
              value={simulationState.orientation}
              onChange={(e) => onParameterChange('orientation', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0°</span>
              <span>360°</span>
            </div>
            <div className="mt-2 text-sm font-mono">
              Current: <span>{simulationState.orientation}</span>°
            </div>
          </div>
        </div>
        
        {/* DNA Geometry Controls */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">DNA Geometry</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Molecule Size</Label>
              <Select value={simulationState.dnaSize} onValueChange={(value) => onParameterChange('dnaSize', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (λ-DNA)</SelectItem>
                  <SelectItem value="medium">Medium (Plasmid)</SelectItem>
                  <SelectItem value="large">Large (Chromosome)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Shape Complexity</Label>
              <Select value={simulationState.dnaComplexity} onValueChange={(value) => onParameterChange('dnaComplexity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Simulation Settings */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Simulation Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Grid Resolution</Label>
              <Select value={simulationState.gridResolution} onValueChange={(value) => onParameterChange('gridResolution', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (100x50)</SelectItem>
                  <SelectItem value="medium">Medium (200x100)</SelectItem>
                  <SelectItem value="high">High (400x200)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Time Step</Label>
              <Input
                type="number"
                value={simulationState.timeStep}
                onChange={(e) => onParameterChange('timeStep', parseFloat(e.target.value))}
                step="0.001"
                min="0.001"
                max="0.1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}

export { presets };
