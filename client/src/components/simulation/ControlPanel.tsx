import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SimulationState } from "@/pages/simulation";

interface ControlPanelProps {
  simulationState: SimulationState;
  onParameterChange: (parameter: keyof SimulationState, value: any) => void;
}

export default function ControlPanel({ simulationState, onParameterChange }: ControlPanelProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Simulation Parameters</h2>
        
        {/* Flow Parameters */}
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Reynolds Number <span className="text-gray-500">(Re)</span>
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
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Viscosity <span className="text-gray-500">(ν)</span>
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
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Inlet Velocity <span className="text-gray-500">(m/s)</span>
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
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              DNA Orientation <span className="text-gray-500">(degrees)</span>
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
  );
}
