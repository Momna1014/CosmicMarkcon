import {SvgProps} from 'react-native-svg';

// Import guide icons
import MoonPhases101Icon from '../../assets/icons/home_icons/Moon_pjase_101.svg';
import UnderstandingTransitIcon from '../../assets/icons/home_icons/understanding_transit.svg';
import RetrogradeSurvivalIcon from '../../assets/icons/home_icons/restograde_survival.svg';
import HumanDesignIntroIcon from '../../assets/icons/home_icons/human_design_intro.svg';

// Lesson type
export interface Lesson {
  id: string;
  number: number;
  title: string;
  readTime: string;
  isCompleted: boolean;
  content: {
    mainText: string;
    subText: string;
    keyTakeaway: string;
  };
}

// Guide type
export interface CosmicGuide {
  id: string;
  title: string;
  Icon: React.FC<SvgProps>;
  lessonsCount: number;
  lessons: Lesson[];
}

// ============================================
// MOCK DATA - UPDATE TEXTS HERE
// ============================================

export const COSMIC_GUIDES_MOCK: CosmicGuide[] = [
  {
    id: 'moon_phases',
    title: 'Moon Phases 101',
    Icon: MoonPhases101Icon,
    lessonsCount: 5,
    lessons: [
      {
        id: 'moon_1',
        number: 1,
        title: 'The Lunar Cycle',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'The cosmos is a vast, interconnected web of energy. In this lesson, we explore the foundational principles of the lunar cycle?',
          subText: 'Understanding these celestial mechanics allows you to navigate life\'s currents with greater ease and awareness. When we align our actions with the cosmic weather, we encounter less resistance and more flow.',
          keyTakeaway: 'Observe without judgment. The stars incline, they do not bind. Your awareness is the ultimate tool for transformation.',
        },
      },
      {
        id: 'moon_2',
        number: 2,
        title: 'New Moon Intentions',
        readTime: '3 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'The New Moon marks the beginning of a fresh lunar cycle—a cosmic reset that invites us to plant seeds of intention.',
          subText: 'During this phase, the moon is invisible in the night sky, symbolizing the darkness from which all creation emerges. It\'s a time for introspection, planning, and setting clear intentions for what you wish to manifest.',
          keyTakeaway: 'Use the New Moon energy to write down your intentions. Be specific, be clear, and trust the universe to guide your path.',
        },
      },
      {
        id: 'moon_3',
        number: 3,
        title: 'Waxing & Waning',
        readTime: '5 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Understanding the waxing and waning phases helps us align our actions with the natural rhythm of growth and release.',
          subText: 'The waxing phase (New to Full Moon) is ideal for building, creating, and taking action toward your goals. The waning phase (Full to New Moon) is perfect for letting go, reflecting, and preparing for the next cycle.',
          keyTakeaway: 'Work with the moon\'s rhythm rather than against it. Build during waxing, release during waning.',
        },
      },
      {
        id: 'moon_4',
        number: 4,
        title: 'Full Moon Release',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'The Full Moon illuminates what was hidden and brings our intentions to fruition—or reveals what needs to be released.',
          subText: 'This is a time of heightened energy and emotion. Use this powerful phase to celebrate your achievements, express gratitude, and consciously release what no longer serves your highest good.',
          keyTakeaway: 'The Full Moon is your monthly opportunity for completion and release. Let go with grace and gratitude.',
        },
      },
      {
        id: 'moon_5',
        number: 5,
        title: 'Eclipses Explained',
        readTime: '6 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Eclipses are cosmic wildcards that accelerate change and bring fated events into our lives.',
          subText: 'Solar eclipses (at New Moons) open new doors and initiate powerful beginnings. Lunar eclipses (at Full Moons) bring revelations and endings. These events often mark significant turning points in our personal and collective journeys.',
          keyTakeaway: 'Embrace eclipse energy with openness. Trust that what falls away creates space for something better.',
        },
      },
    ],
  },
  {
    id: 'understanding_transit',
    title: 'Understanding Transit',
    Icon: UnderstandingTransitIcon,
    lessonsCount: 4,
    lessons: [
      {
        id: 'transit_1',
        number: 1,
        title: 'What Are Transits?',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Transits are the ongoing movements of planets through the zodiac and how they interact with your birth chart.',
          subText: 'When a planet in the current sky forms an aspect to a planet in your natal chart, it activates that part of your psyche and life. Understanding transits helps you prepare for and make the most of cosmic weather.',
          keyTakeaway: 'Transits are like weather forecasts for your soul. They show opportunities and challenges ahead.',
        },
      },
      {
        id: 'transit_2',
        number: 2,
        title: 'Personal Planet Transits',
        readTime: '5 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'The Sun, Moon, Mercury, Venus, and Mars move quickly, creating short-term influences in our daily lives.',
          subText: 'These personal planet transits affect our mood, communication, relationships, and energy levels on a day-to-day basis. Tracking them helps you understand the subtle shifts in your emotional and mental landscape.',
          keyTakeaway: 'Pay attention to the Moon\'s daily journey—it colors the emotional tone of each day.',
        },
      },
      {
        id: 'transit_3',
        number: 3,
        title: 'Outer Planet Transits',
        readTime: '6 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Jupiter, Saturn, Uranus, Neptune, and Pluto move slowly, marking major life chapters and transformations.',
          subText: 'These transits can last months or even years, bringing profound changes in our beliefs, structures, freedoms, spirituality, and personal power. They often coincide with significant life events and spiritual growth.',
          keyTakeaway: 'Outer planet transits are initiation periods. Trust the process of transformation they bring.',
        },
      },
      {
        id: 'transit_4',
        number: 4,
        title: 'Working With Transits',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Learning to work with transits turns cosmic challenges into opportunities for growth and self-mastery.',
          subText: 'Instead of fearing difficult transits, we can prepare for them and use their energy consciously. Each transit, whether easy or challenging, offers lessons and gifts for those who engage with awareness.',
          keyTakeaway: 'You are not a victim of the stars. You are a conscious participant in your cosmic journey.',
        },
      },
    ],
  },
  {
    id: 'retrograde',
    title: 'Retrograde Survival',
    Icon: RetrogradeSurvivalIcon,
    lessonsCount: 4,
    lessons: [
      {
        id: 'retro_1',
        number: 1,
        title: 'What Is Retrograde?',
        readTime: '3 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Retrograde is an optical illusion where a planet appears to move backward in the sky from our earthly perspective.',
          subText: 'While planets don\'t actually reverse their orbits, the retrograde period invites us to turn inward, review, and reflect on the themes ruled by that planet. It\'s a time for re-doing, not new beginnings.',
          keyTakeaway: 'Retrograde periods are cosmic review sessions. Embrace the "re" words: review, reflect, revise, release.',
        },
      },
      {
        id: 'retro_2',
        number: 2,
        title: 'Mercury Retrograde',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Mercury retrograde is the most talked-about retrograde, affecting communication, technology, and travel.',
          subText: 'Occurring 3-4 times per year for about 3 weeks each, this period asks us to slow down, double-check details, and avoid signing important contracts. It\'s excellent for reconnecting with old friends and finishing old projects.',
          keyTakeaway: 'Mercury retrograde is not a curse—it\'s a cosmic invitation to pause and reflect before moving forward.',
        },
      },
      {
        id: 'retro_3',
        number: 3,
        title: 'Venus & Mars Retrograde',
        readTime: '5 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Venus and Mars retrogrades affect our relationships, values, desires, and how we pursue what we want.',
          subText: 'Venus retrograde (every 18 months) asks us to review our relationships and values. Mars retrograde (every 2 years) slows our drive and asks us to reconsider our actions and motivations.',
          keyTakeaway: 'Use relationship retrogrades to heal old wounds and clarify what you truly value and desire.',
        },
      },
      {
        id: 'retro_4',
        number: 4,
        title: 'Outer Planet Retrogrades',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'The outer planets spend 4-5 months retrograde each year, creating subtle but profound internal shifts.',
          subText: 'Jupiter and Saturn retrogrades review our growth and responsibilities. Uranus, Neptune, and Pluto retrogrades deepen our spiritual evolution and transformation. These are times for internal rather than external change.',
          keyTakeaway: 'Outer planet retrogrades work on a soul level. Trust the deep inner work happening beneath the surface.',
        },
      },
    ],
  },
  {
    id: 'human_design',
    title: 'Human Design Intro',
    Icon: HumanDesignIntroIcon,
    lessonsCount: 5,
    lessons: [
      {
        id: 'hd_1',
        number: 1,
        title: 'What Is Human Design?',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Human Design is a synthesis of ancient wisdom and modern science, creating a unique blueprint of your energetic nature.',
          subText: 'Combining astrology, the I Ching, Kabbalah, and the chakra system with quantum physics and genetics, Human Design reveals your authentic self and how you\'re designed to interact with the world.',
          keyTakeaway: 'Human Design shows you how to be yourself—not who you think you should be, but who you truly are.',
        },
      },
      {
        id: 'hd_2',
        number: 2,
        title: 'The Five Types',
        readTime: '6 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'There are five Human Design types, each with a unique role and strategy for navigating life.',
          subText: 'Manifestors initiate, Generators respond, Manifesting Generators respond and then initiate, Projectors guide, and Reflectors reflect. Understanding your type helps you make decisions aligned with your nature.',
          keyTakeaway: 'Knowing your type is the first step to living your design. Follow your strategy and watch life flow.',
        },
      },
      {
        id: 'hd_3',
        number: 3,
        title: 'Authority & Decision Making',
        readTime: '5 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Your Authority is your personal decision-making guidance system—the reliable way you know what\'s correct for you.',
          subText: 'Whether emotional, sacral, splenic, ego, self-projected, mental, or lunar, your Authority bypasses the mind\'s conditioning to reveal your truth. Learning to trust your Authority transforms your life.',
          keyTakeaway: 'Your Authority is your inner GPS. Learn to listen to it and let it guide your decisions.',
        },
      },
      {
        id: 'hd_4',
        number: 4,
        title: 'Centers & Gates',
        readTime: '5 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Your Human Design chart shows nine energy centers that can be defined (colored) or undefined (white).',
          subText: 'Defined centers represent consistent energy and gifts. Undefined centers show where you\'re open to conditioning and wisdom. The 64 gates add nuance to how energy flows through your design.',
          keyTakeaway: 'Your undefined centers are where you learn about the world. Your defined centers are your gifts to share.',
        },
      },
      {
        id: 'hd_5',
        number: 5,
        title: 'Living Your Design',
        readTime: '4 MIN READ',
        isCompleted: false,
        content: {
          mainText: 'Human Design is not about changing who you are—it\'s about recognizing and embracing your true nature.',
          subText: 'Deconditioning from societal expectations takes time. Be patient with yourself as you experiment with your Strategy and Authority. Notice what feels right and what feels like resistance.',
          keyTakeaway: 'You are a unique being with a specific purpose. Trust your design and let it guide you home to yourself.',
        },
      },
    ],
  },
];

// Helper function to get guide by ID
export const getGuideById = (id: string): CosmicGuide | undefined => {
  return COSMIC_GUIDES_MOCK.find(guide => guide.id === id);
};

// Helper function to get lesson by IDs
export const getLessonById = (guideId: string, lessonId: string): Lesson | undefined => {
  const guide = getGuideById(guideId);
  return guide?.lessons.find(lesson => lesson.id === lessonId);
};
