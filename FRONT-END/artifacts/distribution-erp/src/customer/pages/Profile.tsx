import { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, UserCheck, MessageCircle, Loader2, Check, Save } from 'lucide-react';
import { api, ApiError, type CustomerUser } from '../api';
import { PageHeader } from '../CustomerApp';

export default function Profile({ user, onUpdated }: { user: CustomerUser; onUpdated: (u: CustomerUser) => void }) {
  const [form, setForm] = useState({
    company: user.company ?? '',
    address: user.address ?? '',
    phone: user.phone ?? '',
    locale: user.locale ?? 'fr',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.updateProfile(form);
      onUpdated(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  const waLink = user.phone ? `https://wa.me/${user.phone.replace(/[^0-9]/g, '')}` : '#';

  return (
    <div className="cx-page">
      <PageHeader kicker="COMPTE" title="Mon profil" description="Informations de votre société, adresses et préférences." />

      <div className="cx-profile-grid">
        <form className="cx-panel" onSubmit={submit}>
          <div className="cx-panel-head"><h2><Building2 size={15} /> Informations</h2></div>

          {error && <div className="cx-alert cx-alert-error">{error}</div>}
          {saved && <div className="cx-alert cx-alert-success"><Check size={15} /> Profil mis à jour.</div>}

          <label className="cx-field">
            <span>Société</span>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </label>
          <label className="cx-field">
            <span><MapPin size={13} /> Adresse</span>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="cx-field">
            <span><Phone size={13} /> Téléphone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="cx-field">
            <span><Globe size={13} /> Langue</span>
            <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </label>

          <button className="cx-btn cx-btn-primary" type="submit" disabled={saving}>
            {saving ? <><Loader2 className="cx-spin" size={15} /> Enregistrement…</> : <><Save size={15} /> Enregistrer</>}
          </button>
        </form>

        <div className="cx-profile-side">
          <div className="cx-panel">
            <div className="cx-panel-head"><h2><Mail size={15} /> Contact</h2></div>
            <div className="cx-info-row"><span>Code client</span><b>{user.code}</b></div>
            <div className="cx-info-row"><span>Email</span><b>{user.email || '—'}</b></div>
            <div className="cx-info-row"><span>Ville</span><b>{user.city || '—'}</b></div>
            <div className="cx-info-row"><span>Grille tarifaire</span><b className="cx-cap">{user.price_tier}</b></div>
            <div className="cx-info-row"><span>Crédit autorisé</span><b>{user.credit_limit.toLocaleString('fr-FR')} DH</b></div>
          </div>

          {user.commercial && (
            <div className="cx-panel">
              <div className="cx-panel-head"><h2><UserCheck size={15} /> Votre commercial</h2></div>
              <div className="cx-commercial">
                <span className="cx-avatar lg">{user.commercial.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                <div>
                  <b>{user.commercial.name}</b>
                  <small>{user.commercial.email}</small>
                </div>
              </div>
              <div className="cx-commercial-actions">
                <a className="cx-btn cx-btn-ghost sm" href={`mailto:${user.commercial.email}`}><Mail size={14} /> Email</a>
                <a className="cx-btn cx-btn-ghost sm" href={waLink} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
