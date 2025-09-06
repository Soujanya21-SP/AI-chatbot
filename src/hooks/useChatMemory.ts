import { useState, useEffect } from "react";

export interface UserProfile {
  name?: string;
  preferences: string[];
  conversationCount: number;
  lastSeen?: Date;
  personality?: {
    tone: 'casual' | 'formal' | 'friendly' | 'professional';
    interests: string[];
    communication_style: string;
  };
}

export interface ConversationHistory {
  userMessage: string;
  assistantResponse: string;
  timestamp: Date;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'stan-chatbot-user-profile',
  CONVERSATION_HISTORY: 'stan-chatbot-conversation-history'
};

export const useChatMemory = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    preferences: [],
    conversationCount: 0,
  });
  
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        // Convert date strings back to Date objects
        if (parsed.lastSeen) {
          parsed.lastSeen = new Date(parsed.lastSeen);
        }
        setUserProfile(parsed);
      }

      const savedHistory = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setConversationHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Error loading chat memory:', error);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }, [userProfile]);

  // Save conversation history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(conversationHistory));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }, [conversationHistory]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates,
      lastSeen: new Date(),
      conversationCount: prev.conversationCount + (updates.name && !prev.name ? 1 : 0)
    }));
  };

  const addPreference = (preference: string) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: [...new Set([...prev.preferences, preference])]
    }));
  };

  const addToHistory = (entry: Omit<ConversationHistory, 'timestamp'>) => {
    const newEntry: ConversationHistory = {
      ...entry,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => {
      const updated = [...prev, newEntry];
      // Keep only last 50 conversations to prevent localStorage overflow
      return updated.slice(-50);
    });
    
    // Increment conversation count
    setUserProfile(prev => ({
      ...prev,
      conversationCount: prev.conversationCount + 1,
      lastSeen: new Date()
    }));
  };

  const getRecentContext = (limit: number = 10): ConversationHistory[] => {
    return conversationHistory.slice(-limit);
  };

  const getPreferencesContext = (): string => {
    if (userProfile.preferences.length === 0) return "";
    return `User preferences: ${userProfile.preferences.join(", ")}`;
  };

  const clearMemory = () => {
    setUserProfile({
      preferences: [],
      conversationCount: 0,
    });
    setConversationHistory([]);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_HISTORY);
  };

  return {
    userProfile,
    conversationHistory,
    updateProfile,
    addPreference,
    addToHistory,
    getRecentContext,
    getPreferencesContext,
    clearMemory
  };
};
