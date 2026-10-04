import React, { useState } from 'react';
import { FileText, Plus, Download, Printer, Search, CheckCircle, Clock, XCircle, Send, Eye } from 'lucide-react';

interface InvoiceQuoteItem {
  id: string;
  number: string;
  type: 'invoice' | 'quote';
  partnerName: string;
  date: string;
  dueDate: string;
  amountHT: number;
  tva: number;
  amountTTC: number;
  status: 'brouillon' | 'envoye' | 'accepte' | 'refuse';
}

const initialItems: InvoiceQuoteItem[] = [
  {
    id: '1',
    number: 'DEV-2025-0042',
    type: 'quote',
    partnerName: 'Outillage du Nord SARL',
    date: '2025-02-20',
    dueDate: '2025-03-20',
    amountHT: 45000,
    tva: 9000,
    amountTTC: 54000,
    status: 'envoye'
  },
  {
    id: '2',
    number: 'DEV-2025-0043',
    type: 'quote',
    partnerName: 'Electro Maroc Distribution',
    date: '2025-02-22',
    dueDate: '2025-03-22',
    amountHT: 28000,
    tva: 5600,
    amountTTC: 33600,
    status: 'accepte'
  },
  {
    id: '3',
    number: 'FAC-2025-0188',
    type: 'invoice',
    partnerName: 'HydroTech Maghreb',
    date: '2025-02-24',
    dueDate: '2025-03-24',
    amountHT: 112000,
    tva: 22400,
    amountTTC: 134400,
    status: 'envoye'
  },
  {
    id: '4',
    number: 'DEV-2025-0044',
    type: 'quote',
    partnerName: 'Quincaillerie Centrale Agadir',
    date: '2025-02-25',
    dueDate: '2025-03-25',
    amountHT: 15500,
    tva: 3100,
    amountTTC: 18600,
    status: 'brouillon'
  }
];

