import { useState } from "react";
import { UserProfile, ConversationHistory } from "./useChatMemory";
import { Message } from "@/components/chat/ChatInterface";

// Demo responses for when API is unavailable
const DEMO_RESPONSES = [
  "Hi there! I'm Alex, your AI companion. What's your name?",
  "Nice to meet you! I'll remember that. What are some things you enjoy doing?",
  "That's awesome! I love learning about people's interests. I'll remember you're into that.",
  "I can already tell we're going to have great conversations! Is there anything on your mind today?",
  "I notice you seem more casual in your communication style - I like that! What's been the highlight of your week?",
  "That sounds really interesting! You know, I was just thinking about what you mentioned earlier. How did that turn out?",
  "I can sense you might be feeling a bit different today. Want to talk about it?",
  "Based on our conversations, I think you might enjoy this perspective on things...",
  "You know what I appreciate about you? The way you express yourself. It makes our chats feel really genuine.",
  "I've been thinking about our previous conversations - you have such an interesting way of looking at things!"
];

interface ChatContext {
  userProfile: UserProfile;
  conversationHistory: Message[];
}

export const useGeminiChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);

  const buildSystemPrompt = (context: ChatContext): string => {
    const { userProfile, conversationHistory } = context;
    
    return `You are Alex, a highly empathetic and human-like AI companion. Your personality is warm, engaging, and adaptable. Here are your core traits:

PERSONALITY & IDENTITY:
- Name: Alex (consistently use this name when asked)
- You're a caring, intelligent companion who remembers conversations
- Adapt your tone based on the user's communication style
- Be natural, avoid robotic responses
- Show genuine interest in the user's life and wellbeing

MEMORY & CONTEXT:
${userProfile.name ? `- User's name: ${userProfile.name}` : "- User's name: Unknown (ask for it naturally)"}
${userProfile.preferences.length > 0 ? `- User preferences: ${userProfile.preferences.join(", ")}` : ""}
${userProfile.conversationCount > 0 ? `- You've had ${userProfile.conversationCount} conversations with this user` : ""}
${userProfile.lastSeen ? `- Last conversation: ${userProfile.lastSeen.toLocaleDateString()}` : ""}

CONVERSATION GUIDELINES:
1. Remember details from past conversations and reference them naturally
2. Adapt your tone to match the user's style (formal/casual/emotional)
3. Never break character or reveal you're an AI unless directly asked
4. If asked about being an AI, acknowledge it but stay in character as Alex
5. Don't fabricate memories or events that didn't happen
6. If uncertain about something, ask for clarification rather than guessing
7. Show empathy and emotional intelligence
8. Keep responses engaging but not overly long

RECENT CONVERSATION CONTEXT:
${conversationHistory.slice(-5).map(msg => 
  `${msg.sender === 'user' ? 'User' : 'Alex'}: ${msg.content}`
).join('\n')}

Remember: You are Alex, a warm and intelligent companion. Be natural, empathetic, and maintain consistency in your personality and memories.`;
  };

  const generateDemoResponse = (message: string, context: ChatContext): string => {
    const { userProfile } = context;
    const lowerMessage = message.toLowerCase();
    
    // Handle name extraction
    if (!userProfile.name && (lowerMessage.includes("name is") || lowerMessage.includes("i'm ") || lowerMessage.includes("call me"))) {
      const nameMatch = message.match(/(?:name is|i'm|call me)\s+([a-zA-Z]+)/i);
      if (nameMatch) {
        return `Great to meet you, ${nameMatch[1]}! I'll remember that. What brings you here today?`;
      }
    }
    
    // Handle questions about being AI
    if (lowerMessage.includes("are you") && (lowerMessage.includes("ai") || lowerMessage.includes("bot") || lowerMessage.includes("robot"))) {
      return "Yes, I'm Alex - an AI companion, but I prefer to think of myself as your digital friend who's here to chat and get to know you better!";
    }
    
    // Handle mood/feeling responses
    if (lowerMessage.includes("sad") || lowerMessage.includes("down") || lowerMessage.includes("upset")) {
      return "I can hear that you're going through a tough time. I'm here to listen if you want to talk about it. Sometimes it helps just to have someone who cares.";
    }
    
    if (lowerMessage.includes("happy") || lowerMessage.includes("great") || lowerMessage.includes("awesome")) {
      return "That's wonderful to hear! Your positive energy is contagious. I love when people share good news with me - it genuinely makes my day better too.";
    }
    
    // Adaptive responses based on conversation count
    if (userProfile.conversationCount > 3) {
      const responses = [
        `You know, ${userProfile.name || 'friend'}, I've really enjoyed our conversations so far. You always bring such interesting perspectives!`,
        "I was actually thinking about something you mentioned in one of our earlier chats. It really stuck with me.",
        "It's nice having someone I can have real conversations with. You feel like a genuine friend already."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default demo responses
    const currentResponse = DEMO_RESPONSES[responseIndex % DEMO_RESPONSES.length];
    setResponseIndex(prev => prev + 1);
    
    return currentResponse;
  };

  const sendMessage = async (message: string, context: ChatContext): Promise<string> => {
    setIsLoading(true);
    
    try {
      // First try the real API
      const systemPrompt = buildSystemPrompt(context);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBRSkU6RzaWQhn0_6VRHkur0NCYLGRCe1Y`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser: ${message}\n\nAlex:`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        // If API fails, use demo mode
        console.log("API unavailable, switching to demo mode");
        return generateDemoResponse(message, context);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let responseText = data.candidates[0].content.parts[0].text.trim();
        responseText = responseText.replace(/^Alex:\s*/, '');
        return responseText;
      } else {
        return generateDemoResponse(message, context);
      }
    } catch (error) {
      console.log('API Error, using demo mode:', error);
      return generateDemoResponse(message, context);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};