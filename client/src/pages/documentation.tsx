import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { Droplets, Code, FileCode, ChevronRight, Loader2, FolderOpen } from "lucide-react";

interface SourceFile {
  path: string;
  name: string;
  category: string;
}

interface FileContent {
  filename: string;
  path: string;
  content: string;
}

export default function Documentation() {
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    fetch("/api/source-files")
      .then((res) => res.json())
      .then((files: SourceFile[]) => {
        setSourceFiles(files);
        if (files.length > 0) {
          setSelectedFile(files[0].name);
        }
        setLoadingFiles(false);
      })
      .catch(() => setLoadingFiles(false));
  }, []);

  useEffect(() => {
    if (!selectedFile) return;

    setLoading(true);
    fetch(`/api/source-file/${encodeURIComponent(selectedFile)}`)
      .then((res) => res.json())
      .then((data: FileContent) => {
        setFileContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedFile]);

  const groupedFiles = sourceFiles.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {} as Record<string, SourceFile[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Droplets className="text-primary text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fluid Flow Visualization</h1>
                <p className="text-sm text-muted-foreground">Documentation & Source Code</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Simulation</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary">Documentation</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Source Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedFiles).map(([category, files]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                        <FolderOpen className="w-4 h-4" />
                        {category}
                      </div>
                      <div className="space-y-1 ml-2">
                        {files.map((file) => (
                          <button
                            key={file.name}
                            onClick={() => setSelectedFile(file.name)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                              selectedFile === file.name
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                selectedFile === file.name ? "rotate-90" : ""
                              }`}
                            />
                            {file.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                {fileContent?.path || "Select a file"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : fileContent ? (
                <ScrollArea className="h-[600px] w-full rounded-md border">
                  <pre className="p-4 text-sm font-mono bg-slate-950 text-slate-50 overflow-x-auto whitespace-pre">
                    <code>{fileContent.content}</code>
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  Select a file to view its source code
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Simulation Engine</h4>
                <p className="text-sm text-muted-foreground">
                  The <code className="bg-background px-1 rounded">LatticeBotzmann</code> class implements the D2Q9 lattice with BGK collision operator. It handles collision, streaming, boundary conditions, and macroscopic quantity computation.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Geometry System</h4>
                <p className="text-sm text-muted-foreground">
                  The <code className="bg-background px-1 rounded">DNAGeometry</code> class generates obstacle configurations with configurable size, complexity, and orientation. Obstacles are represented as circles on the grid.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Visualization</h4>
                <p className="text-sm text-muted-foreground">
                  The <code className="bg-background px-1 rounded">SimulationCanvas</code> renders velocity fields, streamlines, pressure, and vorticity using HTML5 Canvas. Metrics are computed and displayed in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Key Algorithms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Collision Step (BGK)</h4>
                <code className="text-sm bg-white px-2 py-1 rounded block">
                  f[i][j][k] = f[i][j][k] - omega * (f[i][j][k] - f_eq)
                </code>
                <p className="text-sm text-blue-800 mt-2">
                  Where omega = 1 / (3 * viscosity + 0.5) is the relaxation parameter
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Equilibrium Distribution</h4>
                <code className="text-sm bg-white px-2 py-1 rounded block">
                  f_eq = rho * w[k] * (1 + 3*cu + 4.5*cu^2 - 1.5*u^2)
                </code>
                <p className="text-sm text-green-800 mt-2">
                  Where cu = e[k] · u is the dot product of lattice velocity and macroscopic velocity
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Pressure Calculation</h4>
                <code className="text-sm bg-white px-2 py-1 rounded block">
                  p = rho * cs^2 = rho / 3
                </code>
                <p className="text-sm text-purple-800 mt-2">
                  In LBM, pressure is proportional to density with sound speed cs^2 = 1/3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
