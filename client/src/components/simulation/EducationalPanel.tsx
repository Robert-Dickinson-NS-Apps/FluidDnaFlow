import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function EducationalPanel() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Info className="text-primary mr-2 w-5 h-5" />
          Flow Phenomena
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-md">
            <strong>Boundary Layer:</strong> Thin layer near the obstacle surface where viscous effects dominate and velocity transitions from zero (at wall) to free-stream.
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <strong>Wake Formation:</strong> Disturbed flow region downstream where velocity is reduced. At low Re, symmetric; at higher Re, becomes asymmetric.
          </div>
          <div className="p-3 bg-orange-50 rounded-md">
            <strong>Streamline Deflection:</strong> Flow paths curve around the obstacle, accelerating through constrictions (continuity).
          </div>
          <div className="p-3 bg-purple-50 rounded-md">
            <strong>Pressure Gradient:</strong> Higher pressure upstream (stagnation point), lower downstream. This pressure difference creates drag force.
          </div>
          <div className="p-3 bg-red-50 rounded-md">
            <strong>Vortex Shedding:</strong> At Re &gt; ~47, periodic alternating vortices shed from obstacle (von Karman vortex street).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
