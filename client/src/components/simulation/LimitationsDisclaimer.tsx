import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function LimitationsDisclaimer() {
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center text-amber-800">
          <AlertTriangle className="mr-2 w-5 h-5" />
          Important Limitations
        </h3>
        
        <div className="space-y-2 text-sm text-amber-900">
          <p>
            <strong>Educational Purpose:</strong> This is a conceptual visualization for learning about fluid dynamics, not a validated research tool.
          </p>
          
          <div className="bg-white/60 rounded p-3 space-y-1.5">
            <div className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span><strong>2D Approximation:</strong> Real fluid flow is three-dimensional</span>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span><strong>Rigid Obstacle:</strong> The obstacle shape does not deform or move</span>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span><strong>Continuum Model:</strong> Uses macro-scale physics, not molecular dynamics</span>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span><strong>Simplified Geometry:</strong> Obstacle represents a generic shape, not actual molecular structure</span>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span><strong>Normalized Units:</strong> Values shown are in lattice units, not physical SI units</span>
            </div>
          </div>
          
          <p className="text-xs text-amber-700 mt-2">
            Flow patterns shown are qualitatively representative of real fluid behavior. For quantitative analysis, use validated CFD software with proper mesh refinement studies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
