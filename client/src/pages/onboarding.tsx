import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Droplets, 
  Zap, 
  Eye, 
  BookOpen, 
  Play,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Droplets className="text-primary text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fluid Flow Visualization</h1>
                <p className="text-sm text-muted-foreground">Educational Demonstration</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Simulation</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="secondary">About</Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost">Documentation</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Welcome to the Fluid Flow Visualization</h2>
            <p className="text-xl text-muted-foreground">
              An educational tool for understanding how fluids behave around obstacles
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="text-primary" />
                  What It Does
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>This application simulates 2D fluid flow using the Lattice-Boltzmann Method (LBM), a computational technique that models fluid behavior by tracking particle distributions on a grid.</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Visualize flow patterns around obstacles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Adjust parameters like Reynolds number and velocity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>See real-time computed metrics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="text-primary" />
                  Visualization Modes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Multiple ways to visualize the flow field:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-red-500 mt-0.5" />
                    <span><strong>Velocity Field:</strong> Color-coded flow speed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded bg-green-500 mt-0.5" />
                    <span><strong>Streamlines:</strong> Flow paths through the domain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500 mt-0.5" />
                    <span><strong>Pressure Field:</strong> Pressure distribution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500 mt-0.5" />
                    <span><strong>Vorticity:</strong> Rotational flow regions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" />
                The Lattice-Boltzmann Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Lattice-Boltzmann Method (LBM) is a computational fluid dynamics technique that differs from traditional methods. Instead of solving the Navier-Stokes equations directly, it simulates fluid behavior through particle distributions.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">D2Q9 Lattice</h4>
                  <p className="text-sm text-muted-foreground">
                    2D grid with 9 velocity directions per node, allowing particles to move in all cardinal and diagonal directions.
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Collision Step</h4>
                  <p className="text-sm text-muted-foreground">
                    Particles "collide" and redistribute according to the BGK approximation, relaxing toward equilibrium.
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Streaming Step</h4>
                  <p className="text-sm text-muted-foreground">
                    Particles propagate to neighboring nodes along their velocity directions.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Formula</h4>
                <code className="text-sm bg-white px-2 py-1 rounded">
                  f_new = f - omega * (f - f_eq)
                </code>
                <p className="text-sm text-blue-800 mt-2">
                  Where omega is the relaxation parameter computed from viscosity: omega = 1 / (3 * nu + 0.5)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="text-amber-800">Important Limitations</CardTitle>
            </CardHeader>
            <CardContent className="text-amber-900 space-y-2">
              <p><strong>This is an educational demonstration, not a validated research tool.</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>2D approximation - real flow is 3D</li>
                <li>Rigid obstacle - does not deform or move</li>
                <li>Continuum model - not molecular dynamics</li>
                <li>Normalized units - values are in lattice units, not SI units</li>
              </ul>
              <p className="text-sm mt-3">
                Flow patterns are qualitatively representative. For quantitative analysis, use validated CFD software.
              </p>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Start Simulation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
