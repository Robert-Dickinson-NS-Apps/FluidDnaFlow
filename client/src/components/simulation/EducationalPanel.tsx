import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function EducationalPanel() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Info className="text-primary mr-2" />
          Flow Phenomena
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-md">
            <strong>Boundary Layer:</strong> Thin layer of fluid near DNA surface where viscous effects dominate.
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <strong>Wake Formation:</strong> Disturbed flow region downstream of the DNA obstacle.
          </div>
          <div className="p-3 bg-orange-50 rounded-md">
            <strong>Streamline Deflection:</strong> Flow paths bend around the DNA molecule.
          </div>
          <div className="p-3 bg-purple-50 rounded-md">
            <strong>Pressure Gradient:</strong> Higher pressure upstream, lower pressure downstream.
          </div>
          <div className="p-3 bg-red-50 rounded-md">
            <strong>Vortex Shedding:</strong> Periodic vortices form at higher Reynolds numbers.
          </div>
          <div className="p-3 bg-indigo-50 rounded-md">
            <strong>Lattice-Boltzmann:</strong> Particle-based method simulating fluid as distribution functions.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
