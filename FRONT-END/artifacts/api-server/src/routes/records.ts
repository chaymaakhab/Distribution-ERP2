import { Router, type IRouter } from "express";

const router: IRouter = Router();

// In-memory store initialized with default illustrative records
let erpStore: Record<string, Array<{ id: number; module: string; ref: string; customer: string; city: string; date: string; total: string; status: string; source: string }>> = {
  orders: [
    { id: 1, module: 'orders', ref: 'CMD-2398', customer: 'Atlas Équipements', city: 'Casablanca', date: '25 fév. 2025', total: '14 250,00', status: 'À valider', source: 'Commercial · S. El Amrani' },
    { id: 2, module: 'orders', ref: 'CMD-2397', customer: 'Comptoir Al Amal', city: 'Fès', date: '25 fév. 2025', total: '8 450,00', status: 'En préparation', source: 'Application Mobile' },
    { id: 3, module: 'orders', ref: 'CMD-2396', customer: 'Outillage Rif', city: 'Tétouan', date: '24 fév. 2025', total: '2 450,00', status: 'Échec', source: 'Portail client' },
    { id: 4, module: 'orders', ref: 'CMD-2395', customer: 'Matériaux Saïss', city: 'Fès', date: '23 fév. 2025', total: '19 870,00', status: 'Annulée', source: 'Commercial' },
  ],
  products: [
    { id: 5, module: 'products', ref: 'PRD-0018', customer: 'Perceuse à percussion 850W', city: 'Électroportatif · 20% TVA', date: 'SKU HRC-0850', total: '1 249,00', status: 'Actif', source: 'Carton · 4 unités' },
    { id: 6, module: 'products', ref: 'PRD-0017', customer: 'Disque diamant 230 mm', city: 'Outillage · 20% TVA', date: 'SKU CUT-230D', total: '189,50', status: 'Actif', source: 'Pièce' },
    { id: 7, module: 'products', ref: 'PRD-0016', customer: 'Pompe immergée 1.5 HP', city: 'Pompage · 14% TVA', date: 'SKU PMP-15HP', total: '3 840,00', status: 'Stock faible', source: 'Pièce' },
  ],
  inventory: [
    { id: 8, module: 'inventory', ref: 'HRC-0850', customer: 'Perceuse à percussion 850W', city: 'Dépôt Casablanca', date: '120 / 18 / 102', total: '34 680,00', status: 'Disponible', source: '28 fév. · Réception +24' },
    { id: 9, module: 'inventory', ref: 'PMP-15HP', customer: 'Pompe immergée 1.5 HP', city: 'Dépôt Casablanca', date: '8 / 3 / 5', total: '19 200,00', status: 'Stock faible', source: '27 fév. · Sortie −2' },
  ],
  customers: [
    { id: 10, module: 'customers', ref: 'CLI-0084', customer: 'Atlas Équipements', city: 'Casablanca · +212 522 34 78 90', date: 'Tarif revendeur', total: '42 650,00', status: 'Actif', source: 'Plafond 80 000 DH' },
    { id: 11, module: 'customers', ref: 'CLI-0083', customer: 'BatiPro Maroc', city: 'Rabat · +212 537 22 16 40', date: 'Tarif chantier', total: '18 420,50', status: 'Actif', source: 'Plafond 50 000 DH' },
  ],
  purchasing: [
    { id: 12, module: 'purchasing', ref: 'ACH-0097', customer: 'Société Outillage du Nord', city: 'PO-2025-097 · 26 fév.', date: 'Dépôt Casablanca', total: '38 750,00', status: 'En attente', source: 'Livraison prévue 03 mars' },
  ],
  deliveries: [
    { id: 13, module: 'deliveries', ref: 'LIV-0318', customer: 'Comptoir Al Amal', city: 'Fès · Tournée Nord', date: 'Chauffeur · Youssef A.', total: '8 450,00', status: 'En route', source: 'Espèces à remettre · 4 200 DH' },
  ],
  finance: [
    { id: 14, module: 'finance', ref: 'FAC-2025-184', customer: 'Atlas Équipements', city: 'Émise · 24 fév. 2025', date: 'Échéance 26 mars', total: '24 860,00', status: 'Impayée', source: 'Affecté · 0,00 DH' },
  ],
  reports: [
    { id: 15, module: 'reports', ref: 'RPT-01', customer: 'Ventes par période', city: 'CA HT · comparatif mensuel', date: 'Fév. 2025', total: '1 284 650,00', status: 'Disponible', source: '32 jours de données' },
  ],
  settings: [
    { id: 16, module: 'settings', ref: 'SOC-01', customer: 'GestionERP Distribution SARL', city: 'Casablanca · Maroc', date: 'ICE 003147829000064', total: 'DH · MAD', status: 'Actif', source: 'Société de démonstration' },
  ],
};

let nextId = 100;

router.get("/records", (req, res) => {
  const moduleName = req.query.module as string;
  if (moduleName && erpStore[moduleName]) {
    return res.json(erpStore[moduleName]);
  }
  const allRecords = Object.values(erpStore).flat();
  return res.json(allRecords);
});

router.post("/records", (req, res) => {
  const { module: mod, ref, customer, city, date, total, status, source } = req.body;
  const newRecord = {
    id: nextId++,
    module: mod || "orders",
    ref: ref || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: customer || "Nouveau client",
    city: city || "Casablanca",
    date: date || "Aujourd'hui",
    total: total || "0,00",
    status: status || "Nouveau",
    source: source || "Saisie Directe API",
  };
  const targetModule = newRecord.module;
  if (!erpStore[targetModule]) {
    erpStore[targetModule] = [];
  }
  erpStore[targetModule].unshift(newRecord);
  res.status(201).json(newRecord);
});

router.patch("/records/:ref/status", (req, res) => {
  const { ref } = req.params;
  const { status } = req.body;

  for (const mod of Object.keys(erpStore)) {
    const item = erpStore[mod].find((r) => r.ref === ref);
    if (item) {
      item.status = status;
      return res.json(item);
    }
  }

  return res.status(404).json({ error: "Record not found" });
});

export default router;
