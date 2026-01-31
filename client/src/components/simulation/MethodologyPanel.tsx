import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MethodologyPanel() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <BookOpen className="text-primary mr-2 w-5 h-5" />
          Simulation Method
        </h3>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="lattice">
            <AccordionTrigger className="text-sm">Grid Structure</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <strong>D2Q9 Lattice:</strong> Two-dimensional grid with 9 discrete velocity directions per node. This is the standard lattice configuration for 2D incompressible flow simulation.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="collision">
            <AccordionTrigger className="text-sm">Collision Model</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <strong>BGK Approximation:</strong> Single-relaxation-time collision operator (Bhatnagar-Gross-Krook). The relaxation parameter omega is computed from viscosity: omega = 1 / (3 * nu + 0.5).
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="boundary">
            <AccordionTrigger className="text-sm">Boundary Conditions</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <div><strong>Inlet (left):</strong> Equilibrium distribution at specified velocity</div>
              <div><strong>Outlet (right):</strong> Zero-gradient (convective) boundary</div>
              <div><strong>Walls (top/bottom):</strong> Bounce-back for no-slip condition</div>
              <div><strong>Obstacle:</strong> Full-way bounce-back (solid boundary)</div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="algorithm">
            <AccordionTrigger className="text-sm">Algorithm Steps</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-1">
              <div>1. Collision: f = f - omega * (f - f_eq)</div>
              <div>2. Streaming: Propagate distributions to neighbors</div>
              <div>3. Boundary: Apply inlet/outlet/wall conditions</div>
              <div>4. Macroscopic: Compute rho, u from moments</div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="validation">
            <AccordionTrigger className="text-sm">Validation Notes</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Flow past a cylinder exhibits well-documented behavior: steady symmetric wake at Re &lt; 5, steady asymmetric wake at 5 &lt; Re &lt; 47, and periodic vortex shedding (von Karman street) at Re &gt; 47. This simulation demonstrates these qualitative behaviors.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
