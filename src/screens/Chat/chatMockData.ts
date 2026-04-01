/**
 * Chat Data Types & Helpers
 * 
 * Types and utility functions for the AI Oracle chat.
 */

export interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'text_with_image';
  content?: string;
  imageUrl?: string;
  palmDiagram?: number;
  sender: 'user' | 'ai';
  timestamp: Date;
  isRead: boolean;
}

export interface QuickReply {
  id: string;
  label: string;
  icon?: string;
}

export interface ChatData {
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  quickReplies: QuickReply[];
}

// Default quick replies
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {id: 'heart', label: 'Heart Line', icon: 'heart'},
  {id: 'head', label: 'Head Line', icon: 'head'},
  {id: 'life', label: 'Life Line', icon: 'life'},
  {id: 'fate', label: 'Fate Line', icon: 'fate'},
];

/**
 * Generate a unique message ID
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new user message
 */
export const createUserMessage = (content: string, imageUrl?: string): ChatMessage => {
  const hasImage = !!imageUrl;
  const hasText = !!content && content.trim().length > 0;
  
  let type: ChatMessage['type'] = 'text';
  if (hasImage && hasText) {
    type = 'text_with_image';
  } else if (hasImage) {
    type = 'image';
  }

  return {
    id: generateMessageId(),
    type,
    content: hasText ? content : undefined,
    imageUrl,
    sender: 'user',
    timestamp: new Date(),
    isRead: false,
  };
};

/**
 * Create an AI message from a text response
 */
export const createAIMessage = (content: string): ChatMessage => {
  return {
    id: generateMessageId(),
    type: 'text',
    content,
    sender: 'ai',
    timestamp: new Date(),
    isRead: false,
  };
};

/**
 * Create an AI message with an image (and optional text)
 */
export const createAIImageMessage = (imageUrl: string, content?: string): ChatMessage => {
  return {
    id: generateMessageId(),
    type: content ? 'text_with_image' : 'image',
    content: content || undefined,
    imageUrl,
    sender: 'ai',
    timestamp: new Date(),
    isRead: false,
  };
};

/**
 * Create an AI palm reading message with the hand diagram above the reading text
 */
export const createPalmReadingMessage = (palmDiagram: number, content: string): ChatMessage => {
  return {
    id: generateMessageId(),
    type: 'text',
    content,
    palmDiagram,
    sender: 'ai',
    timestamp: new Date(),
    isRead: false,
  };
};

export default {DEFAULT_QUICK_REPLIES};
