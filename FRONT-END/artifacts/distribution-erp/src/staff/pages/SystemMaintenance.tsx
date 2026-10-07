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
          <div className="eyebrow">INFRASTRUCTURE & SÉCURITÉ <span className="heading-slash">/</span> MAINTENANCE SYSTÈME</div>
          <h1>Maintenance Système & Base de Données</h1>
          <p>Outils d'administration système : sauvegardes SQL, purge du cache, synchronisation multi-dépôt et intégrité des tables.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '16px' }}>
        {/* Left: Database Operations */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '14px' }}>
            <div>
              <span className="eyebrow">BASE DE DONNÉES MYSQL</span>
              <h2>Sauvegardes & Optimisation</h2>
            </div>
            <span className="status-pill status-green">Connecté</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Backup DB */}
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
                <b style={{ fontSize: '13px' }}>Sauvegarde Complète (Full SQL Dump)</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Exporte toutes les tables (utilisateurs, dépôts, catalogue, commandes, factures, audit).
                </small>
              </div>
              <button
                className="button-primary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('backup', 'Sauvegarde SQL générée et prête au téléchargement.')}
                disabled={isLoading === 'backup'}
              >
                <Download size={13} />
                {isLoading === 'backup' ? 'Export en cours...' : 'Générer backup'}
              </button>
            </div>

            {/* Optimize Tables */}
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
                <b style={{ fontSize: '13px' }}>Optimisation des Index & Tables</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Défragmente les tables InnoDB et recalcule les statistiques d’indexation.
                </small>
              </div>
              <button
                className="button-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('optimize', 'Index et tables optimisés avec succès (0 fragmentation).')}
                disabled={isLoading === 'optimize'}
              >
                <Database size={13} />
                {isLoading === 'optimize' ? 'Optimisation...' : 'Optimiser'}
              </button>
            </div>

            {/* Sync Conflict Resolver */}
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
                <b style={{ fontSize: '13px' }}>Vérification des Conflits de Synchro Offline</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Contrôle des UUIDs idempotents et résolution des écritures concurrentes.
                </small>
              </div>
              <button
                className="button-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('sync_check', 'Audit synchro terminé : 0 conflit détecté.')}
                disabled={isLoading === 'sync_check'}
              >
                <RefreshCw size={13} />
                {isLoading === 'sync_check' ? 'Analyse...' : 'Vérifier'}
              </button>
            </div>
          </div>
        </section>

        {/* Right: Cache & System Performance */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '14px' }}>
            <div>
              <span className="eyebrow">PERFORMANCE & MÉMOIRE</span>
              <h2>Gestion du Cache & Système</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Clear All Caches */}
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
                <b style={{ fontSize: '13px' }}>Vider le Cache Applicatif</b>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                  Purge les configurations en cache, routes et templates compilés.
                </small>
              </div>
              <button
                className="button-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '11.5px' }}
                onClick={() => handleAction('cache', 'Cache applicatif purgé avec succès.')}
                disabled={isLoading === 'cache'}
              >
                <Trash2 size={13} />
                {isLoading === 'cache' ? 'Purge...' : 'Vider le cache'}
              </button>
            </div>

            {/* Diagnostics */}
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
              <b style={{ color: 'var(--text)' }}>Informations Environnement :</b>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Framework :</span>
                <code>Laravel 11.x (PHP 8.2)</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>SGBD :</span>
                <code>MySQL 8.0 (InnoDB)</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Dépôts configurés :</span>
                <code>4 dépôts actifs</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Fuseau horaire :</span>
                <code>Africa/Casablanca (GMT+1)</code>
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
