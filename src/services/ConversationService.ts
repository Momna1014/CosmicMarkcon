import axios from 'axios';
import {store} from '../redux/store';

/**
 * Response types for ChatGPT-powered cosmic data
 */
export interface DailyEnergyResponse {
  message: string;
}

export interface TransitResponse {
  id: string;
  name: string;
  subtext: string;
  description: string;
}

export interface CosmicHomeData {
  dailyEnergy: DailyEnergyResponse;
  transits: TransitResponse[];
}

/**
 * Horoscope types — matches mockData.ts format exactly
 */
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

export interface WeeklyHoroscopeBundle {
  days: Record<string, HoroscopeData>; // keyed by "YYYY-MM-DD"
  weekly: HoroscopeData;
  fetchedAt: string; // ISO date when fetched
}

/**
 * Love Match types — matches LoveMatchScreen format
 */
export interface LoveMatchResult {
  overallScore: number;
  alignmentText: string;
  lovePercentage: number;
  communicationPercentage: number;
  passionPercentage: number;
  cosmicInsight: {
    title: string;
    description: string;
  };
}

/**
 * User profile data extracted from onboarding
 */
interface UserProfile {
  name?: string;
  birthday: string; // Required
  zodiacSign: string; // Required
  city?: string;
  country?: string;
}

/**
 * ConversationService
 *
 * Centralized service for all ChatGPT API interactions.
 * Reads API key/model/config from Redux (keysSlice) and
 * user profile from Redux (onboardingSlice) automatically.
 */
class ConversationService {
  private getConfig() {
    const state = store.getState();
    const config = state.keys?.config;
    if (!config?.Api_key) {
      throw new Error('GPT API key not loaded yet');
    }
    return config;
  }

  private getUserProfile(): UserProfile {
    const state = store.getState();
    const onboarding = state.onboarding;
    return {
      name: onboarding.name,
      birthday: onboarding.birthday || '',
      zodiacSign: onboarding.zodiacSign || 'Aries',
      city: onboarding.city,
      country: onboarding.country,
    };
  }

