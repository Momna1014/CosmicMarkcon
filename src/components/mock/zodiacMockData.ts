/**
 * Zodiac Mock Data
 * 
 * Comprehensive zodiac signs data with authentic personality traits
 * Contains all zodiac sign information including elements, traits, and date ranges
 */

// Zodiac sign trait data
export interface ZodiacTrait {
  prefix: string; // White text (e.g., "Naturally")
  highlight: string; // Yellow highlighted text (e.g., "brilliantly curious")
  description: string; // Full description text
}

// Zodiac insight for typewriter screen
export interface ZodiacInsight {
  mainText: string; // Dynamic text based on zodiac (e.g., "You feel things before others notice them.")
}

// Complete Zodiac sign data structure
export interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dateRange: string;
  traits: ZodiacTrait[]; // 5 random trait sets per sign
  insights: ZodiacInsight[]; // 5 insights per sign for typewriter screen
}

// Comprehensive zodiac signs data with authentic personality traits
export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    dateRange: 'Dec 22 - Jan 19',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'disciplined and wise.',
        description: 'Your relentless determination builds empires where others see only obstacles.',
      },
      {
        prefix: 'Born',
        highlight: 'patient and strategic.',
        description: 'Your steady climb to success inspires everyone watching your journey.',
      },
      {
        prefix: 'Inherently',
        highlight: 'resilient and focused.',
        description: 'Your unwavering focus transforms distant dreams into concrete reality.',
      },
      {
        prefix: 'Truly',
        highlight: 'hardworking and masterful.',
        description: 'Your natural leadership earns respect through actions, not just words.',
      },
      {
        prefix: 'Deeply',
        highlight: 'ambitious and grounded.',
        description: 'Your commitment to excellence sets standards others aspire to reach.',
      },
    ],
    insights: [
      {mainText: 'You carry the weight of the world and make it look effortless.'},
      {mainText: 'Success comes to you because you never stop climbing.'},
      {mainText: 'Your patience is a superpower others can only dream of.'},
      {mainText: 'You see the long game when others are stuck in the moment.'},
      {mainText: 'Structure gives you freedom that chaos never could.'},
    ],
  },
  {
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    dateRange: 'Jan 20 - Feb 18',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'progressive and visionary.',
        description: 'Your innovative mind sees possibilities invisible to conventional thinkers.',
      },
      {
        prefix: 'Born',
        highlight: 'humanitarian and inventive.',
        description: 'Your unique perspective brings revolutionary ideas that change the world.',
      },
      {
        prefix: 'Inherently',
        highlight: 'independent and brilliant.',
        description: 'Your refusal to conform opens doors nobody knew existed.',
      },
      {
        prefix: 'Truly',
        highlight: 'innovative and analytical.',
        description: 'Your forward-thinking nature positions you decades ahead of your time.',
      },
      {
        prefix: 'Deeply',
        highlight: 'authentic and revolutionary.',
        description: 'Your genuine care for humanity drives you to make meaningful change.',
      },
    ],
    insights: [
      {mainText: 'You think in ways that won\'t make sense for another decade.'},
      {mainText: 'Your uniqueness isn\'t a flaw — it\'s your gift to the world.'},
      {mainText: 'You care about humanity even when it doesn\'t understand you.'},
      {mainText: 'Rules feel optional because you see better possibilities.'},
      {mainText: 'You connect dots that others don\'t even know exist.'},
    ],
  },
  {
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    dateRange: 'Feb 19 - Mar 20',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'intuitive and artistic.',
        description: 'Your emotional depth creates connections that transcend ordinary bonds.',
      },
      {
        prefix: 'Born',
        highlight: 'empathetic and imaginative.',
        description: 'Your boundless creativity flows from a wellspring of infinite possibilities.',
      },
      {
        prefix: 'Inherently',
        highlight: 'wise and spiritual.',
        description: 'Your intuition guides you through waters others fear to navigate.',
      },
      {
        prefix: 'Truly',
        highlight: 'gentle and mystical.',
        description: 'Your artistic soul transforms everyday moments into magical experiences.',
      },
      {
        prefix: 'Deeply',
        highlight: 'romantic and selfless.',
        description: 'Your capacity for love and understanding heals everyone you touch.',
      },
    ],
    insights: [
      {mainText: 'You feel things before others notice them.'},
      {mainText: 'Your dreams hold truths your waking mind hasn\'t caught yet.'},
      {mainText: 'You absorb emotions like a sponge — and that\'s your power.'},
      {mainText: 'Boundaries blur for you because you live between worlds.'},
      {mainText: 'Your compassion is endless, even when it exhausts you.'},
    ],
  },
  {
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    dateRange: 'Mar 21 - Apr 19',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'bold and fearless.',
        description: 'Your pioneering spirit blazes trails where others hesitate to step.',
      },
      {
        prefix: 'Born',
        highlight: 'courageous and confident.',
        description: 'Your natural leadership ignites passion in everyone around you.',
      },
      {
        prefix: 'Inherently',
        highlight: 'passionate and dynamic.',
        description: 'Your unstoppable drive turns impossible challenges into conquered victories.',
      },
      {
        prefix: 'Truly',
        highlight: 'direct and independent.',
        description: 'Your fierce authenticity inspires others to embrace their true selves.',
      },
      {
        prefix: 'Deeply',
        highlight: 'enthusiastic and pioneering.',
        description: 'Your courage in the face of adversity makes you a natural champion.',
      },
    ],
    insights: [
      {mainText: 'You dive in headfirst while others are still thinking.'},
      {mainText: 'Fear doesn\'t stop you — it fuels you.'},
      {mainText: 'You start things others are afraid to even imagine.'},
      {mainText: 'Waiting feels like torture because action is your language.'},
      {mainText: 'You light fires in people without even trying.'},
    ],
  },
  {
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    dateRange: 'Apr 20 - May 20',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'reliable and devoted.',
        description: 'Your steadfast nature creates a foundation others can always depend on.',
      },
      {
        prefix: 'Born',
        highlight: 'sensual and determined.',
        description: 'Your appreciation for life\'s pleasures brings richness to every experience.',
      },
      {
        prefix: 'Inherently',
        highlight: 'practical and loyal.',
        description: 'Your unwavering loyalty makes you the anchor in any storm.',
      },
      {
        prefix: 'Truly',
        highlight: 'persistent and nurturing.',
        description: 'Your patient perseverance achieves what others abandon as impossible.',
      },
      {
        prefix: 'Deeply',
        highlight: 'stable and serene.',
        description: 'Your calm presence brings peace to chaos and clarity to confusion.',
      },
    ],
    insights: [
      {mainText: 'You build things meant to last when others build to impress.'},
      {mainText: 'Comfort isn\'t laziness for you — it\'s wisdom.'},
      {mainText: 'Your stubbornness is actually unshakeable self-trust.'},
      {mainText: 'You notice details others rush right past.'},
      {mainText: 'Loyalty runs so deep, it becomes your identity.'},
    ],
  },
  {
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    dateRange: 'May 21 - Jun 20',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'brilliantly curious.',
        description: 'Your adaptability allows you to thrive where others freeze.',
      },
      {
        prefix: 'Born',
        highlight: 'witty and versatile.',
        description: 'Your quick mind dances through conversations with effortless charm.',
      },
      {
        prefix: 'Inherently',
        highlight: 'expressive and clever.',
        description: 'Your dual nature sees both sides, finding truth others miss.',
      },
      {
        prefix: 'Truly',
        highlight: 'playful and quick-minded.',
        description: 'Your gift for connection transforms strangers into friends instantly.',
      },
      {
        prefix: 'Deeply',
        highlight: 'social and fascinating.',
        description: 'Your restless intellect keeps life an exciting adventure.',
      },
    ],
    insights: [
      {mainText: 'Your mind runs at a speed most people can\'t keep up with.'},
      {mainText: 'Boredom is your enemy — and you always find a way out.'},
      {mainText: 'You contain multitudes and that confuses simple minds.'},
      {mainText: 'Words are your superpower — you wield them effortlessly.'},
      {mainText: 'You adapt so fast, change feels like your comfort zone.'},
    ],
  },
  {
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    dateRange: 'Jun 21 - Jul 22',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'intuitive and protective.',
        description: 'Your nurturing heart creates safe havens for those you love.',
      },
      {
        prefix: 'Born',
        highlight: 'nurturing and loyal.',
        description: 'Your fierce devotion to family builds unbreakable bonds of love.',
      },
      {
        prefix: 'Inherently',
        highlight: 'compassionate and caring.',
        description: 'Your emotional intelligence reads hearts before words are spoken.',
      },
      {
        prefix: 'Truly',
        highlight: 'devoted and empathetic.',
        description: 'Your protective instincts shield loved ones from life\'s harsh storms.',
      },
      {
        prefix: 'Deeply',
        highlight: 'warm and tenacious.',
        description: 'Your memory for love and loyalty knows no bounds or limits.',
      },
    ],
    insights: [
      {mainText: 'You remember feelings long after others have forgotten them.'},
      {mainText: 'Home isn\'t a place for you — it\'s a feeling you create.'},
      {mainText: 'Your shell protects a heart that feels everything.'},
      {mainText: 'You nurture people into becoming their best selves.'},
      {mainText: 'Emotions are your compass — and they never lie.'},
    ],
  },
  {
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    dateRange: 'Jul 23 - Aug 22',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'bold and magnificent.',
        description: 'Your radiant presence lights up every room you enter.',
      },
      {
        prefix: 'Born',
        highlight: 'generous and loyal.',
        description: 'Your warm heart shares its light freely with everyone around.',
      },
      {
        prefix: 'Inherently',
        highlight: 'charismatic and confident.',
        description: 'Your natural royalty commands attention without demanding it.',
      },
      {
        prefix: 'Truly',
        highlight: 'courageous and magnetic.',
        description: 'Your theatrical spirit transforms ordinary moments into memorable events.',
      },
      {
        prefix: 'Deeply',
        highlight: 'passionate and regal.',
        description: 'Your nobility of spirit inspires loyalty in all who know you.',
      },
    ],
    insights: [
      {mainText: 'You shine brightest when others try to dim your light.'},
      {mainText: 'Attention finds you even when you\'re not looking for it.'},
      {mainText: 'Your heart is generous even when the world isn\'t kind.'},
      {mainText: 'You lead naturally — people just follow.'},
      {mainText: 'Your confidence inspires those who doubt themselves.'},
    ],
  },
  {
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    dateRange: 'Aug 23 - Sep 22',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'analytical and brilliant.',
        description: 'Your attention to detail perfects what others leave half-finished.',
      },
      {
        prefix: 'Born',
        highlight: 'meticulous and reliable.',
        description: 'Your dedication to improvement elevates everything you touch.',
      },
      {
        prefix: 'Inherently',
        highlight: 'intelligent and precise.',
        description: 'Your problem-solving mind untangles knots others can\'t even see.',
      },
      {
        prefix: 'Truly',
        highlight: 'diligent and organized.',
        description: 'Your systematic approach brings order to chaos effortlessly.',
      },
      {
        prefix: 'Deeply',
        highlight: 'caring and perfectionist.',
        description: 'Your quiet service makes the world work better for everyone.',
      },
    ],
    insights: [
      {mainText: 'You see flaws others miss — and fix them silently.'},
      {mainText: 'Perfection isn\'t obsession for you — it\'s just the standard.'},
      {mainText: 'You care so much it sometimes looks like criticism.'},
      {mainText: 'Order calms your mind when the world feels chaotic.'},
      {mainText: 'You improve everything you touch without asking for credit.'},
    ],
  },
  {
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    dateRange: 'Sep 23 - Oct 22',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'harmonious and fair.',
        description: 'Your natural grace brings balance to every relationship you enter.',
      },
      {
        prefix: 'Born',
        highlight: 'graceful and charming.',
        description: 'Your aesthetic eye creates beauty wherever you make your mark.',
      },
      {
        prefix: 'Inherently',
        highlight: 'idealistic and romantic.',
        description: 'Your pursuit of justice and fairness inspires others to be better.',
      },
      {
        prefix: 'Truly',
        highlight: 'peaceful and artistic.',
        description: 'Your partnership skills build bridges where others see walls.',
      },
      {
        prefix: 'Deeply',
        highlight: 'refined and diplomatic.',
        description: 'Your ability to see all sides makes you a natural peacemaker.',
      },
    ],
    insights: [
      {mainText: 'You feel tension before anyone says a word.'},
      {mainText: 'Balance isn\'t something you seek — it\'s who you are.'},
      {mainText: 'You make peace look effortless even when it isn\'t.'},
      {mainText: 'Beauty matters to you because ugliness feels unbearable.'},
      {mainText: 'You see both sides even when others only see their own.'},
    ],
  },
  {
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    dateRange: 'Oct 23 - Nov 21',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'passionate and resourceful.',
        description: 'Your intensity transforms ordinary experiences into profound revelations.',
      },
      {
        prefix: 'Born',
        highlight: 'determined and magnetic.',
        description: 'Your unwavering focus penetrates mysteries others can\'t comprehend.',
      },
      {
        prefix: 'Inherently',
        highlight: 'powerful and transformative.',
        description: 'Your ability to rise from ashes makes you eternally unstoppable.',
      },
      {
        prefix: 'Truly',
        highlight: 'strategic and perceptive.',
        description: 'Your emotional depth creates bonds that transcend time itself.',
      },
      {
        prefix: 'Deeply',
        highlight: 'brave and investigative.',
        description: 'Your fearless pursuit of truth uncovers what others desperately hide.',
      },
    ],
    insights: [
      {mainText: 'You sense betrayal before it ever happens.'},
      {mainText: 'Surface-level anything feels like a waste of your time.'},
      {mainText: 'You transform pain into power like no one else.'},
      {mainText: 'Secrets reveal themselves to you without trying.'},
      {mainText: 'Your intensity is misunderstood by those who fear depth.'},
    ],
  },
  {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    dateRange: 'Nov 22 - Dec 21',
    traits: [
      {
        prefix: 'Naturally',
        highlight: 'adventurous and free.',
        description: 'Your boundless enthusiasm turns every journey into an epic adventure.',
      },
      {
        prefix: 'Born',
        highlight: 'philosophical and generous.',
        description: 'Your quest for meaning inspires others to look beyond the horizon.',
      },
      {
        prefix: 'Inherently',
        highlight: 'optimistic and lucky.',
        description: 'Your positive energy attracts fortune wherever you wander.',
      },
      {
        prefix: 'Truly',
        highlight: 'curious and fun-loving.',
        description: 'Your infectious joy for life makes every moment worth celebrating.',
      },
      {
        prefix: 'Deeply',
        highlight: 'bold and truth-seeking.',
        description: 'Your honest wisdom cuts through illusion to find what\'s real.',
      },
    ],
    insights: [
      {mainText: 'Freedom isn\'t a desire for you — it\'s survival.'},
      {mainText: 'You\'d rather be honest than comfortable.'},
      {mainText: 'Adventure calls you even when logic says stay still.'},
      {mainText: 'You find meaning in the journey, not just the destination.'},
      {mainText: 'Your optimism saves people even when you don\'t realize it.'},
    ],
  },
];

