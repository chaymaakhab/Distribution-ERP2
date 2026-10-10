import { useState } from 'react';
import {
  Database, RefreshCw, HardDrive, ShieldCheck, CheckCircle2,
  AlertTriangle, Download, Trash2, Cpu, Activity, Lock,
} from 'lucide-react';

export default function SystemMaintenance() {
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleAction(actionKey: string, successMsg: string) {
    setIsLoading(actionKey);
    setTimeout(() => {
      setIsLoading(null);
      notify(successMsg);
    }, 1000);
  }

  return (
    <div className="module-page maintenance-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SÉCURITÉ DES DONNÉES <span className="heading-slash">/</span> SAUVEGARDES &amp; MAINTENANCE</div>
          <h1>Sauvegardes &amp; Maintenance</h1>
          <p>Sauvegarde des données de l’entreprise, nettoyage et vérification de la cohérence entre les dépôts.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '16px' }}>
        {/* Left: Data Operations */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '14px' }}>
            <div>
              <span className="eyebrow">DONNÉES DE L’ENTREPRISE</span>
              <h2>Sauvegardes &amp; Vérifications</h2>
            </div>
            <span className="status-pill status-green">Opérationnel</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Backup */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--navy-2)',
              }}
            >
              <div>
                <b style={{ fontSize: '13px' }}>Sauvegarde Complète</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Copie de toutes les données (utilisateurs, dépôts, catalogue, commandes, factures, historique).
                </small>
              </div>
              <button
                className="button-primary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('backup', 'Sauvegarde générée et prête au téléchargement.')}
                disabled={isLoading === 'backup'}
              >
                <Download size={13} />
                {isLoading === 'backup' ? 'Sauvegarde en cours...' : 'Lancer la sauvegarde'}
              </button>
            </div>

            {/* Optimize */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--navy-2)',
              }}
            >
              <div>
                <b style={{ fontSize: '13px' }}>Accélérer l’application</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Réorganise les données pour des recherches et des rapports plus rapides.
                </small>
              </div>
              <button
                className="button-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('optimize', 'Optimisation terminée avec succès.')}
                disabled={isLoading === 'optimize'}
              >
                <Database size={13} />
                {isLoading === 'optimize' ? 'Optimisation...' : 'Optimiser'}
              </button>
            </div>

            {/* Sync check */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--navy-2)',
              }}
            >
              <div>
                <b style={{ fontSize: '13px' }}>Vérifier la cohérence entre dépôts</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Contrôle les opérations saisies hors connexion par les commerciaux et livreurs (aucun doublon).
                </small>
              </div>
              <button
                className="button-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('sync_check', 'Vérification terminée : aucune anomalie détectée.')}
                disabled={isLoading === 'sync_check'}
              >
                <RefreshCw size={13} />
                {isLoading === 'sync_check' ? 'Analyse...' : 'Vérifier'}
              </button>
            </div>
          </div>
        </section>

        {/* Right: Performance */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '14px' }}>
            <div>
              <span className="eyebrow">PERFORMANCE</span>
              <h2>Nettoyage &amp; Informations</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Clear cache */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--navy-2)',
              }}
            >
              <div>
                <b style={{ fontSize: '13px' }}>Rafraîchir l’application</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Supprime les fichiers temporaires pour afficher les dernières modifications.
                </small>
              </div>
              <button
                className="button-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('cache', 'Application rafraîchie avec succès.')}
                disabled={isLoading === 'cache'}
              >
                <Trash2 size={13} />
                {isLoading === 'cache' ? 'Nettoyage...' : 'Rafraîchir'}
              </button>
            </div>

            {/* Info */}
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.05)',
                border: '1px dashed var(--line)',
                fontSize: '11.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <b style={{ color: 'var(--text)' }}>Informations générales :</b>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Dernière sauvegarde :</span>
                <b>Aujourd’hui à 03:00</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Dépôts configurés :</span>
                <b>4 dépôts actifs</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Fuseau horaire :</span>
                <b>Maroc (Casablanca)</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
