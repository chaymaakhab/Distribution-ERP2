import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ROLES = [
  {
    code: "admin",
    name: "Administrateur",
    description: "Accès complet à tous les modules de l'ERP",
    modules: ["/orders", "/products", "/inventory", "/customers", "/purchasing", "/deliveries", "/finance", "/reports", "/settings"],
  },
  {
    code: "commercial",
    name: "Commercial",
    description: "Gestion des clients et saisie des commandes",
    modules: ["/orders", "/products", "/customers"],
  },
  {
    code: "finance",
    name: "Finance & Comptabilité",
    description: "Gestion des factures, règlements et créances",
    modules: ["/finance", "/customers", "/reports"],
  },
  {
    code: "warehouse",
    name: "Responsable Dépôt",
    description: "Gestion des stocks, mouvements et réceptions",
    modules: ["/inventory", "/products", "/purchasing"],
  },
  {
    code: "driver",
    name: "Chauffeur / Livreur",
    description: "Suivi des tournées et validation des livraisons",
    modules: ["/deliveries"],
  },
];

// Current active role (can be switched dynamically)
let activeRoleCode = "admin";

router.get("/roles", (_req, res) => {
  res.json(ROLES);
});

router.get("/auth/me", (_req, res) => {
  const role = ROLES.find((r) => r.code === activeRoleCode) || ROLES[0];
  res.json({
    id: 1,
    name: "Utilisateur ERP",
    email: "user@hercules-erp.ma",
    roleCode: role.code,
    roleName: role.name,
    allowedModules: role.modules,
  });
});

router.post("/auth/switch-role", (req, res) => {
  const { roleCode } = req.body;
  if (roleCode && ROLES.some((r) => r.code === roleCode)) {
    activeRoleCode = roleCode;
  }
  const role = ROLES.find((r) => r.code === activeRoleCode) || ROLES[0];
  res.json({
    id: 1,
    name: "Utilisateur ERP",
    email: "user@hercules-erp.ma",
    roleCode: role.code,
    roleName: role.name,
    allowedModules: role.modules,
  });
});

export default router;
