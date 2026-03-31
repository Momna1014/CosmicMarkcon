/**
 * Love Match Mock Data
 *
 * Contains compatibility data for zodiac sign pairings
 * Can be replaced with dynamic API data later
 */

export interface CompatibilityMetric {
  id: string;
  label: string;
  percentage: number;
  iconColor: string;
  gradientColors: [string, string];
}

export interface LoveMatchData {
  overallScore: number;
  yourSign: string;
  theirSign: string;
  alignmentText: string;
  metrics: CompatibilityMetric[];
  cosmicInsight: {
    title: string;
    description: string;
  };
}

// Generate alignment text based on signs
const generateAlignmentText = (yourSign: string, theirSign: string): string => {
  return `The Whoop alignment between ${yourSign} and ${theirSign} creates a unique energetic signature.`;
};

// Generate cosmic insight based on signs
const generateCosmicInsight = (
  yourSign: string,
  theirSign: string,
): {title: string; description: string} => {
  const insights: Record<string, string> = {
    default: `This connection challenges you to grow. Embrace the friction as a teacher, and practice patience with ${theirSign}'s contrasting approach.`,
    fire_fire:
      'Two flames burning together create an intense, passionate bond. Channel this energy constructively.',
    fire_water:
      'Steam rises where fire meets water. Learn to balance passion with emotional depth.',
    fire_earth:
      'Fire warms the earth, but can also scorch. Find the middle ground between action and stability.',
    fire_air:
      'Air feeds fire, creating an energetic and dynamic partnership full of ideas and action.',
    water_water:
      'Two oceans merging create profound emotional understanding. Swim together through life.',
    water_earth:
      'Water nourishes earth, creating fertile ground for growth. A naturally harmonious pairing.',
    water_air:
      'Air creates waves on water. Intellectual connection meets emotional depth.',
    earth_earth:
      'Two mountains standing together provide unshakeable stability and mutual support.',
    earth_air:
      'Air erodes earth slowly. Patience and communication bridge your different worlds.',
    air_air:
      'Two winds swirling together create a whirlwind of ideas and intellectual connection.',
  };

  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const waterSign = ['Cancer', 'Scorpio', 'Pisces'];
  const earthSign = ['Taurus', 'Virgo', 'Capricorn'];
  const airSign = ['Gemini', 'Libra', 'Aquarius'];

  const getElement = (sign: string): string => {
    if (fireSign.includes(sign)) return 'fire';
    if (waterSign.includes(sign)) return 'water';
    if (earthSign.includes(sign)) return 'earth';
    if (airSign.includes(sign)) return 'air';
    return 'fire';
  };

  const yourElement = getElement(yourSign);
  const theirElement = getElement(theirSign);

  const key1 = `${yourElement}_${theirElement}`;
  const key2 = `${theirElement}_${yourElement}`;

  const description =
    insights[key1] || insights[key2] || insights.default.replace('${theirSign}', theirSign);

  return {
    title: 'COSMIC INSIGHT',
    description: description.replace("${theirSign}'s", `${theirSign}'s`),
  };
};

// Generate random but consistent scores based on sign combination
const generateScores = (
  yourSign: string,
  theirSign: string,
): {overall: number; love: number; communication: number; passion: number} => {
  // Create a simple hash for consistent results
  const hash =
    (yourSign.charCodeAt(0) + theirSign.charCodeAt(0)) * 7 +
    (yourSign.length + theirSign.length) * 13;

  const baseScore = 30 + (hash % 50);
  const variance = 15;

  return {
    overall: Math.min(99, Math.max(20, baseScore + (hash % variance))),
    love: Math.min(99, Math.max(20, baseScore - 10 + ((hash * 3) % variance))),
    communication: Math.min(99, Math.max(20, baseScore - 5 + ((hash * 5) % variance))),
    passion: Math.min(99, Math.max(20, baseScore + 5 + ((hash * 7) % variance))),
  };
};

// Default mock data for Aries and Taurus
export const DEFAULT_LOVE_MATCH_DATA: LoveMatchData = {
  overallScore: 50,
  yourSign: 'Aries',
  theirSign: 'Taurus',
  alignmentText:
    'The Whoop alignment between Aries and Taurus creates a unique energetic signature.',
  metrics: [
    {
      id: 'love',
      label: 'LOVE & ROMANCE',
      percentage: 40,
      iconColor: 'rgba(243, 98, 180, 1)',
      gradientColors: ['#F5265D', '#F362B4'],
    },
    {
      id: 'communication',
      label: 'COMMUNICATION',
      percentage: 40,
      iconColor: 'rgba(98, 173, 243, 1)',
      gradientColors: ['#2656F5', '#62ADF3'],
    },
    {
      id: 'passion',
      label: 'PASSION & ENERGY',
      percentage: 40,
      iconColor: 'rgba(245, 135, 38, 1)',
      gradientColors: ['#F58726', '#F3AB62'],
    },
  ],
  cosmicInsight: {
    title: 'COSMIC INSIGHT',
    description:
      "This connection challenges you to grow. Embrace the friction as a teacher, and practice patience with Taurus's contrasting approach.",
  },
};

/**
 * Generate love match data for any two zodiac signs
 */
export const generateLoveMatchData = (yourSign: string, theirSign: string): LoveMatchData => {
  const scores = generateScores(yourSign, theirSign);
  const cosmicInsight = generateCosmicInsight(yourSign, theirSign);

  return {
    overallScore: scores.overall,
    yourSign,
    theirSign,
    alignmentText: generateAlignmentText(yourSign, theirSign),
    metrics: [
      {
        id: 'love',
        label: 'LOVE & ROMANCE',
        percentage: scores.love,
        iconColor: 'rgba(243, 98, 180, 1)',
        gradientColors: ['#F5265D', '#F362B4'],
      },
      {
        id: 'communication',
        label: 'COMMUNICATION',
        percentage: scores.communication,
        iconColor: 'rgba(98, 173, 243, 1)',
        gradientColors: ['#2656F5', '#62ADF3'],
      },
      {
        id: 'passion',
        label: 'PASSION & ENERGY',
        percentage: scores.passion,
        iconColor: 'rgba(245, 135, 38, 1)',
        gradientColors: ['#F58726', '#F3AB62'],
      },
    ],
    cosmicInsight,
  };
};

export default DEFAULT_LOVE_MATCH_DATA;
