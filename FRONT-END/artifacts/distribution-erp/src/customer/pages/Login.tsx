import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Store, Lock, Phone, Loader2, AlertCircle } from 'lucide-react';
import { api, ApiError, setSession, type CustomerUser } from '../api';

export default function CustomerLogin({ onAuthenticated }: { onAuthenticated: (u: CustomerUser) => void }) {
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(identifier.trim(), password);
      setSession(res.token, res.user);
      onAuthenticated(res.user);
      setLocation(res.home || '/customer/home');
    } catch (err) {
      if (err instanceof ApiError) {
        const first = err.errors && Object.values(err.errors)[0]?.[0];
        setError(first || err.message);
      } else {
        setError('Impossible de joindre le serveur. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cx-login">
      <div className="cx-login-visual">
        <div className="cx-login-brand">
          <span className="cx-brand-mark lg"><Store size={22} /></span>
          <div>
            <b>GESTION ERP</b>
            <small>Distribution · Portail client</small>
          </div>
        </div>
        <h2>Vos produits, vos commandes, votre solde — au même endroit.</h2>
        <ul className="cx-login-points">
          <li>Catalogue avec vos tarifs personnalisés</li>
          <li>Passage de commande en quelques clics</li>
          <li>Suivi des livraisons et des factures</li>
        </ul>
      </div>

      <div className="cx-login-panel">
        <form className="cx-login-form" onSubmit={handleSubmit}>
          <div className="cx-login-head">
            <h1>Connexion</h1>
            <p>Accédez à votre espace client Gestion ERP.</p>
          </div>

          {error && (
            <div className="cx-alert cx-alert-error" role="alert">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <label className="cx-field">
            <span>Email ou téléphone</span>
            <div className="cx-input-wrap">
              <Phone size={16} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="contact@entreprise.ma ou 06…"
                autoComplete="username"
                required
                autoFocus
                data-testid="input-customer-identifier"
              />
            </div>
          </label>

          <label className="cx-field">
            <span>Mot de passe</span>
            <div className="cx-input-wrap">
              <Lock size={16} />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                data-testid="input-customer-password"
              />
              <button
                type="button"
                className="cx-eye"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Masquer' : 'Afficher'}
                tabIndex={-1}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="cx-login-row">
            <label className="cx-check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Se souvenir de moi</span>
            </label>
            <a className="cx-link" href="#" onClick={(e) => e.preventDefault()}>Mot de passe oublié ?</a>
          </div>

          <button className="cx-btn cx-btn-primary cx-btn-block" type="submit" disabled={loading} data-testid="button-customer-login">
            {loading ? <><Loader2 size={16} className="cx-spin" /> Connexion…</> : 'Se connecter'}
          </button>

          <p className="cx-login-hint">
            Démo : <b>contact@atlas-equipements.ma</b> / <b>client1234</b>
          </p>
        </form>
      </div>
    </div>
  );
}
