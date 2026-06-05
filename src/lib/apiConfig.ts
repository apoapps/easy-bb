export interface DemoModeInput {
  dev: boolean;
  urlSearch: string;
  protocol: string;
  hostname: string;
}

export interface ApiBaseInput {
  configuredApiBaseUrl?: string;
  origin: string;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function shouldUseDemoMode(input: DemoModeInput): boolean {
  if (!input.dev) return false;

  const params = new URLSearchParams(input.urlSearch);
  if (params.get('real') === '1') return false;
  if (params.get('demo') === '1') return true;
  if (input.protocol === 'file:') return true;

  return LOCAL_HOSTS.has(input.hostname) || input.hostname.startsWith('192.168.');
}

export function getApiBaseUrl(input: ApiBaseInput): string {
  const configured = input.configuredApiBaseUrl?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return input.origin.replace(/\/+$/, '');
}
