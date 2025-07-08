import { Card, CardContent } from "@/components/ui/card";

interface PerformanceMetricsProps {
  metrics: {
    maxVelocity: number;
    pressureDrop: number;
    fps: number;
  };
  reynolds: number;
}

export default function PerformanceMetrics({ metrics, reynolds }: PerformanceMetricsProps) {
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">{metrics.maxVelocity.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Max Velocity (m/s)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary font-mono">{metrics.pressureDrop.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">Pressure Drop (Pa)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent font-mono">{reynolds.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Reynolds Number</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 font-mono">{metrics.fps}</div>
            <div className="text-sm text-muted-foreground">FPS</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
