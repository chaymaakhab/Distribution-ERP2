import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'fr' | 'ar';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isAr: boolean;
}

const DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { fr: 'Accueil', ar: 'الرئيسية' },
  'nav.catalog': { fr: 'Catalogue', ar: 'الكتالوج' },
  'nav.orders': { fr: 'Mes commandes', ar: 'طلبياتي' },
  'nav.invoices': { fr: 'Factures & solde', ar: 'الفواتير والرصيد' },
  'nav.profile': { fr: 'Profil', ar: 'الملف الشخصي' },
  'nav.cart': { fr: 'Panier', ar: 'السلة' },
  'nav.logout': { fr: 'Se déconnecter', ar: 'تسجيل الخروج' },
  'nav.erp_portal': { fr: 'Portail ERP', ar: 'بوابة النظام' },
  'nav.space_client': { fr: 'Espace client', ar: 'فضاء الزبناء' },
  'nav.tier': { fr: 'Tarif', ar: 'التعريفة' },

  // Home Page
  'home.badge': { fr: 'OFFRES REVENDEURS & GROSSISTES', ar: 'عروض خاصة بالموزعين والتجار' },
  'home.title': { fr: 'Commandez vos articles de quincaillerie & outillage au meilleur prix grossiste', ar: 'اطلب أدواتك ومعداتك بأفضل أسعار الجملة' },
  'home.subtitle': { fr: 'Livraison express 24-48h sur Casablanca, Rabat & partout au Maroc · Paiement sécurisé à la livraison.', ar: 'توصيل سريع خلال 24-48 ساعة في الدار البيضاء والرباط وكافة مدن المغرب · أداء آمن عند الاستلام.' },
  'home.habitual_order': { fr: 'Ma commande habituelle', ar: 'طلبيتي المعتادة' },
  'home.habitual_toast': { fr: 'Articles habituels ajoutés au panier !', ar: 'تمت إضافة منتجاتك المعتادة إلى السلة !' },
  'home.browse_catalog': { fr: 'Découvrir tout le catalogue', ar: 'تصفح الكتالوج كاملاً' },
  'home.featured_products': { fr: 'Produits vedettes & promotions', ar: 'المنتجات المميزة والعروض' },
  'home.recent_orders': { fr: 'Dernières commandes', ar: 'آخر الطلبيات' },
  'home.account_summary': { fr: 'Situation de compte', ar: 'وضعية الحساب' },
  'home.balance_due': { fr: 'Solde dû', ar: 'الرصيد المستحق' },
  'home.credit_limit': { fr: 'Encours autorisé', ar: 'سقف الائتمان المسموح' },
  'home.no_orders': { fr: 'Aucune commande récente', ar: 'لا توجد طلبيات حديثة' },

  // Catalog
  'catalog.title': { fr: 'Catalogue produits revendeurs', ar: 'كتالوج المنتجات' },
  'catalog.search_placeholder': { fr: 'Rechercher une référence, un nom...', ar: 'بحث عن كود أو اسم منتج...' },
  'catalog.all_categories': { fr: 'Toutes les catégories', ar: 'جميع الأصناف' },
  'catalog.sort_by': { fr: 'Trier par', ar: 'ترتيب حسب' },
  'catalog.sort_price_asc': { fr: 'Prix croissant', ar: 'السعر تصاعدياً' },
  'catalog.sort_price_desc': { fr: 'Prix décroissant', ar: 'السعر تنازلياً' },
  'catalog.sort_name': { fr: 'Nom (A-Z)', ar: 'الاسم (أ-ي)' },
  'catalog.in_stock_only': { fr: 'En stock uniquement', ar: 'المتوفر في المخزون فقط' },
  'catalog.add_to_cart': { fr: 'Ajouter au panier', ar: 'أضف إلى السلة' },
  'catalog.in_stock': { fr: 'En stock', ar: 'متوفر' },
  'catalog.out_of_stock': { fr: 'Rupture', ar: 'نفد من المخزون' },
  'catalog.sku': { fr: 'Réf', ar: 'المرجع' },
  'catalog.unit': { fr: 'Unité', ar: 'الوحدة' },

  // Cart
  'cart.title': { fr: 'Votre panier', ar: 'سلة مشترياتك' },
  'cart.empty_title': { fr: 'Votre panier est vide', ar: 'سلتك فارغة حالياً' },
  'cart.empty_desc': { fr: 'Ajoutez des articles depuis le catalogue pour passer commande.', ar: 'أضف بعض المنتجات من الكتالوج لتأكيد طلبيتك.' },
  'cart.clear': { fr: 'Vider le panier', ar: 'إفراغ السلة' },
  'cart.summary': { fr: 'Récapitulatif de la commande', ar: 'ملخص الطلبية' },
  'cart.subtotal_ht': { fr: 'Sous-total HT', ar: 'المجموع الجزئي دون رسوم' },
  'cart.vat': { fr: 'TVA (20%)', ar: 'الضريبة (20%)' },
  'cart.total_ttc': { fr: 'Total TTC à payer', ar: 'المجموع الإجمالي للوفاء' },
  'cart.delivery_mode': { fr: 'Mode de livraison', ar: 'طريقة التوصيل' },
  'cart.delivery_std': { fr: 'Livraison standard (24-48h)', ar: 'توصيل قياسي (24-48 ساعة)' },
  'cart.delivery_pickup': { fr: 'Retrait dépôt central', ar: 'استلام من المستودع المركزي' },
  'cart.payment_mode': { fr: 'Mode de règlement prévu', ar: 'طريقة الأداء المتفق عليها' },
  'cart.payment_cod': { fr: 'Espèces à la livraison', ar: 'نقداً عند الاستلام' },
  'cart.payment_check': { fr: 'Chèque à la livraison', ar: 'شيك عند الاستلام' },
  'cart.payment_terms': { fr: 'Crédit accordé (30j fin de mois)', ar: 'تسهيلات بنكية (30 يوماً نهاية الشهر)' },
  'cart.notes': { fr: 'Notes & instructions de livraison', ar: 'ملاحظات وتعليمات التوصيل' },
  'cart.submit': { fr: 'Confirmer et envoyer la commande', ar: 'تأكيد وإرسال الطلبية' },

  // Orders & Invoices
  'orders.title': { fr: 'Historique de vos commandes', ar: 'سجل طلبياتكم' },
  'orders.ref': { fr: 'Référence', ar: 'رقم المرجع' },
  'orders.date': { fr: 'Date', ar: 'التاريخ' },
  'orders.amount': { fr: 'Montant TTC', ar: 'المبلغ الإجمالي' },
  'orders.status': { fr: 'Statut', ar: 'الحالة' },
  'orders.view_bc': { fr: 'Voir Bon de Commande (BC)', ar: 'معاينة وصل الطلب (BC)' },
  'orders.view_bl': { fr: 'Voir Bon de Livraison (BL)', ar: 'معاينة وصل التسليم (BL)' },
  'invoices.title': { fr: 'Factures et relevé de compte', ar: 'الفواتير وكشف الحساب' },
  'invoices.number': { fr: 'N° Facture', ar: 'رقم الفاتورة' },
  'invoices.due_date': { fr: 'Échéance', ar: 'تاريخ الاستحقاق' },
  'invoices.paid': { fr: 'Réglée', ar: 'مدفوعة' },
  'invoices.pending': { fr: 'En attente', ar: 'قيد الأداء' },

  // Profile
  'profile.title': { fr: 'Informations de votre entreprise', ar: 'معلومات مؤسستكم' },
  'profile.company': { fr: 'Raison sociale', ar: 'اسم المؤسسة' },
  'profile.contact': { fr: 'Contact principal', ar: 'المسؤول' },
  'profile.phone': { fr: 'Téléphone', ar: 'الهاتف' },
  'profile.city': { fr: 'Ville', ar: 'المدينة' },
  'profile.ice': { fr: 'Identifiant Commun (ICE)', ar: 'المعرف الموحد للمقاولة (ICE)' },
  'profile.commercial': { fr: 'Commercial dédié', ar: 'الممثل التجاري' },
  'profile.save': { fr: 'Mettre à jour mes informations', ar: 'تحديث المعلومات' },
};

const I18nContext = createContext<I18nContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
  isAr: false,
});

const LANG_KEY = 'hercules.customer.lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      return stored === 'ar' ? 'ar' : 'fr';
    } catch {
      return 'fr';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_KEY, newLang);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[lang] || entry['fr'] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isAr: lang === 'ar' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
