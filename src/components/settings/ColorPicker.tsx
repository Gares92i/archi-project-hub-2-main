
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorOptions = [
  { name: "Noir", value: "#000000", textClass: "text-white" },
  { name: "Rouge", value: "#E11D48", textClass: "text-white" },
  { name: "Bleu", value: "#2563EB", textClass: "text-white" },
  { name: "Vert", value: "#16A34A", textClass: "text-white" },
  { name: "Orange", value: "#F97316", textClass: "text-white" },
  { name: "Gris", value: "#6B7280", textClass: "text-white" },
  { name: "Rose", value: "#EC4899", textClass: "text-white" },
  { name: "Bleu clair", value: "#0EA5E9", textClass: "text-white" },
  { name: "Jaune", value: "#EAB308", textClass: "text-black" },
  { name: "Violet", value: "#8B5CF6", textClass: "text-white" },
  { name: "Gris foncé", value: "#374151", textClass: "text-white" },
  { name: "Gris clair", value: "#E5E7EB", textClass: "text-black" },
];

const radiusOptions = [
  { name: "0", value: "0" },
  { name: "0.3", value: "0.3rem" },
  { name: "0.5", value: "0.5rem" },
  { name: "0.75", value: "0.75rem" },
  { name: "1.0", value: "1rem" },
];

export function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState("#F97316");
  const [selectedRadius, setSelectedRadius] = useState("0.5rem");
  const [selectedMode, setSelectedMode] = useState("light");
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Couleur principale</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={cn(
                "h-10 rounded flex items-center justify-center",
                color.textClass,
                selectedColor === color.value && "ring-2 ring-offset-2"
              )}
              style={{ backgroundColor: color.value }}
            >
              {selectedColor === color.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Rayon des coins</Label>
        <div className="flex flex-wrap gap-2">
          {radiusOptions.map((radius) => (
            <button
              key={radius.value}
              onClick={() => setSelectedRadius(radius.value)}
              className={cn(
                "px-4 py-2 border rounded",
                selectedRadius === radius.value && "bg-primary text-primary-foreground"
              )}
            >
              {radius.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Mode</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMode("light")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded",
              selectedMode === "light" && "bg-primary text-primary-foreground"
            )}
          >
            <Sun className="h-4 w-4" />
            Clair
          </button>
          <button
            onClick={() => setSelectedMode("dark")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded",
              selectedMode === "dark" && "bg-primary text-primary-foreground"
            )}
          >
            <Moon className="h-4 w-4" />
            Sombre
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Aperçu</Label>
        <div 
          className={cn(
            "p-6 border rounded",
            selectedMode === "dark" ? "bg-slate-900 text-white" : "bg-white"
          )}
          style={{ borderRadius: selectedRadius }}
        >
          <div 
            className="h-8 mb-4"
            style={{ backgroundColor: selectedColor, borderRadius: selectedRadius }}
          />
          <div 
            className="w-24 h-8 mb-4"
            style={{ backgroundColor: selectedColor, borderRadius: selectedRadius }}
          />
          <p className="mb-2 font-medium">Exemple de texte</p>
          <div 
            className="p-2 text-sm"
            style={{ 
              backgroundColor: selectedMode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              borderRadius: selectedRadius 
            }}
          >
            Ceci est un exemple de bloc de contenu avec le style sélectionné.
          </div>
        </div>
      </div>
    </div>
  );
}
