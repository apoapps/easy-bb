import { backendNotImplemented, jsonError, parseLoginBody } from '../_backend';

export async function POST(request: Request) {
  try {
    await parseLoginBody(request);
  } catch (error) {
    return jsonError(400, 'INVALID_LOGIN_INPUT', error instanceof Error ? error.message : 'Datos de login invalidos.');
  }

  return backendNotImplemented('login Blackboard');
}
