import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dice3D } from '../components/Dice3D';
import { api, getLastLogin, getDemoMode, setLastLogin } from '../lib/api';
import { pushToast } from '../components/toastBus';

export function LoginPage({ onLogin }: { onLogin?: () => void }) {
  const navigate = useNavigate();
  const [school, setSchool] = useState(() => getLastLogin().school);
  const [username, setUsername] = useState(() => getLastLogin().username);
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const diceRotation = (() => {
    if (focused === 0) return { x: 0, y: 0, z: 0 }; // escuela (front)
    if (focused === 1) return { x: 0, y: 180, z: 0 }; // pass (back)
    if (focused === 2) return { x: 0, y: 90, z: 0 }; // user (right)
    return { x: -20, y: 30, z: 0 };
  })();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Falta usuario o contraseña');
      triggerShake();
      return;
    }
    setError(null);
    setLoading(true);
    setLastLogin(school, username);
    try {
      const r = await api.login(school, username, password);
      if (!r.ok) throw new Error('Login failed');
      pushToast(getDemoMode() ? '🎭 Login demo OK' : '✓ Sesión iniciada', 'good');
      if (onLogin) onLogin();
      navigate('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo entrar');
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-bg">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <Dice3D rotation={diceRotation} size={120} />

        <div
          className={[
            'w-full p-8 bg-surface border-4 border-ink shadow-brutal-lg',
            shake ? 'animate-shake' : '',
          ].join(' ')}
        >
          <h1 className="font-display text-4xl leading-none tracking-tight">BB DASH</h1>
          <p className="text-muted text-sm mt-2 mb-6">
            Blackboard sin dolor · neobrutalismo morado
          </p>

          {getDemoMode() && (
            <div className="mb-4 p-2 bg-warn border-2 border-ink text-ink text-xs font-display uppercase tracking-wide text-center">
              🎭 Modo demo — datos mockeados
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="lg-school" className="block text-xs font-display uppercase tracking-widest mb-1.5">
                Escuela (subdominio)
              </label>
              <div className="flex items-stretch">
                <span className="px-4 py-3 bg-ink text-white font-bold border-2 border-ink border-r-0">https://</span>
                <input
                  id="lg-school"
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  onFocus={() => setFocused(0)}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                  className="flex-1 px-3 py-3 border-2 border-ink bg-surface outline-none focus:shadow-brutal"
                />
                <span className="px-4 py-3 bg-ink text-white font-bold border-2 border-ink border-l-0">.blackboard.com</span>
              </div>
            </div>

            <div>
              <label htmlFor="lg-user" className="block text-xs font-display uppercase tracking-widest mb-1.5">
                Usuario
              </label>
              <input
                id="lg-user"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocused(2)}
                onBlur={() => setFocused(null)}
                autoComplete="username"
                className="w-full px-4 py-3 border-2 border-ink bg-surface outline-none focus:shadow-brutal"
              />
            </div>

            <div>
              <label htmlFor="lg-pass" className="block text-xs font-display uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <input
                id="lg-pass"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused(1)}
                onBlur={() => setFocused(null)}
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-ink bg-surface outline-none focus:shadow-brutal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={[
                'mt-2 w-full inline-flex items-center justify-center gap-2',
                'px-6 py-3 bg-primary text-white border-2 border-ink shadow-brutal',
                'font-display uppercase tracking-wide',
                'transition-transform duration-100',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#0A0A0A]',
                'active:translate-x-[6px] active:translate-y-[6px] active:shadow-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin border-2 border-white border-r-transparent rounded-full" />
                  CONECTANDO…
                </>
              ) : (
                <>▶ ENTRAR</>
              )}
            </button>

            {error && (
              <div className="mt-2 p-3 bg-bad text-white border-2 border-ink shadow-brutal-sm font-bold">
                ❌ {error}
              </div>
            )}
          </form>
        </div>

        <p className="text-muted text-xs text-center max-w-md">
          Tus credenciales solo se usan para login. Nada se guarda fuera de tu sesión local.
        </p>
      </div>
    </div>
  );
}
