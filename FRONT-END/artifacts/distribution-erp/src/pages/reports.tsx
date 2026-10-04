import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, Printer, Filter, Calendar, MapPin, Building, User, FileText } from 'lucide-react';

const salesData = [
  { name: '01 Fév', total: 42000, commercial: 25000, client: 17000 },
  { name: '05 Fév', total: 68000, commercial: 45000, client: 23000 },
  { name: '10 Fév', total: 55000, commercial: 38000, client: 17000 },
  { name: '15 Fév', total: 89000, commercial: 60000, client: 29000 },
  { name: '20 Fév', total: 112000, commercial: 78000, client: 34000 },
  { name: '25 Fév', total: 94000, commercial: 62000, client: 32000 },
  { name: '28 Fév', total: 128000, commercial: 85000, client: 43000 },
];

const commercialData = [
  { name: 'Youssef El Amrani', sales: 342000, target: 300000 },
  { name: 'Karim Benjeloun', sales: 285000, target: 280000 },
  { name: 'Mehdi Lahlou', sales: 210000, target: 250000 },
  { name: 'Siham Berrada', sales: 298000, target: 270000 },
];

const cityData = [
  { name: 'Casablanca', sales: 520000 },
  { name: 'Rabat', sales: 280000 },
  { name: 'Tanger', sales: 190000 },
  { name: 'Marrakech', sales: 165000 },
  { name: 'Fès', sales: 129000 },
];

const productData = [
  { name: 'Perceuse 850W', qty: 320, total: 399680 },
  { name: 'Pompe 1.5HP', qty: 85, total: 326400 },
  { name: 'Câble 3G2.5', qty: 1840, total: 235520 },
  { name: 'Disque Diamant 230mm', qty: 950, total: 180025 },
];

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('2025-02-01 - 2025-02-28');
  const [commercialFilter, setCommercialFilter] = useState('Tous');
  const [cityFilter, setCityFilter] = useState('Toutes');
  const [depotFilter, setDepotFilter] = useState('Tous');

  const exportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date;Chiffre d'affaires HT;Commercial;Ville;Dépôt\n"
      + salesData.map(e => `${e.name};${e.total} DH;${commercialFilter};${cityFilter};${depotFilter}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rapport_Ventes_GestionERP_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-container p-6 space-y-6">
      {/* Header Print-Only Section */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GestionERP Distribution SARL</h1>
            <p className="text-sm text-gray-600">Société de Distribution ERP Maroc</p>
            <p className="text-xs text-gray-500">ICE: 003147829000064 | IF: 4829104 | RC: 104928 Casablanca</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600">RAPPORT D'ACTIVITÉ & ANALYSE</h2>
            <p className="text-xs text-gray-500">Généré le: 28/02/2025</p>
            <p className="text-xs text-gray-500 dir-rtl font-arabic">تقرير النشاط والتحليل المالي</p>
          </div>
        </div>
      </div>

      {/* Screen Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-mono font-semibold text-gray-500">RAPPORTS & ANALYTICS / PILOTAGE</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Rapports Professionnels Ventes & Distribution</h1>
          <p className="text-sm text-gray-600">Visualisation détaillée des performances graphiques et exports officiels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportExcel} className="button-secondary flex items-center gap-2 border px-3 py-2 rounded-md bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700">
            <Download size={15} /> Export Excel (CSV)
          </button>
          <button onClick={handlePrint} className="button-primary flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-xs font-semibold">
            <Printer size={15} /> Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-gray-50">
          <Calendar size={16} className="text-gray-500" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-gray-500">Période</label>
            <input type="text" value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full bg-transparent text-xs font-medium outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-gray-50">
          <User size={16} className="text-gray-500" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-gray-500">Commercial</label>
            <select value={commercialFilter} onChange={e => setCommercialFilter(e.target.value)} className="w-full bg-transparent text-xs font-medium outline-none">
              <option value="Tous">Tous les commerciaux</option>
              <option value="Youssef El Amrani">Youssef El Amrani</option>
              <option value="Karim Benjeloun">Karim Benjeloun</option>
              <option value="Mehdi Lahlou">Mehdi Lahlou</option>
              <option value="Siham Berrada">Siham Berrada</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-gray-50">
          <MapPin size={16} className="text-gray-500" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-gray-500">Ville</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full bg-transparent text-xs font-medium outline-none">
              <option value="Toutes">Toutes les villes</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Tanger">Tanger</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Fès">Fès</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-gray-50">
          <Building size={16} className="text-gray-500" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-gray-500">Dépôt</label>
            <select value={depotFilter} onChange={e => setDepotFilter(e.target.value)} className="w-full bg-transparent text-xs font-medium outline-none">
              <option value="Tous">Tous les dépôts</option>
              <option value="Casablanca">Dépôt Principal Casablanca</option>
              <option value="Rabat">Dépôt Régional Rabat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-gray-500">Chiffre d'affaires HT</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">1 284 650 <small className="text-xs text-gray-500 font-normal">DH</small></p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+12.8% vs mois dernier</span>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-gray-500">Commandes Validées</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">186</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+8.3% d'augmentation</span>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-gray-500">Objectif Commercial Global</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">1 135 000 <small className="text-xs text-gray-500 font-normal">DH</small></p>
          <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">113% de réalisation</span>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-gray-500">Taux de Livraison Réussie</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">94.2%</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">67 tournées exécutées</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Évolution du CA par Jour (DH)</h3>
            <span className="text-xs text-gray-500">Février 2025</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} name="Total CA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commercial Sales Performance */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Ventes par Commercial (Réalisé vs Objectif)</h3>
            <span className="text-xs text-gray-500">En DH</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commercialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#2563eb" name="Réalisé" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#cbd5e1" name="Objectif" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by City */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Répartition du CA par Ville</h3>
            <span className="text-xs text-gray-500">Maroc</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="sales" fill="#0891b2" radius={[0, 4, 4, 0]} name="Ventes (DH)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Sales */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Top Produits Vendus</h3>
            <span className="text-xs text-gray-500">Par chiffre d'affaires</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} name="Chiffre d'Affaires (DH)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Printable Legal Footer */}
      <div className="hidden print:block mt-12 pt-6 border-t text-center text-xs text-gray-500">
        <p>GestionERP Distribution SARL — Capital Social: 1.000.000 MAD — Siège Social: Boulevard Zektouni, Casablanca</p>
        <p className="mt-1 dir-rtl font-arabic">GestionERP Distribution SARL — الدار البيضاء - المغرب</p>
      </div>
    </div>
  );
}
