import { useState, useRef, useEffect } from 'react';
import {
  PackageCheck, Scan, CheckCircle2, AlertTriangle, Barcode,
  ArrowRight, Check, X, ShieldAlert, Truck, FileText, Printer,
  Camera, CameraOff, RefreshCw, Volume2,
} from 'lucide-react';
import DeliverySlipDocumentModal, { type DeliverySlipData } from '../components/DeliverySlipDocumentModal';

interface PrepItem {
  id: number;
  barcode: string;
  name: string;
  location: string;
  order_ref: string;
  client: string;
  requested_qty: number;
  prepared_qty: number;
  status: 'pending' | 'ok' | 'short';
}

const INITIAL_PREP_ITEMS: PrepItem[] = [
  {
    id: 1,
    barcode: '6111234567890',
    name: 'Perceuse à percussion 850W',
    location: 'Allée A · Rayon 03 · Niv 2',
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    requested_qty: 4,
    prepared_qty: 4,
    status: 'ok',
  },
  {
    id: 2,
    barcode: '6119876543210',
    name: 'Câble électrique 3G2.5 (Couronne 100m)',
    location: 'Allée B · Rayon 01 · Niv 1',
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    requested_qty: 2,
    prepared_qty: 2,
    status: 'ok',
  },
  {
    id: 3,
    barcode: '6115556667778',
    name: 'Disque diamant 230 mm (Lot 5)',
    location: 'Allée C · Rayon 02 · Niv 3',
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements',
    requested_qty: 6,
    prepared_qty: 4,
    status: 'short', // 2 missing!
  },
  {
    id: 4,
    barcode: '6113334445556',
    name: 'Pompe immergée 1.5 HP',
    location: 'Allée D · Rayon 04 · Niv 1',
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements',
    requested_qty: 1,
    prepared_qty: 0,
    status: 'pending',
  },
];