  private getTodayFormatted(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Raw ChatGPT completion call
   */
  private async chatCompletion(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number = 30000,
  ): Promise<string> {
    const config = this.getConfig();

    const response = await axios.post(
      config.baseURL,
      {
        model: config.model,
        temperature: config.temperature,
        max_tokens: 4096,
        messages: [
          {role: 'system', content: systemPrompt},
          {role: 'user', content: userPrompt},
        ],
        response_format: {type: 'json_object'},
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.Api_key}`,
        },
        timeout: timeoutMs,
      },
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Fetch daily energy + transits in a single API call.
   * Called once when user lands on Home screen.
   */
  async getCosmicHomeData(): Promise<CosmicHomeData> {
    const user = this.getUserProfile();
    const today = this.getTodayFormatted();

    console.log('🌌 [ConversationService] Fetching cosmic home data...');
    console.log('📅 Date:', today);
    console.log('👤 User:', user.name || 'Anonymous', '| Sign:', user.zodiacSign);

    const systemPrompt = `You are an expert astrologer AI. You provide accurate, personalized daily horoscope readings and real-time planetary transit information. Always respond in valid JSON format.`;

    // Build optional profile details
    const locationInfo = user.city && user.country ? `\n- Birth Location: ${user.city}, ${user.country}` : '';

    const userPrompt = `Today is ${today}.

User Profile:
- Birthday: ${user.birthday}
- Zodiac Sign: ${user.zodiacSign}${locationInfo}

Provide the following in JSON format:

1. "dailyEnergy": A personalized daily energy reading for this user based on their zodiac sign and today's date. Include:
   - "message": A single short sentence (maximum 10-12 words) in an inspiring cosmic tone. Example length: "The cosmos aligns in your favor. Trust your intuition."

2. "transits": An array of today's REAL planetary transits based on actual astronomical positions for ${today}. For each of the 8 planets (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto), provide:
   - "id": lowercase planet name
   - "name": planet name
   - "subtext": "In [actual zodiac sign the planet is currently transiting]"
   - "description": A 3-4 line description of how this transit affects people based on their zodiac sign today. Make it insightful and practical.

Return ONLY valid JSON with keys "dailyEnergy" and "transits".`;

    try {
      const raw = await this.chatCompletion(systemPrompt, userPrompt);
      const parsed: CosmicHomeData = JSON.parse(raw);

      console.log('✅ [ConversationService] Cosmic home data received:');
      console.log('📊 Daily Energy:', JSON.stringify(parsed.dailyEnergy, null, 2));
      console.log('🪐 Transits:', JSON.stringify(parsed.transits, null, 2));

      return parsed;
    } catch (error: any) {
      console.error('❌ [ConversationService] Failed to fetch cosmic data:', error.message || error);
      throw error;
    }
  }

  /**
   * Generic method for any future ChatGPT conversation in the app.
   * Use this for chat screens, readings, compatibility, etc.
   */
  async ask(systemPrompt: string, userPrompt: string): Promise<string> {
    console.log('💬 [ConversationService] Sending prompt...');
    try {
      const response = await this.chatCompletion(systemPrompt, userPrompt);
      console.log('✅ [ConversationService] Response received');
      return response;
    } catch (error: any) {
      console.error('❌ [ConversationService] Ask failed:', error.message || error);
      throw error;
    }
  }

  /**
   * Fetch horoscope data for today, tomorrow, and weekly summary.
   * 3 entries in one API call, cached daily.
   */
  async getWeeklyHoroscopeBundle(): Promise<WeeklyHoroscopeBundle> {
    const user = this.getUserProfile();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayKey = today.toISOString().slice(0, 10);
    const tomorrowKey = tomorrow.toISOString().slice(0, 10);

    const todayLabel = today.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const tomorrowLabel = tomorrow.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    console.log('🔮 [ConversationService] Fetching horoscope bundle...');
    console.log('📅 Today:', todayKey, '| Tomorrow:', tomorrowKey);
    console.log('👤 User:', user.name || 'Anonymous', '| Sign:', user.zodiacSign);

    const systemPrompt = `You are an expert astrologer AI. Provide accurate, sign-specific horoscope readings. Respond in valid JSON only.`;

    // Build optional profile details
    const locationInfo = user.city && user.country ? ` from ${user.city}, ${user.country}` : '';

    const userPrompt = `Today is ${todayLabel}. Tomorrow is ${tomorrowLabel}.

User Profile:
- Zodiac Sign: ${user.zodiacSign}
- Birthday: ${user.birthday}${locationInfo}

Return JSON with keys "days" and "weekly".

"days" has exactly 2 keys: "${todayKey}" and "${tomorrowKey}".
"weekly" is a weekly overview for this week.

Each entry (today, tomorrow, weekly) MUST have:
- "sections": Array of exactly 4 objects:
  {"id":"cosmic_overview","title":"Cosmic Overview","icon":"cosmic_overview","iconColor":"rgba(255, 165, 0, 1)","description":"..."}
  {"id":"love_relationship","title":"Love & Relationships","icon":"love_relationship","iconColor":"rgba(255, 107, 107, 1)","description":"..."}
  {"id":"path_purpose","title":"Path & Purpose","icon":"path_purpose","iconColor":"rgba(110, 231, 183, 1)","description":"..."}
  {"id":"vitality","title":"Vitality","icon":"vitality","iconColor":"rgba(96, 165, 250, 1)","description":"..."}
  Each description: 1-2 sentences, personalized for ${user.zodiacSign}.
- "luckyElements": [{"title":"Embrace","type":"embrace","items":["item1","item2"]},{"title":"Release","type":"release","items":["item1","item2"]}]
- "celestialAlignment": {"color":"<color name>","number":"<1-99>","mood":"<one word>"}

STRICT UNIQUENESS RULES — THESE ARE MANDATORY:
1. celestialAlignment.color: Use 3 COMPLETELY DIFFERENT colors. Pick from: Crimson, Emerald, Sapphire, Amber, Violet, Coral, Teal, Gold, Silver, Indigo, Rose, Jade, Copper, Ivory, Scarlet. NO two entries can share the same color.
2. celestialAlignment.number: Use 3 COMPLETELY DIFFERENT numbers. They must differ by at least 10. Example: 7, 42, 88.
3. celestialAlignment.mood: Use 3 COMPLETELY DIFFERENT moods. Pick from: Bold, Serene, Fiery, Dreamy, Grounded, Electric, Tender, Radiant, Mystical, Fierce, Tranquil, Vibrant, Focused, Playful, Empowered. NO two entries can share the same mood.
4. All section descriptions MUST be completely different text across today, tomorrow, and weekly.
5. All luckyElements items MUST be different across all 3 entries. No repeated words.
6. The data must feel genuinely unique for ${user.zodiacSign} on each specific date.`;

    try {
      const raw = await this.chatCompletion(systemPrompt, userPrompt, 60000);
      const parsed = JSON.parse(raw) as {days: Record<string, HoroscopeData>; weekly: HoroscopeData};
       console.log("parsed", parsed)      
      console.log('✅ [ConversationService] Horoscope bundle received');
      console.log('📊 Days:', Object.keys(parsed.days));

      return {
        days: parsed.days,
        weekly: parsed.weekly,
        fetchedAt: today.toISOString(),
      };
    } catch (error: any) {
      console.error('❌ [ConversationService] Horoscope fetch failed:', error.message || error);
      throw error;
    }
  }

  /**
   * Fetch love match compatibility data for two zodiac signs.
   * Returns overall score, alignment text, metric percentages, and cosmic insight.
   */
  async getLoveMatchData(yourSign: string, theirSign: string): Promise<LoveMatchResult> {
    console.log('💕 [ConversationService] Fetching love match data...');
    console.log('♈ Your sign:', yourSign, '| Their sign:', theirSign);

    const systemPrompt = `You are an expert astrologer AI specializing in zodiac compatibility and love readings. Respond in valid JSON only.`;

    const userPrompt = `Analyze the zodiac compatibility between ${yourSign} and ${theirSign}.

Return JSON with these exact keys:

1. "overallScore": A compatibility percentage (20-99) that is accurate for this specific pairing based on real astrological compatibility.

2. "alignmentText": Exactly one sentence, approximately 12-15 words long, describing their cosmic connection. Must mention both signs by name. Example format: "The cosmic alignment between ${yourSign} and ${theirSign} creates a unique energetic signature."

3. "lovePercentage": Love & Romance compatibility (20-99), must be different from overallScore.

4. "communicationPercentage": Communication compatibility (20-99), must be different from overallScore and lovePercentage.

5. "passionPercentage": Passion & Energy compatibility (20-99), must be different from all other percentages.

6. "cosmicInsight": An object with:
   - "title": "COSMIC INSIGHT"
   - "description": 2-3 sentences of personalized astrological insight about the ${yourSign}-${theirSign} pairing. Mention their elemental compatibility and advice.

RULES:
- All 4 percentages (overallScore, lovePercentage, communicationPercentage, passionPercentage) MUST be different numbers.
- Percentages should realistically reflect ${yourSign}-${theirSign} astrological compatibility.
- The alignmentText must be unique and specific to this sign combination.`;

    try {
      const raw = await this.chatCompletion(systemPrompt, userPrompt);
      const parsed: LoveMatchResult = JSON.parse(raw);

      console.log('✅ [ConversationService] Love match data received');
      console.log('📊 Overall:', parsed.overallScore, '| Love:', parsed.lovePercentage,
        '| Comm:', parsed.communicationPercentage, '| Passion:', parsed.passionPercentage);

      return parsed;
    } catch (error: any) {
      console.error('❌ [ConversationService] Love match fetch failed:', error.message || error);
      throw error;
    }
  }
}

export const conversationService = new ConversationService();