export function InvoicingPage() {
  const [items, setItems] = useState<InvoiceQuoteItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<'all' | 'invoice' | 'quote'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InvoiceQuoteItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formNumber, setFormNumber] = useState('');
  const [formType, setFormType] = useState<'invoice' | 'quote'>('quote');
  const [formPartner, setFormPartner] = useState('');
  const [formAmountHT, setFormAmountHT] = useState('');

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = item.number.toLowerCase().includes(search.toLowerCase()) ||
                          item.partnerName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const ht = parseFloat(formAmountHT) || 0;
    const tva = ht * 0.2;
    const newItem: InvoiceQuoteItem = {
      id: String(Date.now()),
      number: formNumber || `${formType === 'invoice' ? 'FAC' : 'DEV'}-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      type: formType,
      partnerName: formPartner,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      amountHT: ht,
      tva: tva,
      amountTTC: ht + tva,
      status: 'brouillon'
    };
    setItems([newItem, ...items]);
    setShowModal(false);
    setFormNumber('');
    setFormPartner('');
    setFormAmountHT('');
  };

  const updateStatus = (id: string, newStatus: InvoiceQuoteItem['status']) => {
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  const getStatusBadge = (status: InvoiceQuoteItem['status']) => {
    switch (status) {
      case 'brouillon':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">Brouillon</span>;
      case 'envoye':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">Envoyé</span>;
      case 'accepte':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Accepté</span>;
      case 'refuse':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-200">Refusé</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-blue-600 uppercase">COMPTABILITÉ & FOURNISSEURS</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Factures & Devis Fournisseurs</h1>
          <p className="text-xs text-slate-500">Gestion du cycle de facturation, devis d'achats et documents officiels PDF.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 shadow-xs"
        >
          <Plus size={16} /> Nouveau Devis / Facture Fournisseur
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 border-b md:border-b-0 pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'all' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Tous ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'quote' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Devis Fournisseurs ({items.filter(i => i.type === 'quote').length})
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'invoice' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Factures ({items.filter(i => i.type === 'invoice').length})
          </button>
        </div>

        <div className="relative flex-1 md:max-w-xs">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher réf, partenaire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium outline-none bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-600 uppercase">
              <th className="p-3">Référence</th>
              <th className="p-3">Type</th>
              <th className="p-3">Fournisseur / Partenaire</th>
              <th className="p-3">Émission / Échéance</th>
              <th className="p-3 text-right">Montant HT</th>
              <th className="p-3 text-right">Montant TTC</th>
              <th className="p-3">Statut Workflow</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono font-bold text-blue-600">{item.number}</td>
                <td className="p-3 font-semibold text-slate-600">{item.type === 'invoice' ? 'Facture' : 'Devis'}</td>
                <td className="p-3 font-bold text-slate-900">{item.partnerName}</td>
                <td className="p-3 text-slate-500">{item.date} <span className="text-[10px] text-slate-400">({item.dueDate})</span></td>
                <td className="p-3 text-right font-mono font-semibold">{item.amountHT.toLocaleString()} DH</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">{item.amountTTC.toLocaleString()} DH</td>
                <td className="p-3">{getStatusBadge(item.status)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Aperçu & PDF"
                    >
                      <Eye size={16} />
                    </button>
                    {item.status === 'brouillon' && (
                      <button
                        onClick={() => updateStatus(item.id, 'envoye')}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Marquer Envoyé"
                      >
                        <Send size={15} />
                      </button>
                    )}
                    {item.status === 'envoye' && (
                      <>
                        <button
                          onClick={() => updateStatus(item.id, 'accepte')}
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Accepter"
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'refuse')}
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Refuser"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-6">
            {/* Document Print Area */}
            <div className="border border-slate-200 p-6 rounded-lg space-y-6 bg-white" id="printable-pdf">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">GestionERP Distribution SARL</h2>
                  <p className="text-xs text-slate-500">Siège Social: ZI Aïn Sebaâ, Casablanca</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ICE: 003147829000064 | IF: 4829104 | RC: 104928</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase block">{selectedItem.type === 'invoice' ? 'FACTURE FOURNISSEUR' : 'DEVIS FOURNISSEUR'}</span>
                  <h3 className="text-lg font-mono font-bold text-slate-900">{selectedItem.number}</h3>
                  <p className="text-xs text-slate-500">Date: {selectedItem.date}</p>
                  <p className="text-xs text-slate-500 font-arabic dir-rtl mt-0.5">فاتورة / عرض سعر الشراء</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Destinataire / Fournisseur</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedItem.partnerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Statut Workflow</span>
                  <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b font-bold text-slate-600">
                    <th className="py-2">Désignation</th>
                    <th className="py-2 text-right">Montant HT</th>
                    <th className="py-2 text-right">TVA (20%)</th>
                    <th className="py-2 text-right">Montant TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 font-mono">
                  <tr>
                    <td className="py-3 font-sans font-medium">Prestation / Fourniture d'équipements selon accord commercial</td>
                    <td className="py-3 text-right">{selectedItem.amountHT.toLocaleString()} DH</td>
                    <td className="py-3 text-right">{selectedItem.tva.toLocaleString()} DH</td>
                    <td className="py-3 text-right font-bold text-slate-900">{selectedItem.amountTTC.toLocaleString()} DH</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t pt-4 flex justify-between items-center text-xs text-slate-500">
                <span>Bon pour accord et règlement sous 30 jours.</span>
                <span className="font-arabic dir-rtl">GestionERP Distribution SARL — جميع الحقوق محفوظة</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Printer size={15} /> Imprimer / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal New Record */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Créer un Devis ou Facture Fournisseur</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type de Document</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full p-2 border rounded-md bg-white font-medium"
                >
                  <option value="quote">Devis Fournisseur</option>
                  <option value="invoice">Facture Fournisseur</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom du Fournisseur</label>
                <input
                  type="text"
                  placeholder="Ex: Outillage du Nord SARL"
                  value={formPartner}
                  onChange={e => setFormPartner(e.target.value)}
                  className="w-full p-2 border rounded-md font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Montant Total HT (DH)</label>
                <input
                  type="number"
                  placeholder="Ex: 25000"
                  value={formAmountHT}
                  onChange={e => setFormAmountHT(e.target.value)}
                  className="w-full p-2 border rounded-md font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700"
                >
                  Créer Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
