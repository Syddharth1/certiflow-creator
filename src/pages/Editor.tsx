import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, IText, util, Image as FabricImage } from "fabric";
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Image as ImageIcon, 
  Download, 
  Save, 
  Undo, 
  Redo,
  Palette,
  Upload,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import QRCodeGenerator from "qrcode";

const Editor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [activeTool, setActiveTool] = useState<"select" | "text" | "rectangle" | "circle" | "image">("select");
  const [selectedObject, setSelectedObject] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Add default certificate border
    const border = new Rect({
      left: 20,
      top: 20,
      width: 760,
      height: 560,
      fill: "transparent",
      stroke: "#d4af37",
      strokeWidth: 4,
      selectable: false,
      evented: false,
    });
    canvas.add(border);

    // Add default title
    const title = new IText("Certificate of Achievement", {
      left: 400,
      top: 150,
      fontSize: 36,
      fontFamily: "Playfair Display",
      fill: "#1e293b",
      textAlign: "center",
      originX: "center",
    });
    canvas.add(title);

    // Selection event handler
    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    setFabricCanvas(canvas);
    toast("Certificate editor ready! Start designing your certificate.");

    return () => {
      canvas.dispose();
    };
  }, []);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 150,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 75,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === "text") {
      const text = new IText("Your text here", {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: activeColor,
        fontFamily: "Inter",
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    }

    fabricCanvas.renderAll();
  };

  const handleAddQRCode = async () => {
    if (!fabricCanvas) return;

    try {
      const qrCodeData = "https://certverify.com/verify/CERT-2024-001";
      const qrCodeUrl = await QRCodeGenerator.toDataURL(qrCodeData, {
        width: 100,
        margin: 1,
      });

      util.loadImage(qrCodeUrl).then((img) => {
        const qrCode = new FabricImage(img, {
          left: 650,
          top: 450,
          scaleX: 1,
          scaleY: 1,
        });
        fabricCanvas.add(qrCode);
        fabricCanvas.renderAll();
      });

      toast("QR code added! Recipients can scan to verify authenticity.");
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      util.loadImage(imageUrl).then((img) => {
        const fabricImage = new FabricImage(img, {
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        fabricCanvas.add(fabricImage);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    toast("Image uploaded successfully!");
  };

  const handleExportPDF = () => {
    if (!fabricCanvas) return;
    
    // In a real implementation, we'd use jsPDF here
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    
    // Create download link
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = dataURL;
    link.click();
    
    toast("Certificate exported successfully!");
  };

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !fabricCanvas) return;

    selectedObject.set(property, value);
    fabricCanvas.renderAll();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex h-screen">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-display font-bold mb-6">Certificate Editor</h2>
            
            <Tabs defaultValue="tools" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="tools" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={activeTool === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("text")}
                        className="flex items-center gap-2"
                      >
                        <Type className="h-4 w-4" />
                        Text
                      </Button>
                      <Button
                        variant={activeTool === "rectangle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("rectangle")}
                        className="flex items-center gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Rectangle
                      </Button>
                      <Button
                        variant={activeTool === "circle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("circle")}
                        className="flex items-center gap-2"
                      >
                        <CircleIcon className="h-4 w-4" />
                        Circle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddQRCode}
                        className="flex items-center gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        QR Code
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Color</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                {selectedObject && selectedObject.type === "i-text" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Text Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={selectedObject.fontSize || 24}
                          onChange={(e) => updateObjectProperty("fontSize", parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <select
                          className="w-full p-2 border border-border rounded"
                          value={selectedObject.fontFamily || "Inter"}
                          onChange={(e) => updateObjectProperty("fontFamily", e.target.value)}
                        >
                          <option value="Inter">Inter</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                        </select>
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={selectedObject.fill || "#000000"}
                          onChange={(e) => updateObjectProperty("fill", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Certificate Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-[4/3] bg-gradient-primary rounded border cursor-pointer p-2 text-white text-xs text-center flex items-center justify-center">
                        Modern Blue
                      </div>
                      <div className="aspect-[4/3] bg-gradient-gold rounded border cursor-pointer p-2 text-accent-gold-foreground text-xs text-center flex items-center justify-center">
                        Classic Gold
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" className="btn-hero" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-8 overflow-auto bg-muted/20">
            <div className="flex items-center justify-center min-h-full">
              <div className="bg-white rounded-lg shadow-strong">
                <canvas ref={canvasRef} className="max-w-full max-h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;