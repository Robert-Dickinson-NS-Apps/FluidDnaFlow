import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get source code files for documentation
  app.get("/api/source-files", (_req, res) => {
    const sourceFiles = [
      { path: "client/src/lib/lattice-boltzmann.ts", name: "lattice-boltzmann.ts", category: "Simulation Engine" },
      { path: "client/src/lib/dna-geometry.ts", name: "dna-geometry.ts", category: "Simulation Engine" },
      { path: "client/src/components/simulation/SimulationCanvas.tsx", name: "SimulationCanvas.tsx", category: "Components" },
      { path: "client/src/components/simulation/ControlPanel.tsx", name: "ControlPanel.tsx", category: "Components" },
      { path: "client/src/components/simulation/PerformanceMetrics.tsx", name: "PerformanceMetrics.tsx", category: "Components" },
      { path: "client/src/components/simulation/EducationalPanel.tsx", name: "EducationalPanel.tsx", category: "Components" },
      { path: "client/src/components/simulation/MethodologyPanel.tsx", name: "MethodologyPanel.tsx", category: "Components" },
      { path: "client/src/components/simulation/LimitationsDisclaimer.tsx", name: "LimitationsDisclaimer.tsx", category: "Components" },
      { path: "client/src/pages/simulation.tsx", name: "simulation.tsx", category: "Pages" },
      { path: "client/src/pages/onboarding.tsx", name: "onboarding.tsx", category: "Pages" },
      { path: "client/src/pages/documentation.tsx", name: "documentation.tsx", category: "Pages" },
      { path: "client/src/App.tsx", name: "App.tsx", category: "Core" },
    ];
    res.json(sourceFiles);
  });

  app.get("/api/source-file/:filename", (req, res) => {
    const filename = req.params.filename;
    const allowedFiles: Record<string, string> = {
      "lattice-boltzmann.ts": "client/src/lib/lattice-boltzmann.ts",
      "dna-geometry.ts": "client/src/lib/dna-geometry.ts",
      "SimulationCanvas.tsx": "client/src/components/simulation/SimulationCanvas.tsx",
      "ControlPanel.tsx": "client/src/components/simulation/ControlPanel.tsx",
      "PerformanceMetrics.tsx": "client/src/components/simulation/PerformanceMetrics.tsx",
      "EducationalPanel.tsx": "client/src/components/simulation/EducationalPanel.tsx",
      "MethodologyPanel.tsx": "client/src/components/simulation/MethodologyPanel.tsx",
      "LimitationsDisclaimer.tsx": "client/src/components/simulation/LimitationsDisclaimer.tsx",
      "simulation.tsx": "client/src/pages/simulation.tsx",
      "onboarding.tsx": "client/src/pages/onboarding.tsx",
      "documentation.tsx": "client/src/pages/documentation.tsx",
      "App.tsx": "client/src/App.tsx",
    };

    const filePath = allowedFiles[filename];
    if (!filePath) {
      return res.status(404).json({ error: "File not found" });
    }

    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const content = fs.readFileSync(absolutePath, "utf-8");
      res.json({ filename, path: filePath, content });
    } catch (error) {
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
