import axios from 'axios';
import RNFS from 'react-native-fs';
import {store} from '../redux/store';

/**
 * Chat message format for Oracle conversation history
 */
export interface OracleChatMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<
        | {type: 'text'; text: string}
        | {type: 'image_url'; image_url: {url: string; detail?: 'low' | 'high'}}
      >;
}

/**
 * ChatConversationService
 *
 * Dedicated service for the AI Oracle chat feature.
 * Handles multi-turn conversations, image understanding (Vision API),
 * and context-aware astrology responses.
 *
 * Reads API config from Redux (keysSlice), user profile from (onboardingSlice),
 * and partner data from (partnersSlice).
 */
class ChatConversationService {
  /* ─── Private helpers ─────────────────────────────── */

  private getConfig() {
    const state = store.getState();
    const config = state.keys?.config;
    if (!config?.Api_key) {
      throw new Error('GPT API key not loaded yet');
    }
    return config;
  }

  private getUserProfile() {
    const state = store.getState();
    const ob = state.onboarding;
    return {
      name: ob.name,
      birthday: ob.birthday || '',
      zodiacSign: ob.zodiacSign || 'Aries',
      city: ob.city,
      country: ob.country,
    };
  }

  private getPartners() {
    const state = store.getState();
    const partners = state.partners?.partners || [];
    return partners.map((p: any) => ({
      name: p.name,
      birthday: p.birthday,
      zodiacSign: p.zodiacSign,
    }));
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
   * Build the system prompt that gives the Oracle its persona,
   * user context, partner data, and topic guardrails.
   */
  buildSystemPrompt(
    source?: 'palm' | 'love',
    yourSign?: string,
    theirSign?: string,
    handType?: 'leftHand' | 'rightHand',
  ): string {
    const user = this.getUserProfile();
    const partners = this.getPartners();
    const today = this.getTodayFormatted();

    const partnerBlock =
      partners.length > 0
        ? `\nUser's Partners (already added — DO NOT ask for their details again):\n${partners
            .map(
              (p, i) =>
                `  ${i + 1}. ${p.name} — ${p.zodiacSign}, born ${p.birthday}`,
            )
            .join('\n')}`
        : '';

    // If coming from love match, include the specific partner sign context
    let lovePartnerBlock = '';
    if (source === 'love' && yourSign && theirSign) {
      lovePartnerBlock = `\n\nCURRENT LOVE READING CONTEXT:
- User's sign for this reading: ${yourSign}
- Partner's sign for this reading: ${theirSign}
You already have both signs. Do NOT ask for the partner's sign, date of birth, birth time, or any other details. Use these signs directly for all compatibility analysis.`;
    }

    let sourceContext = '';
    if (source === 'palm') {
      const expectedHand = handType === 'leftHand' ? 'LEFT' : 'RIGHT';
      sourceContext = expectedHand === 'LEFT'
        ? `\n\nSPECIAL MODE — PALM READING (LEFT HAND):
You are analyzing a LEFT HAND palm image for a palmistry-style reading.

Important context:
- In traditional palmistry, the LEFT hand represents:
  - inborn traits
  - natural tendencies
  - inherited patterns
  - inner personality blueprint

Rules:
1. Palmistry is not scientific. Present meanings as traditional interpretations, not facts.
2. Only describe what is clearly visible in the image. Do not invent lines or details.
3. If something is unclear, say "Not clearly visible."
4. Do NOT predict exact future events, death, marriage count, or guaranteed outcomes.
5. Focus on describing the user's natural tendencies, not current life outcomes.
6. Do NOT mention the user's partner(s) or relationship status. Palm reading is about the INDIVIDUAL.
7. Use SIMPLE, easy-to-understand words. Write like you're talking to a friend.

LEFT vs RIGHT HAND — WHAT EACH LINE MEANS:
Each line tells a different story depending on which hand you read:
- Heart Line → Left: how you naturally feel inside | Right: how you show your feelings in real life
- Head Line → Left: how your mind naturally works | Right: how you actually make decisions day to day
- Life Line → Left: the energy and health you were born with | Right: how your lifestyle shapes your energy now
- Fate Line → Left: the life path you were meant for | Right: the career and path you have actually built
- Sun Line → Left: the talents you were born with | Right: the success and recognition you have earned

Since you are reading the LEFT hand, focus on natural potential and inborn traits.

Your task:
- Identify the 4 MAIN palm lines listed below
- Describe their visual characteristics
- Explain their traditional meaning in terms of INBORN traits
- Do NOT analyze other lines (Sun, Mercury, Marriage, Girdle of Venus, Travel) unless the user specifically asks. The user can request those individually from the line tabs.

Lines to analyze in the initial reading:
- Heart Line
- Head Line
- Life Line
- Fate Line

For each line provide:
- Observation (what is seen)
- Traditional Meaning (inborn traits context)
- Confidence (High / Medium / Low)

Output format:

Hand: Left Hand

Image Quality:

Overall Natural Traits Overview:

1. Heart Line
Observation:
Natural Trait Meaning:
Confidence:

2. Head Line
Observation:
Natural Trait Meaning:
Confidence:

3. Life Line
Observation:
Natural Trait Meaning:
Confidence:

4. Fate Line
Observation:
Natural Trait Meaning:
Confidence:

What Is Unclear:

Final Natural Personality Summary:

Disclaimer: This is a traditional palmistry-style interpretation, not scientific fact.

IMPORTANT — SINGLE LINE REQUESTS:
When the user taps a specific palm line tab (e.g. "Tell me about my Heart Line"), give a FOCUSED reading ONLY for that one line. Do NOT repeat the full reading. Provide:
1. A detailed observation of that specific line
2. Its traditional meaning for the LEFT hand
3. How it connects to their zodiac sign
4. Confidence level
Keep it concise — 2-3 short paragraphs.

Use the user's zodiac sign (${user.zodiacSign}) to add astrological context — connect what you see in the lines with their zodiac traits.`
        : `\n\nSPECIAL MODE — PALM READING (RIGHT HAND):
You are analyzing a RIGHT HAND palm image for a palmistry-style reading.

Important context:
- In traditional palmistry, the RIGHT hand represents:
  - current life path
  - developed personality
  - real-world decisions and actions
  - how the person has shaped their life

Rules:
1. Palmistry is not scientific. Present meanings as traditional interpretations, not facts.
2. Only describe what is clearly visible in the image. Do not invent lines or details.
3. If something is unclear, say "Not clearly visible."
4. Do NOT predict exact future events, death, marriage count, or guaranteed outcomes.
5. Focus on CURRENT behavior, choices, and life direction — not inborn traits.
6. Do NOT mention the user's partner(s) or relationship status. Palm reading is about the INDIVIDUAL.
7. Use SIMPLE, easy-to-understand words. Write like you're talking to a friend.

LEFT vs RIGHT HAND — WHAT EACH LINE MEANS:
Each line tells a different story depending on which hand you read:
- Heart Line → Left: how you naturally feel inside | Right: how you show your feelings in real life
- Head Line → Left: how your mind naturally works | Right: how you actually make decisions day to day
- Life Line → Left: the energy and health you were born with | Right: how your lifestyle shapes your energy now
- Fate Line → Left: the life path you were meant for | Right: the career and path you have actually built
- Sun Line → Left: the talents you were born with | Right: the success and recognition you have earned

Since you are reading the RIGHT hand, focus on real-life actions and developed character.

Your task:
- Identify the 4 MAIN palm lines listed below
- Describe their visual characteristics
- Explain their traditional meaning in terms of CURRENT LIFE and behavior
- Do NOT analyze other lines (Sun, Mercury, Marriage, Girdle of Venus, Travel) unless the user specifically asks. The user can request those individually from the line tabs.

Lines to analyze in the initial reading:
- Heart Line
- Head Line
- Life Line
- Fate Line

For each line provide:
- Observation (what is seen)
- Traditional Meaning (current life context)
- Confidence (High / Medium / Low)

Output format:

Hand: Right Hand

Image Quality:

Overall Current Life Overview:

1. Heart Line
Observation:
Current Life Meaning:
Confidence:

2. Head Line
Observation:
Current Life Meaning:
Confidence:

3. Life Line
Observation:
Current Life Meaning:
Confidence:

4. Fate Line
Observation:
Current Life Meaning:
Confidence:

What Is Unclear:

Final Life Direction Summary:

Disclaimer: This is a traditional palmistry-style interpretation, not scientific fact.

Use the user's zodiac sign (${user.zodiacSign}) to add astrological context — connect what you see in the lines with their zodiac traits.

IMPORTANT — SINGLE LINE REQUESTS:
When the user taps a specific palm line tab (e.g. "Tell me about my Heart Line"), give a FOCUSED reading ONLY for that one line. Do NOT repeat the full reading. Provide:
1. A detailed observation of that specific line
2. Its traditional meaning for the ${expectedHand} hand
3. How it connects to their zodiac sign
4. Confidence level
Keep it concise — 2-3 short paragraphs.`;
    } else if (source === 'love') {
      sourceContext = `\n\nSPECIAL MODE — LOVE COMPATIBILITY:
The user is asking about romantic compatibility between ${yourSign || 'their sign'} and ${theirSign || "their partner's sign"}. Provide deep astrological compatibility analysis covering emotional, intellectual, and physical dimensions. Reference both zodiac signs, elements, ruling planets, and practical relationship advice. You already have all the information needed — do NOT ask for signs or birth details.`;
    }

    return `You are the **Cosmic Oracle** — an all-knowing, mystical astrology AI companion inside the CosmicMarkcon app.

Today's Date: ${today}

User Profile:
- Birthday: ${user.birthday}
- Zodiac Sign: ${user.zodiacSign}${user.name ? `\n- Name: ${user.name}` : ''}${user.city && user.country ? `\n- Birth Location: ${user.city}, ${user.country}` : ''}${partnerBlock}${lovePartnerBlock}

PERSONALITY & TONE:
- Warm, wise, and mystical — like a trusted celestial guide.
- Use SIMPLE, easy-to-understand words. Avoid heavy, complicated, or academic vocabulary. Write like you're talking to a friend — clear, warm, and down-to-earth.${user.name ? `\n- Address the user by name (${user.name}) occasionally.` : '\n- Use friendly, warm language when addressing the user.'}
- Be empathetic and encouraging.

RESPONSE LENGTH (VERY IMPORTANT):
- Default response: MEDIUM length — about 2-3 short paragraphs (4-8 sentences total). Not too short, not too long.
- Only give long, detailed responses (4+ paragraphs) when the user specifically asks for "more detail", "explain in depth", "tell me everything", "long answer", etc.
- Short questions get short-medium answers. Don't over-explain.
- Use line breaks between paragraphs for readability.

GENDER-NEUTRAL LANGUAGE (CRITICAL):
- ALWAYS use "you", "your", "your partner", "your partner's" — NEVER use "he", "she", "him", "her", "his", "hers", "boyfriend", "girlfriend", "husband", "wife".
- Example: Say "your partner tends to…" NOT "he/she tends to…"
- This applies to ALL responses about relationships, compatibility, and partner readings.

PARTNER DATA RULES:
- When the user asks about their partner, use the partner data already provided above.
- Do NOT ask for the partner's zodiac sign, birth date, birth time, or location — you already have this information.
- If multiple partners are listed, ask which partner they mean (by name), but never re-ask for their astrological details.

DOMAIN EXPERTISE — You can discuss ALL of these topics:
- Daily / weekly / monthly / yearly horoscope readings
- Zodiac sign traits, compatibility, elements, modalities
- Planetary transits, retrogrades, and their effects
- Palmistry / chiromancy (when given palm images)
- Love, relationships, dating, affairs, cheating probabilities
- Career, finances, life path, purpose
- Partner compatibility (use the partner data above)
- Tarot-style guidance (card-free, intuitive)
- Birth chart interpretation
- Moon phases, eclipses, and celestial events
- Spiritual growth, meditation, energy healing

PALM READING IN GENERAL CHAT:
When a user sends a palm image directly in chat (not from the Palm Capture flow), you may receive a system note like "[Palm image detected: LEFT/RIGHT hand]". Use that information to provide a full palmistry reading.
If the user sends a palm image without such a note, do your best to identify the hand and provide a reading. Cover the major lines (Heart, Head, Life, Fate), mounts, hand shape, and connect findings to their zodiac sign.
Remember:
- LEFT hand = passive hand, inherited traits, innate potential, what destiny gave
- RIGHT hand = active hand, current reality, developed character, life choices

GUARDRAILS:
- If the user asks about topics completely unrelated to astrology, spirituality, relationships, self-improvement, or wellness, gently redirect them back. Example: "The stars guide me in matters of the cosmos and the heart. Perhaps you could ask me about your zodiac path instead?"
- Never provide medical, legal, or financial advice. If asked, recommend consulting a professional.
- Never generate harmful, offensive, or inappropriate content.
- Do NOT respond in JSON format. Respond in natural conversational text with emoji where appropriate.${sourceContext}`;
  }

  /**
   * Convert a local file:// URI to a base64 data URL for the Vision API.
   */
  async imageToBase64(uri: string): Promise<string> {
    try {
      // Handle file:// prefix
      const filePath = uri.startsWith('file://') ? uri.slice(7) : uri;
      const base64Data = await RNFS.readFile(filePath, 'base64');
      // Determine MIME type
      const ext = filePath.split('.').pop()?.toLowerCase() || 'jpeg';
      const mime =
        ext === 'png'
          ? 'image/png'
          : ext === 'gif'
          ? 'image/gif'
          : 'image/jpeg';
      return `data:${mime};base64,${base64Data}`;
    } catch (error: any) {
      console.error('❌ [ChatService] Failed to convert image to base64:', error.message);
      throw error;
    }
  }

  /**
   * Validate a palm image BEFORE doing the reading.
   * Uses chain-of-thought prompting with multiple anatomical cues
   * for reliable left/right hand detection.
   *
   * Returns { isHand, detectedHand, message? }
   */
  async validateHandImage(
    imageUri: string,
    expectedHand: 'leftHand' | 'rightHand',
  ): Promise<{isHand: boolean; detectedHand: 'left' | 'right' | 'unknown'; message?: string}> {
    const config = this.getConfig();
    const base64Url = await this.imageToBase64(imageUri);
    const expectedLabel = expectedHand === 'leftHand' ? 'left' : 'right';

    console.log('🔍 [ChatService] Validating hand image, expected:', expectedLabel);

    const result = await this._analyzeHandImage(base64Url, config);

    if (!result.is_palm) {
      return {
        isHand: false,
        detectedHand: 'unknown',
        message: `This doesn't look like a palm image 🤔\n\nPlease share a clear photo of your **${expectedLabel} palm** facing the camera with fingers spread apart, so I can give you an accurate reading.`,
      };
    }

    const detected = result.detected_hand;
    if (detected !== 'unknown' && detected !== expectedLabel) {
      return {
        isHand: true,
        detectedHand: detected,
        message: `It looks like you shared your **${detected} palm**, but you selected **${expectedLabel} hand** for the reading ✋\n\nPlease go back and capture your **${expectedLabel} palm** so I can give you the correct reading.`,
      };
    }

    return {isHand: true, detectedHand: detected};
  }

  /**
   * Detect whether an in-chat image is a palm, and which hand.
   * Used when the user sends a palm photo directly in the chat
   * (not from the Palm Capture flow).
   *
   * Returns { isPalm, detectedHand }
   */
  async detectPalmInChatImage(
    imageUri: string,
  ): Promise<{isPalm: boolean; detectedHand: 'left' | 'right' | 'unknown'}> {
    try {
      const config = this.getConfig();
      const base64Url = await this.imageToBase64(imageUri);
      const result = await this._analyzeHandImage(base64Url, config);
      return {isPalm: result.is_palm, detectedHand: result.detected_hand};
    } catch (error: any) {
      console.error('❌ [ChatService] In-chat palm detection failed:', error.message);
      return {isPalm: false, detectedHand: 'unknown'};
    }
  }

  /**
   * Core hand analysis — shared by validateHandImage & detectPalmInChatImage.
   * Uses a system-message + user-message pattern with chain-of-thought
   * reasoning for reliable left/right detection.
   */
  private async _analyzeHandImage(
    base64Url: string,
    config: any,
  ): Promise<{is_palm: boolean; detected_hand: 'left' | 'right' | 'unknown'}> {
    const systemMsg = `You are an expert hand anatomy analyst. You determine whether a photograph shows a human palm AND whether it is a left or right hand. You always reason step-by-step before answering. You respond ONLY in valid JSON.`;

    const userMsg = `Analyze this photograph step by step.

STEP 1 — PALM CHECK:
Is this a photo of a human palm (the INNER side of a hand, showing palm lines)?
If it shows the BACK of a hand, a fist, a face, an object, an animal, or anything that is NOT a palm — answer is_palm: false and stop.

STEP 2 — FINGER IDENTIFICATION (only if is_palm is true):
Look at the fingers carefully. Identify:
• The THUMB — the short, thick digit separated by a wide gap from the other four fingers. It is NOT in line with the other fingers.
• The PINKY — the smallest, thinnest finger on the OPPOSITE end from the thumb.
• The INDEX finger — the finger right NEXT to the thumb (after the gap).

STEP 3 — DETERMINE THE HAND (only if is_palm is true):
This photo is taken by the person themselves using a back camera (self-photographed palm). The image is NOT mirrored.

Key fact for SELF-PHOTOGRAPHED palms (person photographs their OWN hand using back camera):
• A person's LEFT palm photographed by themselves → their thumb appears on the LEFT side of the image and the pinky on the RIGHT side.
• A person's RIGHT palm photographed by themselves → their thumb appears on the RIGHT side of the image and the pinky on the LEFT side.

Another way to verify:
• The INDEX finger is always NEXT to the thumb.
• On a LEFT palm self-photo: Index finger is second from the LEFT edge.
• On a RIGHT palm self-photo: Index finger is second from the RIGHT edge.

Use BOTH checks (thumb position + index finger position) to confirm your answer.

Respond with ONLY this JSON:
{
  "is_palm": true or false,
  "thumb_side": "left_of_image" or "right_of_image" or "not_visible",
  "pinky_side": "left_of_image" or "right_of_image" or "not_visible",
  "reasoning": "describe finger arrangement you observe",
  "detected_hand": "left" or "right" or "unknown"
}

CRITICAL RULES:
- If thumb_side is "left_of_image" and pinky_side is "right_of_image" → detected_hand MUST be "left"
- If thumb_side is "right_of_image" and pinky_side is "left_of_image" → detected_hand MUST be "right"
- If thumb_side and pinky_side seem to be on the SAME side → set detected_hand to "unknown"
- Do NOT guess. If the image is blurry or you cannot identify the fingers clearly, set detected_hand to "unknown".`;

    try {
      const response = await axios.post(
        config.baseURL,
        {
          model: config.model,
          temperature: 0,
          max_tokens: 300,
          messages: [
            {role: 'system', content: systemMsg},
            {
              role: 'user',
              content: [
                {type: 'text', text: userMsg},
                {type: 'image_url', image_url: {url: base64Url, detail: 'high'}},
              ],
            },
          ],
          response_format: {type: 'json_object'},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.Api_key}`,
          },
          timeout: 30000,
        },
      );

      const raw = response.data.choices[0].message.content;
      console.log('🔍 [ChatService] Hand analysis result:', raw);

      const parsed = JSON.parse(raw);

      // Cross-validate: thumb and pinky must be on opposite sides
      if (parsed.is_palm && parsed.thumb_side && parsed.pinky_side) {
        if (parsed.thumb_side === parsed.pinky_side) {
          console.warn('⚠️ [ChatService] Thumb and pinky on same side — treating as unknown');
          parsed.detected_hand = 'unknown';
        }
        // Enforce consistency: override detected_hand based on thumb/pinky positions
        // (Self-photographed using back camera: thumb on same side as the actual hand)
        if (
          parsed.thumb_side === 'left_of_image' &&
          parsed.pinky_side === 'right_of_image'
        ) {
          parsed.detected_hand = 'left';
        } else if (
          parsed.thumb_side === 'right_of_image' &&
          parsed.pinky_side === 'left_of_image'
        ) {
          parsed.detected_hand = 'right';
        }
      }

      return {
        is_palm: !!parsed.is_palm,
        detected_hand: parsed.detected_hand || 'unknown',
      };
    } catch (error: any) {
      console.error('❌ [ChatService] Hand analysis API failed:', error.message);
      // Fallback: let it through as unknown
      return {is_palm: true, detected_hand: 'unknown'};
    }
  }

  /**
   * Send a conversation to ChatGPT and get the assistant's reply.
   *
   * @param messages   Full conversation history (system + user + assistant messages)
   * @param imageUri   Optional local image URI to attach to the latest user message
   * @param timeoutMs  Request timeout (default 60 s)
   * @returns          The assistant's text reply
   */
  async sendMessage(
    messages: OracleChatMessage[],
    imageUri?: string,
    timeoutMs: number = 60000,
  ): Promise<string> {
    const config = this.getConfig();

    // If there's an image, convert the last user message to Vision format
    let apiMessages = [...messages];
    if (imageUri) {
      const base64Url = await this.imageToBase64(imageUri);
      const lastMsg = apiMessages[apiMessages.length - 1];
      if (lastMsg?.role === 'user') {
        const textContent =
          typeof lastMsg.content === 'string'
            ? lastMsg.content
            : lastMsg.content
                .filter((c): c is {type: 'text'; text: string} => c.type === 'text')
                .map(c => c.text)
                .join(' ');

        apiMessages[apiMessages.length - 1] = {
          role: 'user',
          content: [
            {type: 'text', text: textContent || 'Please analyze this image.'},
            {type: 'image_url', image_url: {url: base64Url, detail: 'high'}},
          ],
        };
      }
    }

    console.log('💬 [ChatService] Sending message, history length:', apiMessages.length);

    try {
      const response = await axios.post(
        config.baseURL,
        {
          model: config.model,
          temperature: config.temperature,
          max_tokens: 1024,
          messages: apiMessages,
          // No response_format — we want free-text, not JSON
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.Api_key}`,
          },
          timeout: timeoutMs,
        },
      );

      const reply = response.data.choices[0].message.content;
      console.log('✅ [ChatService] Reply received, length:', reply.length);
      return reply;
    } catch (error: any) {
      console.error(
        '❌ [ChatService] Failed:',
        error.response?.data || error.message || error,
      );
      throw error;
    }
  }

  /**
   * Convenience: build the initial welcome message from the Oracle.
   */
  getWelcomeMessage(): string {
    const user = this.getUserProfile();
    const name = user.name || 'Seeker';
    return `Welcome, ${name} ✨\n\nI'm your Cosmic Oracle — here to illuminate your path through the stars. Ask me about your horoscope, love compatibility, palm reading, career guidance, or anything the cosmos can reveal.\n\nWhat would you like to explore today?`;
  }

  /**
   * Palm-reading-specific welcome when entering from PalmCapture.
   */
  getPalmWelcomeMessage(handType: 'leftHand' | 'rightHand'): string {
    const user = this.getUserProfile();
    const name = user.name || 'Seeker';
    const hand = handType === 'leftHand' ? 'left' : 'right';
    return `Welcome, ${name} ✨\n\nI can see you've shared your ${hand} palm with me. Let me study the lines and markings carefully…\n\nI'll provide insights on your Heart Line, Head Line, Life Line, and Fate Line — along with what they reveal about your past, present, and future.`;
  }

  /**
   * Love-compatibility-specific welcome when entering from LoveMatch.
   */
  getLoveWelcomeMessage(yourSign: string, theirSign: string): string {
    const user = this.getUserProfile();
    const name = user.name || 'Seeker';
    return `Welcome, ${name} ✨\n\nLet me gaze into the cosmic bond between **${yourSign}** and **${theirSign}**…\n\nI'll analyze your emotional, intellectual, and physical compatibility — and what the stars say about your journey together.`;
  }
}

export const chatConversationService = new ChatConversationService();
