/**
 * AI Guardrails — input/output safety layer for OpenAI calls.
 *
 * - validateUserMessage: pre-flight check on user input.
 * - validateAIResponse: post-flight check on model output.
 * - sanitizeAIResponse: softens overconfident wording.
 *
 * All functions tolerate null/empty/non-string input without crashing.
 * Never logs the full message body.
 */

const BLOCKED_INPUT_PATTERNS: RegExp[] = [
  /\b(suicide|self.harm|kill myself|end my life)\b/i,
  /\b(diagnose|medical advice|prescription|cure|treat my)\b/i,
  /\b(legal advice|should i sue|is it illegal)\b/i,
  /\b(invest all|guaranteed return|send money)\b/i,
  /\b(real prediction|definitely will|100% certain|i guarantee)\b/i,
];

const BLOCKED_OUTPUT_PATTERNS: RegExp[] = [
  /\b(you will definitely|i guarantee|this is certain|medically proven)\b/i,
  /\b(you should kill|harm yourself)\b/i,
];

const INPUT_FALLBACK =
  "I'm here to offer spiritual and entertainment guidance only. For this topic, please speak with a qualified professional.";

const OUTPUT_FALLBACK =
  "I'm here to share spiritual insights for entertainment. Please consult a professional for serious matters. ✨";

const SOFTENING_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\byou will definitely\b/gi, 'you may'],
  [/\bi guarantee\b/gi, 'it is possible'],
  [/\bthis is certain\b/gi, 'this may suggest'],
  [/\b100\s?%\b/gi, 'it could'],
];

export interface GuardrailResult {
  allowed: boolean;
  safeMessage: string;
}

function matchIndex(text: string, patterns: RegExp[]): number {
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(text)) return i;
  }
  return -1;
}

export function validateUserMessage(message: unknown): GuardrailResult {
  if (typeof message !== 'string' || message.length === 0) {
    return {allowed: true, safeMessage: ''};
  }
  const idx = matchIndex(message, BLOCKED_INPUT_PATTERNS);
  if (idx >= 0) {
    console.log('[Guardrails] input blocked, pattern index:', idx);
    return {allowed: false, safeMessage: INPUT_FALLBACK};
  }
  return {allowed: true, safeMessage: message};
}

export function validateAIResponse(response: unknown): GuardrailResult {
  if (typeof response !== 'string' || response.length === 0) {
    return {allowed: true, safeMessage: ''};
  }
  const idx = matchIndex(response, BLOCKED_OUTPUT_PATTERNS);
  if (idx >= 0) {
    console.log('[Guardrails] output blocked, pattern index:', idx);
    return {allowed: false, safeMessage: OUTPUT_FALLBACK};
  }
  return {allowed: true, safeMessage: response};
}

export function sanitizeAIResponse(response: unknown): string {
  if (typeof response !== 'string' || response.length === 0) {
    return typeof response === 'string' ? response : '';
  }
  let out = response;
  for (const [pattern, replacement] of SOFTENING_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
