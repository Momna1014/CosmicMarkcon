import {
  DEFAULT_CONSENT_GRANTS,
  DEFAULT_VENDOR_GRANTS,
  type ConsentDecision,
  type ConsentDecisionMap,
  type ConsentGrants,
  type ConsentIdentity,
  type ConsentInteraction,
  type ConsentResult,
  type ConsentSource,
  type ConsentStatus,
  type Region,
  type VendorGrants,
} from '../types';
import { VENDOR_TOKEN_MAP, getTemplateGrant } from './consentPolicy';

export type ParseConsentResponseOptions = {
  region: Region;
  source: ConsentSource;
  identity: ConsentIdentity | null;
  timestamp?: number;
  consents?: any[];
  services?: any[];
};

type TemplateServiceMeta = {
  templateId: string;
  dataProcessor: string;
  category: string;
  type: string;
  isEssential: boolean;
  version: string;
};

export function parseConsentResponse(
  response: any,
  options: ParseConsentResponseOptions,
): ConsentResult {
  const interaction = mapUserInteraction(response?.userInteraction);
  const consents = resolveConsents(response, options.consents);
  const serviceMetaByTemplate = buildServiceMetaByTemplate(options.services);

  const decisions = buildDecisions(consents, serviceMetaByTemplate);
  const grants = deriveCategoryGrants(decisions);
  const vendorGrants = deriveVendorGrants(decisions, grants);
  const status = deriveConsentStatus(interaction, decisions, grants);

  return {
    status,
    interaction,
    grants,
    vendorGrants,
    decisions,
    identity: options.identity,
    source: options.source,
    region: options.region,
    timestamp: options.timestamp ?? Date.now(),
  };
}

export function hasConsentChanged(
  previous: ConsentResult | null,
  next: ConsentResult,
): boolean {
  if (!previous) {
    return true;
  }

  if ((previous.identity?.key ?? '') !== (next.identity?.key ?? '')) {
    return true;
  }

  if (previous.region !== next.region) {
    return true;
  }

  if (
    previous.grants.analytics !== next.grants.analytics
    || previous.grants.advertising !== next.grants.advertising
    || previous.grants.personalization !== next.grants.personalization
    || previous.grants.crashReporting !== next.grants.crashReporting
  ) {
    return true;
  }

  const previousDecisions = previous.decisions ?? {};
  const nextDecisions = next.decisions ?? {};
  const templateIds = new Set([
    ...Object.keys(previousDecisions),
    ...Object.keys(nextDecisions),
  ]);

  for (const templateId of templateIds) {
    const beforeGranted = Boolean(previousDecisions[templateId]?.granted);
    const afterGranted = Boolean(nextDecisions[templateId]?.granted);

    if (beforeGranted !== afterGranted) {
      return true;
    }
  }

  return false;
}

function mapUserInteraction(userInteraction: unknown): ConsentInteraction {
  const value = normalizeText(userInteraction);

  if (userInteraction === 0 || value === 'accept_all' || value === 'acceptall') {
    return 'accept-all';
  }

  if (userInteraction === 1 || value === 'deny_all' || value === 'denyall') {
    return 'deny-all';
  }

  if (userInteraction === 2 || value === 'granular') {
    return 'granular';
  }

  if (userInteraction === 3 || value === 'no_interaction' || value === 'nointeraction') {
    return 'no-interaction';
  }

  return 'unknown';
}

function resolveConsents(response: any, fallbackConsents?: any[]): any[] {
  if (Array.isArray(response?.consents) && response.consents.length > 0) {
    return response.consents;
  }

  if (Array.isArray(fallbackConsents) && fallbackConsents.length > 0) {
    return fallbackConsents;
  }

  return [];
}

function buildServiceMetaByTemplate(services: any[] | undefined): Record<string, TemplateServiceMeta> {
  const map: Record<string, TemplateServiceMeta> = {};
  if (!Array.isArray(services)) {
    return map;
  }

  for (const service of services) {
    const templateId = normalizeText(service?.templateId);
    if (!templateId) {
      continue;
    }

    map[templateId] = {
      templateId,
      dataProcessor: stringValue(service?.dataProcessor),
      category: stringValue(service?.categorySlug),
      type: stringValue(service?.type),
      isEssential: Boolean(service?.isEssential),
      version: stringValue(service?.version),
    };
  }

  return map;
}

function buildDecisions(
  consents: any[],
  serviceMetaByTemplate: Record<string, TemplateServiceMeta>,
): ConsentDecisionMap {
  const decisions: ConsentDecisionMap = {};

  for (const consent of consents) {
    const normalizedTemplateId = normalizeText(consent?.templateId);
    const templateId = normalizedTemplateId || stringValue(consent?.templateId);
    if (!templateId) {
      continue;
    }

    const serviceMeta = serviceMetaByTemplate[normalizedTemplateId] ?? null;

    const decision: ConsentDecision = {
      templateId,
      dataProcessor: stringValue(consent?.dataProcessor || serviceMeta?.dataProcessor),
      category: stringValue(consent?.category || serviceMeta?.category),
      type: stringValue(consent?.type || serviceMeta?.type),
      isEssential:
        typeof consent?.isEssential === 'boolean'
          ? consent.isEssential
          : Boolean(serviceMeta?.isEssential),
      granted: Boolean(consent?.status),
      version: stringValue(consent?.version || serviceMeta?.version),
    };

    decisions[templateId] = decision;
  }

  return decisions;
}

