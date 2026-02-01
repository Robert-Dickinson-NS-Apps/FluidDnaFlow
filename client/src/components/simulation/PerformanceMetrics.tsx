import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface PerformanceMetricsProps {
  metrics: {
    maxVelocity: number;
    pressureDrop: number;
    dragCoefficient: number;
    computedReynolds: number;
    fps: number;
  };
  reynolds: number;
  showPhysicalUnits?: boolean;
}

const PHYSICAL_SCALE = {
  length: 0.001,
  velocity: 0.01,
  pressure: 1000,
};

export default function PerformanceMetrics({ metrics, reynolds, showPhysicalUnits = false }: PerformanceMetricsProps) {
  const safeMetrics = {
    maxVelocity: metrics?.maxVelocity ?? 0,
    pressureDrop: metrics?.pressureDrop ?? 0,
    dragCoefficient: metrics?.dragCoefficient ?? 0,
    computedReynolds: metrics?.computedReynolds ?? 0,
    fps: metrics?.fps ?? 0,
  };

  const displayVelocity = showPhysicalUnits 
    ? (safeMetrics.maxVelocity * PHYSICAL_SCALE.velocity).toFixed(4)
    : safeMetrics.maxVelocity.toFixed(3);
  
  const displayPressure = showPhysicalUnits
    ? (safeMetrics.pressureDrop * PHYSICAL_SCALE.pressure).toFixed(2)
    : (safeMetrics.pressureDrop * 10000).toFixed(2);

  const velocityUnit = showPhysicalUnits ? "m/s" : "lu/ts";
  const pressureUnit = showPhysicalUnits ? "Pa" : "x10⁻⁴ lu";

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Computed Flow Metrics</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {showPhysicalUnits ? "Physical Units (approx.)" : "Lattice Units"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <TooltipProvider>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary font-mono">{displayVelocity}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Max Velocity ({velocityUnit})
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Maximum velocity magnitude in the flow field. Higher values indicate flow acceleration through constrictions.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary font-mono">{displayPressure}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Pressure Drop ({pressureUnit})
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Pressure difference (inlet - outlet) in lattice units (p = rho/3). Non-zero values show the obstacle creates flow resistance.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 font-mono">{safeMetrics.dragCoefficient.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Drag Coefficient
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Estimated drag coefficient (Cd). For a cylinder at Re~100, expected Cd is around 1.0-1.5.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent font-mono">{safeMetrics.computedReynolds.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Computed Re
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Reynolds number computed from actual flow velocity and obstacle size. Input Re: {reynolds.toFixed(0)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 font-mono">{safeMetrics.fps}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                FPS
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Frames per second. Higher values indicate smoother visualization.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
