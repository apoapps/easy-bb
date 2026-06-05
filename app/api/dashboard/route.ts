import { proxyOrExplainMissingBackend } from '../_shared';

export function GET(request: Request) {
  return proxyOrExplainMissingBackend(request, '/api/dashboard', ['GET']);
}
