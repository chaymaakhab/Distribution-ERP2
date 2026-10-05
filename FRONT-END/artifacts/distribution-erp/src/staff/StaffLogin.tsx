import { useState } from 'react';
import {
  Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ShieldCheck, Boxes, Truck, BarChart3,
} from 'lucide-react';
import { ApiError } from './api';
import { useStaffAuth } from './auth';

export default function StaffLogin() {
  const { login } = useStaffAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password, remember);
      setAttempts(0);
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      if (err instanceof ApiError) {
        const first = err.errors && Object.values(err.errors)[0]?.[0];
        setError(first || err.message);
      } else {
        setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sx-login">
      <div className="sx-login-visual">
        <div className="sx-login-brand">
          <span className="sx-brand-mark">H</span>
          <div>
            <b>HERCULES</b>
            <small>ERP · DISTRIBUTION</small>
          </div>
        </div>
        <h2>Un espace de travail pensé pour chaque métier.</h2>
        <p className="sx-login-lead">
          Ventes, stocks, préparation, livraison, comptabilité — chaque rôle dispose de son
          propre tableau de bord, de ses pages et de ses permissions.
        </p>
        <ul className="sx-login-points">
          <li><Boxes size={16} /> Stocks multi-dépôts en temps réel</li>
          <li><Truck size={16} /> Tournées, preuves de livraison et encaissements</li>
          <li><BarChart3 size={16} /> Pilotage commercial et financier</li>
          <li><ShieldCheck size={16} /> Permissions granulaires par rôle</li>
        </ul>
      </div>

      <div className="sx-login-panel">
        <form className="sx-login-form" onSubmit={handleSubmit} noValidate>
          <div className="sx-login-head">
            <h1>Connexion</h1>
            <p>Accédez à votre espace de travail Hercules ERP.</p>
          </div>

          {error && (
            <div className="sx-alert" role="alert">
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <label className="sx-field">
            <span>Email ou téléphone</span>
            <div className="sx-input-wrap">
              <Mail size={16} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="prenom@hercules-erp.ma ou 06…"
                autoComplete="username"
                required
                autoFocus
                data-testid="input-staff-identifier"
              />
            </div>
          </label>

          <label className="sx-field">
            <span>Mot de passe</span>
            <div className="sx-input-wrap">
              <Lock size={16} />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                data-testid="input-staff-password"
              />
              <button
                type="button"
                className="sx-eye"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="sx-login-row">
            <label className="sx-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                data-testid="input-staff-remember"
              />
              <span>Se souvenir de moi</span>
            </label>
            <a
              className="sx-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setError('Contactez votre administrateur pour réinitialiser votre mot de passe.');
              }}
            >
              Mot de passe oublié ?
            </a>
          </div>

          <button
            className="sx-btn-primary"
            type="submit"
            disabled={loading}
            data-testid="button-staff-login"
          >
            {loading ? <><Loader2 size={16} className="sx-spin" /> Connexion…</> : 'Se connecter'}
          </button>

          <div className="sx-demo-hint">
            <b>Comptes de démonstration</b> — mot de passe <code>password</code>
            <div className="sx-demo-grid">
              <span>superadmin@hercules-erp.ma</span>
              <span>commercial@hercules-erp.ma</span>
              <span>depot@hercules-erp.ma</span>
              <span>compta@hercules-erp.ma</span>
              <span>terrain@hercules-erp.ma <em>(Commercial + Livreur)</em></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
