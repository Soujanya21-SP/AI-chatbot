import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const ApiKeyWarning = () => {
  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-sm">
        <strong>Security Notice:</strong> This demo uses a hardcoded API key for demonstration purposes. 
        In production, API keys should be stored securely using environment variables or a backend service.
        <br />
        <Button 
          variant="link" 
          className="p-0 h-auto text-yellow-400 hover:text-yellow-300"
          asChild
        >
          <a 
            href="https://docs.lovable.dev/integrations/supabase/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1"
          >
            Learn about Supabase integration <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  );
};