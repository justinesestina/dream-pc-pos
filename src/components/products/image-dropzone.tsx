import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadImageToBackend } from "@/lib/api-client";

const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Bordered drop zone for a single image — click, drag-and-drop, or paste a
 * URL. Tries the backend (WordPress media library) first and falls back to a
 * local base64 preview so the form still works while offline.
 */
export function ImageDropzone({
  label,
  imageUrl,
  onChange,
}: {
  label: string;
  imageUrl: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image file size must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      try {
        const result = await uploadImageToBackend(file);
        if (result.ok && result.url) {
          onChange(result.url);
          toast.success("Image uploaded.");
          return;
        }
        console.warn("Backend upload failed, using local fallback:", result.error);
      } catch {
        console.warn("Backend unreachable, using local fallback");
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => (typeof reader.result === "string" ? resolve(reader.result) : reject());
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
      }).catch(() => null);

      if (dataUrl) {
        onChange(dataUrl);
        toast.success("Image loaded locally (backend unavailable)");
      } else {
        toast.error("Failed to read image file");
      }
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {imageUrl ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-2.5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface p-1">
            <img
              src={imageUrl}
              alt="Preview"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-xs">
            <p className="font-medium text-foreground">Image ready</p>
            <p className="truncate text-muted-foreground">
              {imageUrl.startsWith("data:") ? "Local file (not yet synced)" : imageUrl}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange("")}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed p-6 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-border-strong hover:bg-muted/30",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <UploadCloud className="size-6 text-muted-foreground" />
          <p className="text-xs font-medium text-foreground">
            {uploading ? "Uploading…" : "Click to upload or drag and drop"}
          </p>
          <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
        </button>
      )}
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
