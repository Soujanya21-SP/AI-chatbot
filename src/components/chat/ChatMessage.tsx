import { User, Bot } from "lucide-react";
import { Message } from "./ChatInterface";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-primary" : "bg-secondary"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>
      
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-3 smooth-transition",
        isUser 
          ? "user-bubble rounded-tr-md" 
          : "bot-bubble rounded-tl-md"
      )}>
        <p className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <span className={cn(
          "text-xs mt-1 block opacity-70",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
};