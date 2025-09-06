import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ChatSession } from "./ChatSession";
import { useChatMemory } from "@/hooks/useChatMemory";
import { useGeminiChat } from "@/hooks/useGeminiChat";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  typing?: boolean;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { userProfile, updateProfile, addToHistory } = useChatMemory();
  const { sendMessage } = useGeminiChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting = userProfile.name
      ? `Hey ${userProfile.name}! Great to see you again. What's on your mind today?`
      : "Hey there! I'm Alex, your AI companion. I'm here to chat, help, and remember what matters to you. What's your name?";
      
    setMessages([{
      id: '1',
      content: greeting,
      sender: 'assistant',
      timestamp: new Date()
    }]);
  }, [userProfile.name]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Update user profile if they mention their name and we don't have it
      if (!userProfile.name && (input.toLowerCase().includes("my name is") || input.toLowerCase().includes("i'm ") || input.toLowerCase().includes("call me"))) {
        const nameMatch = input.match(/(?:my name is|i'm|call me)\s+([a-zA-Z]+)/i);
        if (nameMatch) {
          updateProfile({ name: nameMatch[1] });
        }
      }

      // Send to Gemini with context
      const response = await sendMessage(input, {
        userProfile,
        conversationHistory: messages.slice(-10) // Last 10 messages for context
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Add to memory
      addToHistory({
        userMessage: userMessage.content,
        assistantResponse: response
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Could you try again?",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Sidebar */}
      <ChatSession 
        userProfile={userProfile}
        onNewChat={() => {
          setMessages([{
            id: Date.now().toString(),
            content: `Welcome back, ${userProfile.name || 'friend'}! Ready for another conversation?`,
            sender: 'assistant',
            timestamp: new Date()
          }]);
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full chat-gradient flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Alex</h1>
              <p className="text-sm text-muted-foreground">Your AI Companion</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4 bg-card">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-input border-border focus:ring-primary"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="chat-gradient hover:opacity-90 smooth-transition"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};