function deriveConsentStatus(
  interaction: ConsentInteraction,
  decisions: ConsentDecisionMap,
  grants: ConsentGrants,
): ConsentStatus {
  if (interaction === 'accept-all') {
    return 'accepted';
  }

  if (interaction === 'deny-all') {
    return 'denied';
  }

  const nonEssentialDecisions = Object.values(decisions).filter(decision => !decision.isEssential);
  const grantedCount = nonEssentialDecisions.filter(decision => decision.granted).length;
  const total = nonEssentialDecisions.length;

  if (total === 0) {
    return Object.values(grants).some(Boolean) ? 'accepted' : 'denied';
  }

  if (grantedCount === 0) {
    return 'denied';
  }

  if (grantedCount === total) {
    return 'accepted';
  }

  return 'granular';
}

function deriveCategoryGrants(decisions: ConsentDecisionMap): ConsentGrants {
  const grants: ConsentGrants = { ...DEFAULT_CONSENT_GRANTS };

  for (const decision of Object.values(decisions)) {
    if (!decision.granted) {
      continue;
    }

    // Pass 1: exact templateId match — highest confidence.
    const tg = getTemplateGrant(decision.templateId);
    if (tg) {
      for (const grant of tg.grants) {
        grants[grant] = true;
      }
    }

    // Pass 2: name / category token matching — belt-and-suspenders for
    // services not yet in KNOWN_TEMPLATE_IDS or with unexpected slugs.
    const text = searchableDecisionText(decision);

    if (hasAnyToken(text, ['analytics', 'measurement', 'firebase analytics', 'firebase_analytics'])) {
      grants.analytics = true;
    }

    // @feature:admob:start [disabled]
    // 'admob' token removed from advertising token list while AdMob is disabled
    // @feature:admob:end
    if (hasAnyToken(text, ['advertising', 'marketing', 'facebook', 'meta', 'adjust', 'ads'])) {
      grants.advertising = true;
    }

    if (hasAnyToken(text, ['personalization', 'personalisation', 'revenuecat', 'subscription', 'purchase'])) {
      grants.personalization = true;
    }

    if (hasAnyToken(text, ['crash', 'crashlytics', 'sentry', 'diagnostic'])) {
      grants.crashReporting = true;
    }
  }

  return grants;
}

function deriveVendorGrants(
  decisions: ConsentDecisionMap,
  grants: ConsentGrants,
): VendorGrants {
  const vendorGrants: VendorGrants = { ...DEFAULT_VENDOR_GRANTS };

  // Pass 1: exact templateId match — highest confidence; set before tokens.
  for (const decision of Object.values(decisions)) {
    if (!decision.granted) {
      continue;
    }
    const tg = getTemplateGrant(decision.templateId);
    if (tg?.vendorKey) {
      vendorGrants[tg.vendorKey] = true;
    }
  }

  // Pass 2: name / category token matching — skips vendors already granted.
  for (const [vendor, tokens] of Object.entries(VENDOR_TOKEN_MAP)) {
    if (vendorGrants[vendor as keyof VendorGrants]) {
      continue; // already set by templateId pass above
    }
    vendorGrants[vendor as keyof VendorGrants] = Object.values(decisions).some(decision => {
      if (!decision.granted) {
        return false;
      }

      return hasAnyToken(searchableDecisionText(decision), tokens);
    });
  }

  // Category-level compatibility fallback to keep runtime stable
  if (!vendorGrants.firebaseAnalytics && grants.analytics) {
    vendorGrants.firebaseAnalytics = true;
  }
  if (!vendorGrants.firebaseCrashlytics && grants.crashReporting) {
    vendorGrants.firebaseCrashlytics = true;
  }
  if (!vendorGrants.sentry && grants.crashReporting) {
    vendorGrants.sentry = true;
  }
  if (!vendorGrants.adjust && (grants.analytics || grants.advertising)) {
    vendorGrants.adjust = true;
  }
  // @feature:admob:start [disabled]
  // if (!vendorGrants.admob && grants.advertising) {
  //   vendorGrants.admob = true;
  // }
  // @feature:admob:end
  if (!vendorGrants.facebook && grants.advertising) {
    vendorGrants.facebook = true;
  }
  if (!vendorGrants.revenuecat && grants.personalization) {
    vendorGrants.revenuecat = true;
  }
  if (!vendorGrants.remoteConfig && grants.analytics) {
    vendorGrants.remoteConfig = true;
  }

  return vendorGrants;
}

function searchableDecisionText(decision: ConsentDecision): string {
  return [
    decision.templateId,
    decision.dataProcessor,
    decision.category,
    decision.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function hasAnyToken(text: string, tokens: string[]): boolean {
  return tokens.some(token => text.includes(token.toLowerCase()));
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
