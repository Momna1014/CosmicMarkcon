// Horoscope Mock Data

export interface HoroscopeSection {
  id: string;
  title: string;
  icon: 'cosmic_overview' | 'love_relationship' | 'path_purpose' | 'vitality';
  iconColor: string;
  description: string;
}

export interface LuckyElement {
  title: string;
  type: 'embrace' | 'release';
  items: string[];
}

export interface CelestialAlignment {
  color: string;
  number: string;
  mood: string;
}

export interface HoroscopeData {
  sections: HoroscopeSection[];
  luckyElements: LuckyElement[];
  celestialAlignment: CelestialAlignment;
}

// Today's Horoscope Data
export const TODAY_HOROSCOPE: HoroscopeData = {
  sections: [
    {
      id: 'cosmic_overview',
      title: 'Cosmic Overview',
      icon: 'cosmic_overview',
      iconColor: 'rgba(255, 165, 0, 1)',
      description: 'A change in perspective shifts everything. Look at a current challenge from a new angle.',
    },
    {
      id: 'love_relationship',
      title: 'Love & Relationships',
      icon: 'love_relationship',
      iconColor: 'rgba(255, 107, 107, 1)',
      description: 'Focus on self-love and the rest will follow. Your aura is glowing with inner peace.',
    },
    {
      id: 'path_purpose',
      title: 'Path & Purpose',
      icon: 'path_purpose',
      iconColor: 'rgba(110, 231, 183, 1)',
      description: 'Collaboration will lead to a breakthrough. Seek out a colleague whose skills complement yours.',
    },
    {
      id: 'vitality',
      title: 'Vitality',
      icon: 'vitality',
      iconColor: 'rgba(96, 165, 250, 1)',
      description: 'Mental clarity comes after a brief meditation. Take five minutes to center yourself.',
    },
  ],
  luckyElements: [
    {
      title: 'Embrace',
      type: 'embrace',
      items: ['Breathe deeply', 'Stay open-minded'],
    },
    {
      title: 'Release',
      type: 'release',
      items: ['Rushing decisions', 'Negative self-talk'],
    },
  ],
  celestialAlignment: {
    color: 'Indigo',
    number: '63',
    mood: 'Energetic',
  },
};

// Tomorrow's Horoscope Data
export const TOMORROW_HOROSCOPE: HoroscopeData = {
  sections: [
    {
      id: 'cosmic_overview',
      title: 'Cosmic Overview',
      icon: 'cosmic_overview',
      iconColor: 'rgba(255, 165, 0, 1)',
      description: 'The universe is preparing a surprise for you. Stay open to unexpected opportunities.',
    },
    {
      id: 'love_relationship',
      title: 'Love & Relationships',
      icon: 'love_relationship',
      iconColor: 'rgba(255, 107, 107, 1)',
      description: 'A meaningful connection awaits. Someone from your past may reach out with important news.',
    },
    {
      id: 'path_purpose',
      title: 'Path & Purpose',
      icon: 'path_purpose',
      iconColor: 'rgba(110, 231, 183, 1)',
      description: 'Your creativity peaks tomorrow. Use this energy to start that project you\'ve been postponing.',
    },
    {
      id: 'vitality',
      title: 'Vitality',
      icon: 'vitality',
      iconColor: 'rgba(96, 165, 250, 1)',
      description: 'Your energy levels will be high. Perfect day for physical activities and outdoor adventures.',
    },
  ],
  luckyElements: [
    {
      title: 'Embrace',
      type: 'embrace',
      items: ['New beginnings', 'Creative expression'],
    },
    {
      title: 'Release',
      type: 'release',
      items: ['Old grudges', 'Fear of change'],
    },
  ],
  celestialAlignment: {
    color: 'Violet',
    number: '27',
    mood: 'Inspired',
  },
};

// Weekly Horoscope Data
export const WEEKLY_HOROSCOPE: HoroscopeData = {
  sections: [
    {
      id: 'cosmic_overview',
      title: 'Cosmic Overview',
      icon: 'cosmic_overview',
      iconColor: 'rgba(255, 165, 0, 1)',
      description: 'This week brings transformation. Mercury\'s influence encourages clear communication and new learning.',
    },
    {
      id: 'love_relationship',
      title: 'Love & Relationships',
      icon: 'love_relationship',
      iconColor: 'rgba(255, 107, 107, 1)',
      description: 'Venus blesses your romantic sector. Single? A spark ignites midweek. Partnered? Deepen your bond.',
    },
    {
      id: 'path_purpose',
      title: 'Path & Purpose',
      icon: 'path_purpose',
      iconColor: 'rgba(110, 231, 183, 1)',
      description: 'Career opportunities expand. A mentor figure appears with valuable guidance for your journey.',
    },
    {
      id: 'vitality',
      title: 'Vitality',
      icon: 'vitality',
      iconColor: 'rgba(96, 165, 250, 1)',
      description: 'Balance is key this week. Alternate between activity and rest. Weekend brings rejuvenation.',
    },
  ],
  luckyElements: [
    {
      title: 'Embrace',
      type: 'embrace',
      items: ['Long-term planning', 'Self-reflection'],
    },
    {
      title: 'Release',
      type: 'release',
      items: ['Impatience', 'Overthinking'],
    },
  ],
  celestialAlignment: {
    color: 'Emerald',
    number: '11',
    mood: 'Balanced',
  },
};
