import { useState } from "react";
import { Plus, MessageCircle, User, Brain, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfile {
  name?: string;
  preferences: string[];
  conversationCount: number;
  lastSeen?: Date;
}

interface ChatSessionProps {
  userProfile: UserProfile;
  onNewChat: () => void;
}

export const ChatSession = ({ userProfile, onNewChat }: ChatSessionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-16 bg-chat-surface border-r border-border p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="w-full"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-chat-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">STAN Chatbot</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full chat-gradient hover:opacity-90 smooth-transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <Card className="p-4 surface-gradient">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">
                {userProfile.name || "Anonymous User"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {userProfile.conversationCount} conversations
              </p>
            </div>
          </div>
          
          {userProfile.preferences.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Remembered:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {userProfile.preferences.slice(0, 3).map((pref, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {pref}
                  </Badge>
                ))}
                {userProfile.preferences.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{userProfile.preferences.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {userProfile.lastSeen && (
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Last seen: {userProfile.lastSeen.toLocaleDateString()}
            </div>
          )}
        </Card>
      </div>

      {/* Memory & Features */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Features</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Conversation Memory
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Tone Adaptation
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Personality Consistency
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Context Awareness
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};