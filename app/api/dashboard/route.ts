import { dashboardNotImplemented, getSessionId, missingSession } from '../_backend';

export function GET(request: Request) {
  if (!getSessionId(request)) return missingSession();
  return dashboardNotImplemented();
}
