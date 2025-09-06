import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-secondary-foreground" />
      </div>
      
      <div className="bot-bubble rounded-tl-md px-4 py-3">
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
};