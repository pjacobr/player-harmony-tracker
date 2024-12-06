import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface StatTooltipProps {
  title: string;
  formula?: string;
  description: string;
}

export const StatTooltip = ({ title, formula, description }: StatTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className="h-4 w-4 text-gaming-muted" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{title}</p>
            {formula && (
              <p className="font-mono text-sm bg-gaming-card/50 p-1 rounded">
                {formula}
              </p>
            )}
            <p className="text-sm">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};