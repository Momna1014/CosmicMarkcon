/**
 * Chat Mock Data
 * 
 * Contains mock messages for the Palm Reader AI chat
 * Includes text messages, images from both sender and receiver
 */

export interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'text_with_image';
  content?: string;
  imageUrl?: string;
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

// Sample palm images for mock data
const SAMPLE_PALM_IMAGES = {
  palm1: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400',
  palm2: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400',
  palm3: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  reading1: 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=400',
  reading2: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
};

// Generate timestamp for messages
const getTimestamp = (minutesAgo: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now;
};

// Default quick replies
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {id: 'heart', label: 'Heart Line', icon: 'heart'},
  {id: 'head', label: 'Head Line', icon: 'head'},
  {id: 'life', label: 'Life Line', icon: 'life'},
  {id: 'fate', label: 'Fate Line', icon: 'fate'},
];

// Mock messages
export const MOCK_MESSAGES: ChatMessage[] = [
  // Initial AI greeting
  {
    id: '1',
    type: 'text',
    content: "Welcome, Seeker. I'm your Whoop Guide. Ask about your transits, share birth details for a reading, or upload a palm photo. How can I help?",
    sender: 'ai',
    timestamp: getTimestamp(120),
    isRead: true,
  },
  // User sends palm image
  {
    id: '2',
    type: 'text_with_image',
    content: "I've just scanned my right palm. Can you give me a reading based on this image?",
    imageUrl: SAMPLE_PALM_IMAGES.palm1,
    sender: 'user',
    timestamp: getTimestamp(115),
    isRead: true,
  },
  // AI response about heart line
  {
    id: '3',
    type: 'text',
    content: "I can see your palm clearly! Let me analyze the main lines for you. Starting with your Heart Line - it's beautifully curved and extends across most of your palm, indicating a warm and emotionally expressive nature. You tend to wear your heart on your sleeve and form deep connections with others.",
    sender: 'ai',
    timestamp: getTimestamp(110),
    isRead: true,
  },
  // AI continues with image example
  {
    id: '4',
    type: 'text_with_image',
    content: "Here's a reference for the heart line I'm describing. Notice how it curves upward towards the index finger - this is considered a positive sign for romantic fulfillment.",
    imageUrl: SAMPLE_PALM_IMAGES.reading1,
    sender: 'ai',
    timestamp: getTimestamp(108),
    isRead: true,
  },
  // User asks about head line
  {
    id: '5',
    type: 'text',
    content: "That's fascinating! What can you tell me about my Head Line?",
    sender: 'user',
    timestamp: getTimestamp(100),
    isRead: true,
  },
  // AI response about head line
  {
    id: '6',
    type: 'text',
    content: "Your Head Line is quite prominent and shows a slight curve downward. This suggests you have a creative mind with strong imaginative abilities. You likely approach problems with both logical thinking and intuitive insights. The length indicates good mental stamina and the ability to focus on complex tasks for extended periods.",
    sender: 'ai',
    timestamp: getTimestamp(95),
    isRead: true,
  },
  // User sends another image
  {
    id: '7',
    type: 'image',
    imageUrl: SAMPLE_PALM_IMAGES.palm2,
    sender: 'user',
    timestamp: getTimestamp(90),
    isRead: true,
  },
  // AI analyzes new image
  {
    id: '8',
    type: 'text',
    content: "I see you've shared another angle. This gives me a clearer view of your Life Line. It appears strong and well-defined, sweeping gracefully around the base of your thumb. This indicates vitality and a zest for life. The depth of the line suggests physical endurance and overall good health.",
    sender: 'ai',
    timestamp: getTimestamp(85),
    isRead: true,
  },
  // User asks about fate
  {
    id: '9',
    type: 'text',
    content: "What about my fate line? I've heard it's important for career readings.",
    sender: 'user',
    timestamp: getTimestamp(80),
    isRead: true,
  },
  // AI detailed response about fate
  {
    id: '10',
    type: 'text',
    content: "Your Fate Line is quite interesting! It starts from the wrist area and travels upward toward your middle finger. The line appears to have some breaks and branches, which isn't negative - it simply indicates you may have several career changes or pivotal moments in your professional life. Each segment represents a new chapter.",
    sender: 'ai',
    timestamp: getTimestamp(75),
    isRead: true,
  },
  // AI sends reference image
  {
    id: '11',
    type: 'text_with_image',
    content: "Here's a visual guide showing how the fate line typically runs. Your line has unique characteristics that suggest entrepreneurial potential and adaptability.",
    imageUrl: SAMPLE_PALM_IMAGES.reading2,
    sender: 'ai',
    timestamp: getTimestamp(73),
    isRead: true,
  },
  // User asks about love
  {
    id: '12',
    type: 'text',
    content: "Can you tell me anything about my love life from my palm?",
    sender: 'user',
    timestamp: getTimestamp(65),
    isRead: true,
  },
  // AI response about love
  {
    id: '13',
    type: 'text',
    content: "Looking at your palm for love insights: Your Heart Line's starting position under the index finger suggests idealistic views on love. I can see faint marriage lines on the outer edge of your palm below the little finger. There appear to be two prominent lines, which could indicate significant relationships in your life.",
    sender: 'ai',
    timestamp: getTimestamp(60),
    isRead: true,
  },
  // More detailed love reading
  {
    id: '14',
    type: 'text',
    content: "The Mount of Venus (the fleshy area at the base of your thumb) appears well-developed, indicating warmth, passion, and a loving nature. Combined with your Heart Line characteristics, you likely value deep emotional connections over superficial relationships.",
    sender: 'ai',
    timestamp: getTimestamp(58),
    isRead: true,
  },
  // User sends clearer image
  {
    id: '15',
    type: 'text_with_image',
    content: "Here's a clearer photo of my left palm. Can you compare it to my right?",
    imageUrl: SAMPLE_PALM_IMAGES.palm3,
    sender: 'user',
    timestamp: getTimestamp(50),
    isRead: true,
  },
  // AI comparison response
  {
    id: '16',
    type: 'text',
    content: "Excellent question! In palmistry, your non-dominant hand (usually left) represents your potential and inherited traits, while your dominant hand shows what you've made of those traits. Looking at both palms gives a complete picture of your journey from potential to reality.",
    sender: 'ai',
    timestamp: getTimestamp(45),
    isRead: true,
  },
  // AI continues comparison
  {
    id: '17',
    type: 'text',
    content: "Comparing your palms, I notice your Heart Line on the dominant hand is more defined than on your non-dominant hand. This suggests you've grown emotionally and learned to express your feelings more openly over time. Your Life Line strength appears consistent on both hands, indicating you were born with natural vitality.",
    sender: 'ai',
    timestamp: getTimestamp(43),
    isRead: true,
  },
  // User asks about health
  {
    id: '18',
    type: 'text',
    content: "Are there any health indicators you can see in my palm?",
    sender: 'user',
    timestamp: getTimestamp(35),
    isRead: true,
  },
  // AI health response
  {
    id: '19',
    type: 'text',
    content: "While palm reading isn't a substitute for medical advice, there are some traditional indicators I can observe. Your Health Line (if present) runs from the base of the little finger toward the Life Line. In your case, I notice the Life Line is unbroken and strong, traditionally associated with good overall constitution.",
    sender: 'ai',
    timestamp: getTimestamp(30),
    isRead: true,
  },
  // AI adds disclaimer
  {
    id: '20',
    type: 'text',
    content: "The nails also appear healthy and well-formed in your images. Remember, these are traditional interpretations from the art of palmistry. For any health concerns, always consult with qualified medical professionals.",
    sender: 'ai',
    timestamp: getTimestamp(28),
    isRead: true,
  },
  // User asks about timing
  {
    id: '21',
    type: 'text',
    content: "Is it possible to predict when certain events might happen?",
    sender: 'user',
    timestamp: getTimestamp(20),
    isRead: true,
  },
  // AI timing explanation
  {
    id: '22',
    type: 'text',
    content: "Traditional palmistry does include timing techniques! The Life Line can be divided into segments representing different life periods. Starting from between the thumb and index finger, each centimeter roughly corresponds to 10 years of life. However, these are guidelines rather than exact predictions.",
    sender: 'ai',
    timestamp: getTimestamp(15),
    isRead: true,
  },
  // AI provides example
  {
    id: '23',
    type: 'text',
    content: "Looking at your Fate Line, I can see there's a significant marking around what would correspond to your late 20s or early 30s. This could indicate a career shift or major life change during that period. Have you experienced or are you approaching such a transition?",
    sender: 'ai',
    timestamp: getTimestamp(13),
    isRead: true,
  },
  // User confirms
  {
    id: '24',
    type: 'text',
    content: "Yes! I'm actually planning to start my own business next year. That's amazing!",
    sender: 'user',
    timestamp: getTimestamp(10),
    isRead: true,
  },
  // AI encouraging response
  {
    id: '25',
    type: 'text',
    content: "Your palm seems to confirm this path! The entrepreneurial indicators I mentioned earlier align beautifully with your plans. Your Head Line's creative curve combined with your strong Life Line suggests you have both the vision and stamina needed for such an endeavor. The universe appears to be aligning with your ambitions! ✨",
    sender: 'ai',
    timestamp: getTimestamp(5),
    isRead: true,
  },
];

// Complete chat data
export const PALM_READER_CHAT_DATA: ChatData = {
  title: 'Palm Reader',
  subtitle: 'AI READER',
  messages: MOCK_MESSAGES,
  quickReplies: DEFAULT_QUICK_REPLIES,
};

/**
 * Get initial messages for a new chat session
 */
export const getInitialMessages = (): ChatMessage[] => {
  return [MOCK_MESSAGES[0]];
};

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
 * Create a mock AI response
 */
export const createAIResponse = (userMessage: ChatMessage): ChatMessage => {
  const responses = [
    "I can see interesting patterns in your palm. Let me analyze this further...",
    "The lines on your palm tell a fascinating story. Based on what I observe...",
    "Your palm shows strong indicators of intuition and creativity.",
    "I notice some unique markings that suggest important life events ahead.",
    "The depth and clarity of your lines indicate strong life force energy.",
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    id: generateMessageId(),
    type: 'text',
    content: userMessage.imageUrl 
      ? `Thank you for sharing this image. ${randomResponse}` 
      : randomResponse,
    sender: 'ai',
    timestamp: new Date(),
    isRead: false,
  };
};

export default PALM_READER_CHAT_DATA;