// Function to get zodiac sign from date
export const getZodiacSign = (date: Date): ZodiacSign => {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return ZODIAC_SIGNS[1]; // Aquarius
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return ZODIAC_SIGNS[2]; // Pisces
  } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return ZODIAC_SIGNS[3]; // Aries
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return ZODIAC_SIGNS[4]; // Taurus
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return ZODIAC_SIGNS[5]; // Gemini
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return ZODIAC_SIGNS[6]; // Cancer
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return ZODIAC_SIGNS[7]; // Leo
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return ZODIAC_SIGNS[8]; // Virgo
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return ZODIAC_SIGNS[9]; // Libra
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return ZODIAC_SIGNS[10]; // Scorpio
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return ZODIAC_SIGNS[11]; // Sagittarius
  } else {
    return ZODIAC_SIGNS[0]; // Capricorn
  }
};

// Get random trait for a zodiac sign
export const getRandomTrait = (zodiac: ZodiacSign): ZodiacTrait => {
  const randomIndex = Math.floor(Math.random() * zodiac.traits.length);
  return zodiac.traits[randomIndex];
};

// Get random insight for a zodiac sign
export const getRandomInsight = (zodiac: ZodiacSign): ZodiacInsight => {
  const randomIndex = Math.floor(Math.random() * zodiac.insights.length);
  return zodiac.insights[randomIndex];
};