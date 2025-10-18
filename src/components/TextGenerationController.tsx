import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";

interface TextGenerationControllerProps {
  onStop: () => void;
  isGenerating: boolean;
}

export function TextGenerationController({ onStop, isGenerating }: TextGenerationControllerProps) {
  if (!isGenerating) return null;

  return (
    <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm font-medium">Generating response...</span>
        <Button 
          onClick={onStop}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <StopCircle className="w-4 h-4" />
          Stop Generation
        </Button>
      </div>
    </div>
  );
}
