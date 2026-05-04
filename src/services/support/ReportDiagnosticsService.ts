import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {getLocales} from 'react-native-localize';

const APP_SESSION_STARTED_AT = Date.now();

export type ReportSource = 'chat' | 'settings';

export interface ReportDiagnostics {
  source: ReportSource;
  appName: string;
  bundleId: string;
  appVersion: string;
  buildNumber: string;
  platform: string;
  osVersion: string;
  deviceModel: string;
  locale: string;
  reportedAt: string;
  appUptimeSeconds: number;
}

export const ReportDiagnosticsService = {
  async collect(source: ReportSource): Promise<ReportDiagnostics> {
    const locale = getLocales()?.[0]?.languageTag || 'unknown';
    const appUptimeSeconds = Math.max(
      0,
      Math.round((Date.now() - APP_SESSION_STARTED_AT) / 1000),
    );

    let deviceModel = 'unknown';
    try {
      deviceModel = DeviceInfo.getDeviceId();
    } catch (error) {
      console.warn('[ReportDiagnostics] Failed to read device model', error);
    }

    return {
      source,
      appName: DeviceInfo.getApplicationName(),
      bundleId: DeviceInfo.getBundleId(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      platform: Platform.OS,
      osVersion: DeviceInfo.getSystemVersion(),
      deviceModel,
      locale,
      reportedAt: new Date().toISOString(),
      appUptimeSeconds,
    };
  },

  buildEmailSubject(diagnostics: ReportDiagnostics): string {
    const platform = diagnostics.platform === 'ios' ? 'iOS' : 'Android';
    return `[${diagnostics.appName}] Problem Report · v${diagnostics.appVersion} · ${platform}`;
  },

  buildEmailBody(description: string, d: ReportDiagnostics): string {
    const platform = d.platform === 'ios' ? 'iOS' : 'Android';
    const reportedAt = formatDate(d.reportedAt);
    const uptime = formatUptime(d.appUptimeSeconds);
    const divider = '─────────────────────────────────────';
    return [
      'PROBLEM REPORT',
      divider,
      `App      : ${d.appName}`,
      `Source   : ${sourceLabel(d.source)}`,
      `Reported : ${reportedAt}`,
      '',
      '━━━ ISSUE DESCRIPTION ━━━',
      description.trim(),
      '',
      '━━━ APP INFO ━━━',
      `Version   : ${d.appVersion} (build ${d.buildNumber})`,
      `Bundle ID : ${d.bundleId}`,
      `Platform  : ${platform} ${d.osVersion}`,
      '',
      '━━━ DEVICE INFO ━━━',
      `Model     : ${d.deviceModel}`,
      `Locale    : ${d.locale}`,
      `Uptime    : ${uptime}`,
      '',
      divider,
      'This report contains no personal account data.',
    ].join('\n');
  },
};

function sourceLabel(source: ReportSource): string {
  switch (source) {
    case 'chat':
      return 'Chat';
    case 'settings':
      return 'Settings';
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
      ` ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
    );
  } catch {
    return iso;
  }
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
