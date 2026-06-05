import { proxyOrExplainMissingBackend } from '../_shared';

export function POST(request: Request) {
  return proxyOrExplainMissingBackend(request, '/api/login', ['POST']);
}
