import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Search, Filter, Check, AlertCircle } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  sku: z.string().min(3, 'SKU obligatoire'),
  category: z.string().min(2, 'Catégorie requise'),
  price: z.coerce.number().positive('Prix HT valide requis'),
  tva: z.coerce.number().default(20),
});

export function SalesCrud() {
  const [items, setItems] = useState([
    { id: '1', name: 'Perceuse à percussion 850W', sku: 'HRC-0850', category: 'Électroportatif', price: 1249, tva: 20 },
    { id: '2', name: 'Disque diamant 230 mm', sku: 'CUT-230D', category: 'Outillage', price: 189.5, tva: 20 },
    { id: '3', name: 'Pompe immergée 1.5 HP', sku: 'PMP-15HP', category: 'Pompage', price: 3840, tva: 14 },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', sku: '', category: 'Électroportatif', price: 0, tva: 20 }
  });

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const onSubmit = (data: any) => {
    if (editingId) {
      setItems(items.map(i => i.id === editingId ? { ...i, ...data } : i));
      notify(`Produit "${data.name}" mis à jour avec succès.`);
    } else {
      const newItem = { id: String(Date.now()), ...data };
      setItems([newItem, ...items]);
      notify(`Nouveau produit "${data.name}" créé.`);
    }
    setShowModal(false);
    reset();
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le produit "${name}" ?`)) {
      setItems(items.filter(i => i.id !== id));
      notify(`Produit "${name}" supprimé.`);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setValue('name', item.name);
    setValue('sku', item.sku);
    setValue('category', item.category);
    setValue('price', item.price);
    setValue('tva', item.tva);
    setShowModal(true);
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 my-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold flex items-center gap-2">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase">GÉRER LE CATALOGUE PRODUITS</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Produits & Tarifs (CRUD Zod + React Hook Form)</h2>
        </div>
        <button
          onClick={() => { setEditingId(null); reset(); setShowModal(true); }}
          className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 flex items-center gap-1.5"
        >
          <Plus size={15} /> Nouveau Produit
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs font-medium"
        />
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600 uppercase text-[10px]">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Désignation</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3 text-right">Prix HT</th>
              <th className="p-3 text-right">TVA</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 font-medium">
                <td className="p-3 font-mono text-blue-600 font-bold">{item.sku}</td>
                <td className="p-3 text-slate-900 font-bold">{item.name}</td>
                <td className="p-3 text-slate-600">{item.category}</td>
                <td className="p-3 text-right font-mono">{item.price} DH</td>
                <td className="p-3 text-right font-mono">{item.tva}%</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => startEdit(item)} className="p-1 hover:text-blue-600"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(item.id, item.name)} className="p-1 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{editingId ? 'Modifier le Produit' : 'Nouveau Produit'}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation Produit</label>
                <input {...register('name')} className="w-full p-2 border rounded font-medium" />
                {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{String(errors.name.message)}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Référence SKU</label>
                <input {...register('sku')} className="w-full p-2 border rounded font-mono" />
                {errors.sku && <p className="text-red-500 text-[10px] mt-0.5">{String(errors.sku.message)}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                <input {...register('category')} className="w-full p-2 border rounded font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix HT (DH)</label>
                  <input type="number" step="0.01" {...register('price')} className="w-full p-2 border rounded font-mono" />
                  {errors.price && <p className="text-red-500 text-[10px] mt-0.5">{String(errors.price.message)}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TVA (%)</label>
                  <input type="number" {...register('tva')} className="w-full p-2 border rounded font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 border rounded font-bold">Annuler</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