export default function PreparationDashboard() {
  const [items, setItems] = useState<PrepItem[]>(INITIAL_PREP_ITEMS);
  const [scannedCode, setScannedCode] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'grouped' | 'by_order'>('grouped');
  const [activeBlOrder, setActiveBlOrder] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Camera Barcode Scanning States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function playBeep() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  async function startCamera(facing: 'environment' | 'user' = cameraFacing) {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);

      // Web BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'],
          });
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const val = barcodes[0].rawValue;
                  handleScan(val);
                }
              } catch {}
            }
          }, 500);
        } catch {}
      }
    } catch (err: any) {
      setCameraError("Accès caméra refusé ou non supporté. Veuillez autoriser la caméra dans votre navigateur.");
      setCameraActive(false);
    }
  }

  function stopCamera() {
    clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function toggleCameraFacing() {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    if (cameraActive) {
      startCamera(next);
    }
  }

  useEffect(() => {
    return () => {
      clearInterval(scanIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  function handleScan(codeToTest?: string) {
    const code = (codeToTest || scannedCode).trim();
    if (!code) return;

    const match = items.find((it) => it.barcode === code || it.barcode.endsWith(code));
    if (match) {
      playBeep();
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === match.id) {
            const nextQty = Math.min(it.requested_qty, it.prepared_qty + 1);
            return {
              ...it,
              prepared_qty: nextQty,
              status: nextQty === it.requested_qty ? 'ok' : 'pending',
            };
          }
          return it;
        }),
      );
      setScanMessage({ text: `Article scanné : ${match.name} (+1 unité)`, ok: true });
      setScannedCode('');
    } else {
      setScanMessage({ text: `Code-barres inconnu (${code}) pour cette tournée !`, ok: false });
    }

    setTimeout(() => setScanMessage(null), 3500);
  }

  function setDirectQty(id: number, qty: number) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const status = qty === it.requested_qty ? 'ok' : qty < it.requested_qty ? 'short' : 'ok';
          return { ...it, prepared_qty: qty, status };
        }
        return it;
      }),
    );
  }

  const allComplete = items.every((it) => it.prepared_qty > 0);
  const totalRequested = items.reduce((a, b) => a + b.requested_qty, 0);
  const totalPrepared = items.reduce((a, b) => a + b.prepared_qty, 0);

  return (
    <div className="dashboard-page prep-workspace">
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">ESPACE PRÉPARATION <span className="eyebrow-sep">/</span> ENTREPÔT & SCANNING</span>
          <h1>Bon de Préparation Groupé<span className="title-period">.</span></h1>
          <p>Tournée Centre (Casablanca Sud) · 2 commandes à préparer avant chargement véhicule.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="button-secondary"
            onClick={() => setActiveBlOrder('CMD-2405')}
            title="Générer et imprimer le Bon de Livraison pour l'expédition"
          >
            <Printer size={15} /> Éditer Bon de Livraison (BL)
          </button>
          <button
            className="button-primary"
            style={{ background: '#22c55e', borderColor: '#16a34a' }}
            onClick={() => notify('Bon de préparation validé ! Prêt pour affectation et chargement du livreur.')}
          >
            <CheckCircle2 size={16} /> Valider la préparation tournée
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card metric-blue">
          <div className="metric-top">
            <span>Progression Préparation</span>
            <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <PackageCheck size={16} />
            </div>
          </div>
          <div className="metric-number">
            {totalPrepared} / {totalRequested} <small>unités</small>
          </div>
          <div className="metric-foot">
            <span className="metric-change change-up">{Math.round((totalPrepared / totalRequested) * 100)}%</span>
            <span>Articles préparés</span>
          </div>
        </div>

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Articles Manquants</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-number">{totalRequested - totalPrepared} <small>unités</small></div>
          <div className="metric-foot">
            <span>Reliquat à signaler</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Commandes concernées</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <Truck size={16} />
            </div>
          </div>
          <div className="metric-number">2 <small>clients</small></div>
          <div className="metric-foot">
            <span>BatiPro Maroc & Atlas Équipements</span>
          </div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-top">
            <span>Statut Tournée</span>
            <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <Scan size={16} />
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '18px' }}>En préparation</div>
          <div className="metric-foot">
            <span>Départ prévu 11h30</span>
          </div>
        </div>
      </div>

      {/* Interactive Barcode Scanner Box & Live Camera Viewfinder */}
      <section
        className="panel"
        style={{
          margin: '14px 0',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.04))',
          borderColor: 'rgba(59,130,246,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: cameraActive ? '#22c55e' : '#3b82f6', color: '#fff', display: 'grid', placeItems: 'center', transition: 'background 0.2s ease' }}>
              {cameraActive ? <Camera size={22} /> : <Barcode size={22} />}
            </div>
            <div>
              <b style={{ fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Scan Code-Barres & Caméra Préparateur
                {cameraActive && (
                  <span className="status-pill status-green" style={{ fontSize: '10px' }}>
                    <i /> Caméra en direct
                  </span>
                )}
              </b>
              <small style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={12} style={{ color: '#22c55e' }} /> Bip sonore actif · Viseur optique EAN-13 & QR
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={cameraActive ? 'button-secondary' : 'button-primary'}
              onClick={cameraActive ? stopCamera : () => startCamera()}
              style={{
                height: '38px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 700,
                background: cameraActive ? '#ef4444' : '#22c55e',
                borderColor: cameraActive ? '#dc2626' : '#16a34a',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              {cameraActive ? (
                <>
                  <CameraOff size={15} /> Couper la Caméra
                </>
              ) : (
                <>
                  <Camera size={15} /> Activer Caméra Scanner
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Scanner EAN manuel..."
                style={{
                  height: '38px',
                  width: '180px',
                  borderRadius: '6px',
                  padding: '0 10px',
                  border: '1px solid var(--line)',
                  background: 'var(--navy-2)',
                  color: 'var(--text)',
                  fontSize: '12px',
                }}
              />
              <button className="button-primary" onClick={() => handleScan()} style={{ height: '38px', padding: '0 12px' }}>
                <Scan size={14} /> Scanner
              </button>
            </div>
          </div>
        </div>

        {/* Live Camera Viewfinder Overlay */}
        {cameraActive && (
          <div
            style={{
              marginTop: '14px',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative',
              background: '#0a0f18',
              border: '2px solid #22c55e',
              maxWidth: '560px',
              marginInline: 'auto',
              boxShadow: '0 8px 30px rgba(34, 197, 94, 0.2)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '280px',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Viewfinder Target Box with animated Laser */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '260px',
                  height: '140px',
                  border: '2px dashed #22c55e',
                  borderRadius: '12px',
                  position: 'relative',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                }}
              >
                {/* Laser scan line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#22c55e',
                    boxShadow: '0 0 10px #22c55e, 0 0 20px #22c55e',
                    animation: 'laserScan 1.6s ease-in-out infinite alternate',
                  }}
                />
                <style>{`
                  @keyframes laserScan {
                    0% { top: 6px; opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { top: 132px; opacity: 0.8; }
                  }
                `}</style>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-28px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    color: '#e2e8f0',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  Centrez le code-barres dans le cadre
                </div>
              </div>
            </div>

            {/* Bottom floating camera controls */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 5,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={toggleCameraFacing}
                style={{
                  height: '32px',
                  fontSize: '11px',
                  padding: '0 10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  border: '1px solid #475569',
                }}
                title="Changer d'objectif caméra"
              >
                <RefreshCw size={13} /> {cameraFacing === 'environment' ? 'Caméra Arrière' : 'Caméra Avant'}
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  // Capture simulate current pending item in view
                  const pending = items.find((i) => i.prepared_qty < i.requested_qty) || items[0];
                  if (pending) handleScan(pending.barcode);
                }}
                style={{
                  height: '32px',
                  fontSize: '11px',
                  padding: '0 12px',
                  background: '#22c55e',
                  borderColor: '#16a34a',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                <Scan size={13} /> Capturer le code visé
              </button>
            </div>
          </div>
        )}

        {cameraError && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Quick simulator buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Simulateur rapide code-barres :</span>
          {items.map((it) => (
            <button
              key={it.id}
              className="button-secondary"
              style={{ fontSize: '10.5px', height: '26px', padding: '0 8px' }}
              onClick={() => handleScan(it.barcode)}
            >
              +1 {it.name.split(' ')[0]} ({it.barcode.slice(-4)})
            </button>
          ))}
        </div>

        {scanMessage && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: scanMessage.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: scanMessage.ok ? '#22c55e' : '#ef4444',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {scanMessage.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {scanMessage.text}
          </div>
        )}
      </section>

      {/* Preparation List Table */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">ARTICLES DU BON DE PRÉPARATION</span>
            <h2>Liste ordonnée par emplacement entrepôt</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {items.length} références à préparer
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>EMPLACEMENT</th>
                <th>DÉSIGNATION & CODE-BARRES</th>
                <th>COMMANDE & DESTINATAIRE</th>
                <th>DEMANDÉ</th>
                <th>PRÉPARÉ REÇU</th>
                <th>MANQUANT / ÉCART</th>
                <th>STATUT PRÉPARATION</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const missing = it.requested_qty - it.prepared_qty;
                return (
                  <tr key={it.id}>
                    <td>
                      <b style={{ color: '#38bdf8' }}>{it.location}</b>
                    </td>
                    <td>
                      <b className="table-main">{it.name}</b>
                      <small style={{ display: 'block', color: 'var(--muted)', fontFamily: 'var(--app-font-mono)' }}>
                        EAN: {it.barcode}
                      </small>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setActiveBlOrder(it.order_ref)}
                        className="table-ref"
                        style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        title="Consulter le Bon de Livraison officiel pour cette commande"
                      >
                        {it.order_ref}
                      </button>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>{it.client}</small>
                    </td>
                    <td>
                      <b style={{ fontSize: '13px' }}>{it.requested_qty}</b>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          max={it.requested_qty}
                          value={it.prepared_qty}
                          onChange={(e) => setDirectQty(it.id, Number(e.target.value))}
                          style={{
                            width: '54px',
                            height: '30px',
                            textAlign: 'center',
                            borderRadius: '4px',
                            border: '1px solid var(--line)',
                            background: 'var(--navy-2)',
                            color: 'var(--text)',
                            fontWeight: 700,
                          }}
                        />
                        <button
                          className="button-secondary"
                          style={{ height: '30px', padding: '0 8px', fontSize: '11px' }}
                          onClick={() => setDirectQty(it.id, it.requested_qty)}
                          title="Marquer comme complet"
                        >
                          Max
                        </button>
                      </div>
                    </td>
                    <td>
                      {missing > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px' }}>
                          −{missing} manquant(s)
                        </span>
                      ) : (
                        <span style={{ color: '#22c55e', fontSize: '12px' }}>0 (Complet)</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          it.status === 'ok'
                            ? 'status-green'
                            : it.status === 'short'
                            ? 'status-red'
                            : 'status-amber'
                        }`}
                      >
                        <i /> {it.status === 'ok' ? 'Complet' : it.status === 'short' ? 'Incomplet' : 'À préparer'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Official Delivery Slip (BL) Document Modal ── */}
      {activeBlOrder && (
        <DeliverySlipDocumentModal
          slip={{
            bl_ref: `BL-2026-${activeBlOrder.replace('CMD-', '')}`,
            order_ref: activeBlOrder,
            client: activeBlOrder === 'CMD-2405' ? 'BatiPro Maroc' : 'Atlas Équipements',
            client_address: activeBlOrder === 'CMD-2405' ? 'Lot 14, Zone Industrielle Takaddoum' : '12, Boulevard Zerktouni',
            client_city: activeBlOrder === 'CMD-2405' ? 'Rabat' : 'Casablanca',
            client_phone: activeBlOrder === 'CMD-2405' ? '+212 537 22 16 40' : '+212 522 34 78 90',
            whatsapp: activeBlOrder === 'CMD-2405' ? '212661987654' : '212661234567',
            driver_name: 'Mehdi Lahlou',
            vehicle: 'Renault Master 23-A-54321',
            tour_ref: 'TRN-2026-08',
            date_dispatched: '28 Fév 2025',
            warehouse: 'Casablanca (DEP-01 Central)',
            status: 'En cours',
            lines: items
              .filter((it) => it.order_ref === activeBlOrder)
              .map((it) => ({
                sku: it.barcode.slice(-7),
                name: it.name,
                qty_ordered: it.requested_qty,
                qty_delivered: it.prepared_qty,
                unit: 'Colis',
              })),
          }}
          onClose={() => setActiveBlOrder(null)}
        />
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
