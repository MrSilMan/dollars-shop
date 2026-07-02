export const STAFF_ROLES = ["INVENTORY", "SALES", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;
export type AppRole = typeof STAFF_ROLES[number] | "CUSTOMER";

export const ROLE_LABELS: Record<string, string> = {
  INVENTORY:   "Inventory Specialist",
  SALES:       "Sales Executive",
  MANAGER:     "Operations Manager",
  ADMIN:       "Admin",
  SUPER_ADMIN: "Super Admin",
  CUSTOMER:    "Customer",
};

// Which roles can view each admin section
const ACCESS: Record<string, string[]> = {
  dashboard:  ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  products:   ["INVENTORY", "MANAGER", "ADMIN", "SUPER_ADMIN"],
  orders:     ["SALES", "MANAGER", "ADMIN", "SUPER_ADMIN"],
  customers:  ["SALES", "MANAGER", "ADMIN", "SUPER_ADMIN"],
  coupons:    ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  newsletter: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  homepage:   ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  staff:      ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  audit:      ["ADMIN", "SUPER_ADMIN"],
};

export function canAccess(section: keyof typeof ACCESS, role: string): boolean {
  return (ACCESS[section] ?? []).includes(role);
}

export function isStaff(role: string): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

// Role tiers:
//   staff tier  → INVENTORY (Inventory Specialist), MANAGER (Operations Manager)
//   admin tier  → SALES (Sales Executive), ADMIN
//   super tier  → SUPER_ADMIN

// Roles that a given inviter role is allowed to invite
export function invitableRoles(inviterRole: string): { value: string; label: string }[] {
  const staffTier = [
    { value: "INVENTORY", label: "Inventory Specialist" },
    { value: "MANAGER",   label: "Operations Manager" },
  ];
  const adminTier = [
    { value: "SALES",  label: "Sales Executive" },
    { value: "ADMIN",  label: "Admin" },
  ];
  if (inviterRole === "SUPER_ADMIN") return [...staffTier, ...adminTier];
  if (inviterRole === "ADMIN")       return [...staffTier, { value: "SALES", label: "Sales Executive" }];
  if (inviterRole === "MANAGER")     return [...staffTier, { value: "SALES", label: "Sales Executive" }];
  return [];
}

export function canInviteRole(inviterRole: string, targetRole: string): boolean {
  return invitableRoles(inviterRole).some(r => r.value === targetRole);
}

// Default landing page inside /admin for each role
export function adminLandingPage(role: string): string {
  switch (role) {
    case "SUPER_ADMIN": return "/super-admin/settings";
    case "ADMIN":
    case "MANAGER":     return "/admin";
    case "SALES":       return "/admin/orders";
    case "INVENTORY":   return "/admin/products";
    default:            return "/";
  }
}
