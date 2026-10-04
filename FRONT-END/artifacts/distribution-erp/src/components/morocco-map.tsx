import React, { useState } from 'react';
import { MapPin, Truck, Plus, Edit2, Warehouse, UserCheck } from 'lucide-react';

interface Depot {
  id: string;
  name: string;
  city: string;
  x: number; // SVG percentage X
  y: number; // SVG percentage Y
  manager: string;
  drivers: string[];
}

const initialDepots: Depot[] = [
  {
    id: 'casablanca',
    name: 'Dépôt Principal Casablanca',
    city: 'Casablanca',
    x: 35,
    y: 38,
    manager: 'Noureddine El Fassi',
    drivers: ['Youssef Amrani', 'Karim Benali', 'Mehdi Lahlou']
  },
  {
    id: 'rabat',
    name: 'Dépôt Régional Rabat',
    city: 'Rabat',
    x: 39,
    y: 32,
    manager: 'Samir Amrani',
    drivers: ['Hassan Chraibi', 'Tarik Mansouri', 'Othmane Berrada']
  },
  {
    id: 'tanger',
    name: 'Dépôt Nord Tanger',
    city: 'Tanger',
    x: 42,
    y: 18,
    manager: 'Mounir Bennani',
    drivers: ['Bilal Hajji', 'Anass Kabbaj', 'Rachid Slassi']
  },
  {
    id: 'agadir',
    name: 'Dépôt Sud Agadir',
    city: 'Agadir',
    x: 22,
    y: 65,
    manager: 'Brahim Souss',
    drivers: ['Omar Ait Taleb', 'Hamza Lahrech', 'Idriss Bouazza']
  },
  {
    id: 'fes',
    name: 'Dépôt Centre Fès',
    city: 'Fès',
    x: 48,
    y: 34,
    manager: 'Abdelkader Saïss',
    drivers: ['Zakaria Filali', 'Yassine Idrissi', 'Adil Tazi']
  },
  {
    id: 'marrakech',
    name: 'Dépôt Marrakech',
    city: 'Marrakech',
    x: 31,
    y: 52,
    manager: 'Reda Alami',
    drivers: ['Soufiane Atlas', 'Ayoub Rahmani', 'Mustapha Glaoui']
  }
];

export function MoroccoMap() {
  const [depots, setDepots] = useState<Depot[]>(initialDepots);
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(initialDepots[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [newDepotCity, setNewDepotCity] = useState('');

  const handleAddDepot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepotCity) return;
    const newDepot: Depot = {
      id: `depot-${Date.now()}`,
      name: `Dépôt ${newDepotCity}`,
      city: newDepotCity,
      x: 30 + Math.random() * 20,
      y: 30 + Math.random() * 30,
      manager: 'Nouveau Responsable',
      drivers: ['Livreur 1', 'Livreur 2', 'Livreur 3']
    };
    setDepots([...depots, newDepot]);
    setSelectedDepot(newDepot);
    setNewDepotCity('');
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-mono font-semibold text-blue-600 uppercase">GÉOLOCALISATION ENTREPÔTS</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Warehouse size={20} className="text-blue-600" /> Carte des Dépôts du Maroc
          </h2>
          <p className="text-xs text-slate-500">Visualisez l'emplacement des dépôts et leurs 3 livreurs affectés en temps réel.</p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold hover:bg-blue-100"
        >
          <Plus size={15} /> {isEditing ? 'Fermer l\'édition' : 'Ajouter / Éditer un Dépôt'}
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleAddDepot} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
          <input
            type="text"
            placeholder="Nom de la ville (ex: Oujda, Laâyoune)"
            value={newDepotCity}
            onChange={e => setNewDepotCity(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium outline-none bg-white"
            required
          />
          <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">
            Enregistrer le Dépôt
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive SVG Morocco Map */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-4 relative min-h-[420px] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[450px]">
            {/* Morocco Stylized Outline */}
            <path
              d="M 38 12 L 48 16 L 55 25 L 48 35 L 50 45 L 40 50 L 32 65 L 18 80 L 10 95 L 8 80 L 15 60 L 25 45 L 30 30 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
            {/* Sahara Region Styling */}
            <path
              d="M 18 80 L 10 95 L 5 98 L 8 80 Z"
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth="0.5"
              strokeDasharray="1,1"
            />

            {/* Depot Markers */}
            {depots.map((depot) => {
              const isSelected = selectedDepot?.id === depot.id;
              return (
                <g
                  key={depot.id}
                  transform={`translate(${depot.x}, ${depot.y})`}
                  onClick={() => setSelectedDepot(depot)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? "3.5" : "2.5"}
                    fill={isSelected ? "#2563eb" : "#dc2626"}
                    className="transition-all duration-200"
                  />
                  <circle
                    r={isSelected ? "6" : "4"}
                    fill={isSelected ? "#2563eb" : "#dc2626"}
                    opacity="0.25"
                    className="animate-ping"
                  />
                  <text
                    y="-4"
                    textAnchor="middle"
                    className={`text-[3px] font-bold ${isSelected ? 'fill-blue-700 font-extrabold' : 'fill-slate-700'}`}
                  >
                    {depot.city}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded border border-slate-200 text-[10px] text-slate-500 font-mono">
            <span>* Cliquez sur un marqueur pour voir les 3 livreurs</span>
          </div>
        </div>

        {/* Selected Depot Details Sidebar */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          {selectedDepot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">DÉPÔT SÉLECTIONNÉ</span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedDepot.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-slate-400" /> {selectedDepot.city}, Maroc
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {selectedDepot.city.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Responsable de Dépôt</span>
                <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-2">
                  <UserCheck size={14} className="text-blue-600" /> {selectedDepot.manager}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">3 Livreurs Dédiés Affectés</span>
                <div className="space-y-2">
                  {selectedDepot.drivers.map((driver, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Truck size={15} className="text-emerald-600" />
                        <span>{driver}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">
                        En Service
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Sélectionnez un dépôt sur la carte pour voir ses informations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
