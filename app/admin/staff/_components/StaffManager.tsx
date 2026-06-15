"use client";

import { useState } from "react";
import { UserPlus, Trash2, Mail, Clock, Shield, X, Loader2, Pencil } from "lucide-react";
import { ROLE_LABELS } from "@/lib/permissions";

type StaffMember = { id: string; name: string | null; email: string; role: string; isActive: boolean; createdAt: string };
type PendingInvite = { id: string; email: string; role: string; createdAt: string; expiresAt: string; inviter: { name: string | null } };

const ROLE_COLORS: Record<string, string> = {
  INVENTORY: "bg-blue-50 text-blue-700 border-blue-100",
  SALES:     "bg-violet-50 text-violet-700 border-violet-100",
  MANAGER:   "bg-amber-50 text-amber-700 border-amber-100",
  ADMIN:     "bg-rose-50 text-rose-700 border-rose-100",
};

const inputCls = "w-full px-4 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 bg-white";

export function StaffManager({
  initialStaff,
  initialPending,
  invitableRoles,
  currentRole,
}: {
  initialStaff: StaffMember[];
  initialPending: PendingInvite[];
  invitableRoles: { value: string; label: string }[];
  currentRole: string;
}) {
  const [staff, setStaff]     = useState(initialStaff);
  const [pending, setPending] = useState(initialPending);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail]   = useState("");
  const [role, setRole]     = useState(invitableRoles[0]?.value ?? "");
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Edit modal
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [editRole, setEditRole]       = useState("");
  const [editActive, setEditActive]   = useState(true);
  const [saving, setSaving]           = useState(false);
  const [editError, setEditError]     = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  function openEdit(m: StaffMember) {
    setEditMember(m);
    setEditRole(m.role);
    setEditActive(m.isActive);
    setEditError(null);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setInviteError(null);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const body = await res.json();
    setSending(false);
    if (!res.ok) { setInviteError(body.error ?? "Failed to send invitation"); return; }
    setSuccess(`Invitation sent to ${email}`);
    setEmail("");
    setRole(invitableRoles[0]?.value ?? "");
    setShowInvite(false);
    const updated = await fetch("/api/admin/staff").then(r => r.json());
    setStaff(updated.staff ?? []);
    setPending(updated.pending ?? []);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editMember) return;
    setSaving(true);
    setEditError(null);
    const res = await fetch(`/api/admin/staff/${editMember.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole, isActive: editActive }),
    });
    const body = await res.json();
    setSaving(false);
    if (!res.ok) { setEditError(body.error ?? "Failed to save changes"); return; }
    setStaff(s => s.map(m => m.id === editMember.id ? { ...m, role: body.role, isActive: body.isActive } : m));
    setSuccess(`Updated ${editMember.name ?? editMember.email}`);
    setEditMember(null);
  }

  async function handleRemove(id: string, isInvite = false) {
    if (!confirm(isInvite ? "Revoke this invitation?" : "Remove this team member? They will lose all admin access.")) return;
    const res = await fetch(`/api/admin/staff/${isInvite ? "inv_" + id : id}`, { method: "DELETE" });
    if (!res.ok) return;
    if (isInvite) setPending(p => p.filter(i => i.id !== id));
    else          setStaff(s => s.filter(m => m.id !== id));
  }

  const canManage = (targetRole: string) =>
    currentRole === "SUPER_ADMIN" ||
    currentRole === "ADMIN" ||
    (currentRole === "MANAGER" && !["ADMIN", "SUPER_ADMIN"].includes(targetRole));

  return (
    <div className="space-y-6">

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {/* Active staff */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="px-6 py-4 border-b border-(--color-border) flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base">Team Members</h2>
            <p className="text-xs text-(--color-text-muted) mt-0.5">{staff.length} member{staff.length !== 1 ? "s" : ""}</p>
          </div>
          {invitableRoles.length > 0 && (
            <button
              onClick={() => { setShowInvite(true); setInviteError(null); }}
              className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <UserPlus size={15} />
              Invite Member
            </button>
          )}
        </div>

        {staff.length === 0 ? (
          <div className="py-12 text-center text-(--color-text-muted) text-sm">No team members yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-(--color-surface-alt) border-b border-(--color-border)">
                {["Member", "Role", "Status", "Joined", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {staff.map(m => (
                <tr key={m.id} className="hover:bg-(--color-surface-alt)/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-(--color-primary)/10 flex items-center justify-center text-sm font-bold text-(--color-primary)">
                          {(m.name ?? m.email)[0].toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${m.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-(--color-text-primary)">{m.name ?? "—"}</p>
                        <p className="text-xs text-(--color-text-muted)">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[m.role] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                      <Shield size={10} />
                      {ROLE_LABELS[m.role] ?? m.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${m.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-(--color-text-muted)">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {canManage(m.role) && (
                        <>
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-(--color-surface-alt) hover:text-(--color-text-primary) transition-colors"
                            title="Edit member"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleRemove(m.id)}
                            className="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
          <div className="px-6 py-4 border-b border-(--color-border)">
            <h2 className="font-semibold text-base">Pending Invitations</h2>
            <p className="text-xs text-(--color-text-muted) mt-0.5">{pending.length} awaiting acceptance</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-(--color-surface-alt) border-b border-(--color-border)">
                {["Email", "Role", "Invited by", "Expires", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {pending.map(inv => (
                <tr key={inv.id} className="hover:bg-(--color-surface-alt)/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-(--color-text-muted) shrink-0" />
                      <span className="text-(--color-text-primary)">{inv.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[inv.role] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                      <Shield size={10} />
                      {ROLE_LABELS[inv.role] ?? inv.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-(--color-text-muted)">{inv.inviter.name ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <Clock size={12} />
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRemove(inv.id, true)}
                      className="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Revoke invitation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg hover:bg-(--color-surface-alt) transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                  {invitableRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {inviteError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">⚠ {inviteError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-text-muted) hover:bg-(--color-surface-alt) transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold disabled:opacity-60 transition-colors">
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                  {sending ? "Sending…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editMember && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg">Edit Member</h3>
                <p className="text-sm text-(--color-text-muted) mt-0.5">{editMember.name ?? editMember.email}</p>
              </div>
              <button onClick={() => setEditMember(null)} className="p-1.5 rounded-lg hover:bg-(--color-surface-alt) transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Role</label>
                {(() => {
                  // Always include the member's current role so the select is never blank
                  const currentInList = invitableRoles.some(r => r.value === editMember.role);
                  const roleOptions = currentInList
                    ? invitableRoles
                    : [{ value: editMember.role, label: ROLE_LABELS[editMember.role] ?? editMember.role }, ...invitableRoles];
                  // Role is locked if the member's current role is outside what the editor can assign
                  const roleLocked = !currentInList;
                  const singleOption = invitableRoles.length === 1;
                  return (
                    <>
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        disabled={roleLocked}
                        className={`${inputCls} ${roleLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {roleOptions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      {(roleLocked || singleOption) && (
                        <p className="text-xs text-(--color-text-muted) mt-1">
                          Role options are limited by your permission level.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditActive(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${editActive ? "border-green-500 bg-green-50 text-green-700" : "border-(--color-border) text-(--color-text-muted) hover:bg-(--color-surface-alt)"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditActive(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${!editActive ? "border-gray-400 bg-gray-50 text-gray-600" : "border-(--color-border) text-(--color-text-muted) hover:bg-(--color-surface-alt)"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Inactive
                  </button>
                </div>
              </div>

              {editError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">⚠ {editError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditMember(null)}
                  className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-text-muted) hover:bg-(--color-surface-alt) transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold disabled:opacity-60 transition-colors">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
