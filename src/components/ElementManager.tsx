import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, Trash2 } from "lucide-react";

interface Element {
  id: string;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
}

interface ElementManagerProps {
  onAddElement: (imageUrl: string, title: string) => void;
}

export const ElementManager = ({ onAddElement }: ElementManagerProps) => {
  const { user, isAdmin } = useAuth();
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newElement, setNewElement] = useState({
    title: "",
    category: "general",
    file: null as File | null
  });
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "general", "medals", "ribbons", "crowns", "seals", "badges", "decorative"];

  useEffect(() => {
    fetchElements();
  }, []);

  const fetchElements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("elements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error("Error fetching elements:", error);
      toast.error("Failed to load elements");
    } finally {
      setLoading(false);
    }
  };

  const uploadElement = async () => {
    if (!newElement.file || !newElement.title || !isAdmin) return;

    setUploading(true);
    try {
      // Upload image to storage
      const fileExt = newElement.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("elements")
        .upload(fileName, newElement.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("elements")
        .getPublicUrl(fileName);

      // Save element to database
      const { error: dbError } = await supabase
        .from("elements")
        .insert({
          title: newElement.title,
          category: newElement.category,
          image_url: publicUrl,
          created_by: user?.id
        });

      if (dbError) throw dbError;

      toast.success("Element uploaded successfully!");
      setNewElement({ title: "", category: "general", file: null });
      fetchElements();
    } catch (error) {
      console.error("Error uploading element:", error);
      toast.error("Failed to upload element");
    } finally {
      setUploading(false);
    }
  };

  const deleteElement = async (elementId: string, imageUrl: string) => {
    if (!isAdmin) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("elements")
        .delete()
        .eq("id", elementId);

      if (dbError) throw dbError;

      // Delete from storage
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from("elements")
          .remove([fileName]);
      }

      toast.success("Element deleted successfully!");
      fetchElements();
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error("Failed to delete element");
    }
  };

  const filteredElements = selectedCategory === "all" 
    ? elements 
    : elements.filter(el => el.category === selectedCategory);

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload New Element</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="element-title">Title</Label>
              <Input
                id="element-title"
                value={newElement.title}
                onChange={(e) => setNewElement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Element name"
              />
            </div>
            
            <div>
              <Label htmlFor="element-category">Category</Label>
              <Select 
                value={newElement.category} 
                onValueChange={(value) => setNewElement(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="element-file">Image File</Label>
              <Input
                id="element-file"
                type="file"
                accept="image/*"
                onChange={(e) => setNewElement(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
            </div>

            <Button 
              onClick={uploadElement}
              disabled={!newElement.file || !newElement.title || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Element"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Design Elements</CardTitle>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading elements...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {filteredElements.map((element) => (
                <div key={element.id} className="relative group">
                  <Button
                    variant="outline"
                    className="w-full h-16 p-2 flex flex-col items-center justify-center relative"
                    onClick={() => onAddElement(element.image_url, element.title)}
                  >
                    <img 
                      src={element.image_url} 
                      alt={element.title}
                      className="max-w-full max-h-8 object-contain"
                    />
                    <span className="text-xs mt-1 truncate w-full">{element.title}</span>
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteElement(element.id, element.image_url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {filteredElements.length === 0 && (
                <div className="col-span-2 text-sm text-muted-foreground text-center py-4">
                  No elements in this category
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};