// Roles & permissions: an RBAC matrix.
//
// Rows are permissions (grouped by module), columns are roles. Tick boxes to
// grant/revoke; changes are staged per role and saved together after a
// review of exactly what will be granted and revoked. Admin-tier roles hold
// everything and are shown locked. Every save is written to the activity log
// (with before/after) by the API.
//
// Replaces the old roles list + RolePermissionsModal, which treated
// permissions as an array of ids (the API stores { key: true }): opening a
// role showed nothing and saving it wiped the role's permissions.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Lock,
  MagnifyingGlass,
  UsersThree,
  Trash,
  ClockCounterClockwise,
  FloppyDisk,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetRoleMatrixQuery,
  useUpdateRoleMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleMembersQuery,
  useAssignRoleMutation,
  useSearchUsersQuery,
} from '../../services/api/opsApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  PageShell,
  Panel,
  Pill,
  QueryState,
  Loading,
  ConfirmDialog,
  Field,
  inputClass,
  errorMessage,
  timeAgo,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { cn } from '../../lib/utils';

const keysOf = (obj) => Object.keys(obj || {}).filter((k) => obj[k] === true);

// ── Create role ──────────────────────────────────────────────────────────
const CreateRoleDialog = ({ open, onOpenChange, roles }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(20);
  const [copyFrom, setCopyFrom] = useState('');
  const [createRole, { isLoading }] = useCreateRoleMutation();

  const submit = async (e) => {
    e.preventDefault();
    const source = roles.find((r) => r.id === copyFrom);
    try {
      await createRole({
        name: name.trim().toUpperCase().replace(/[\s-]+/g, '_'),
        hierarchy_level: Number(level),
        permissions: source ? { ...source.stored_permissions, 'workspace.access': true } : { 'workspace.access': true },
      }).unwrap();
      toast.success('Role created');
      setName('');
      setCopyFrom('');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the role'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New role</DialogTitle>
            <DialogDescription className="text-zinc-400">
              New roles can sign in to the workspace. Tick the rest of their permissions in the matrix.
            </DialogDescription>
          </DialogHeader>
          <Field label="Name" htmlFor="role-name" hint="Letters, numbers and underscores, e.g. MODERATOR or FINANCE">
            <input
              id="role-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MODERATOR"
              required
            />
          </Field>
          <Field label="Level (0–100)" htmlFor="role-level" hint="Higher levels outrank lower ones. Must be below your own level.">
            <input
              id="role-level"
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            />
          </Field>
          <Field label="Start from" htmlFor="role-copy">
            <select id="role-copy" className={inputClass} value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
              <option value="">Workspace access only</option>
              {roles
                .filter((r) => !r.is_admin_tier)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    Copy {r.name}
                  </option>
                ))}
            </select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" className="text-zinc-300" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()} className="bg-white text-black hover:bg-zinc-200">
              {isLoading ? 'Creating…' : 'Create role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Role drawer: members, assign, rename, delete ─────────────────────────
const RoleDrawer = ({ role, onClose, canManage, canEditAdmin, catalogLabel }) => {
  const members = useGetRoleMembersQuery(role?.id, { skip: !role });
  const [search, setSearch] = useState('');
  const users = useSearchUsersQuery({ search }, { skip: !role || search.trim().length < 2 });
  const [assignRole, { isLoading: assigning }] = useAssignRoleMutation();
  const [updateRole, { isLoading: saving }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [level, setLevel] = useState('');

  if (!role) return null;
  const locked = role.is_admin_tier && !canEditAdmin;
  const grants = keysOf(role.stored_permissions);

  const assign = async (user) => {
    try {
      await assignRole({ userId: user.id, roleId: role.id }).unwrap();
      toast.success(`${user.username || user.email} is now ${role.name}`);
      setSearch('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not assign the role'));
    }
  };

  const saveLevel = async () => {
    try {
      await updateRole({ id: role.id, hierarchy_level: Number(level) }).unwrap();
      toast.success('Level updated');
      setLevel('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the level'));
    }
  };

  const remove = async () => {
    try {
      await deleteRole(role.id).unwrap();
      toast.success(`Deleted ${role.name}`);
      setConfirmDelete(false);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the role'));
    }
  };

  return (
    <Sheet open={!!role} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white">
            {role.name}
            {role.is_admin_tier && <Pill tone="brand">admin tier</Pill>}
            {role.is_system && <Pill>system</Pill>}
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Level {role.hierarchy_level} · {role.member_count} member{role.member_count === 1 ? '' : 's'} ·{' '}
            {role.is_admin_tier ? 'all permissions' : `${grants.length} permission${grants.length === 1 ? '' : 's'}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!role.is_admin_tier && grants.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Granted</p>
              <div className="flex flex-wrap gap-1.5">
                {grants.map((k) => (
                  <Pill key={k} tone="info">
                    {catalogLabel(k)}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {canManage && !locked && (
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Add a member</p>
              <input
                aria-label="Search users to add"
                className={inputClass}
                placeholder="Search by username or email (2+ characters)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search.trim().length >= 2 && (
                <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-zinc-800">
                  {users.isFetching ? (
                    <Loading label="Searching…" />
                  ) : (users.data?.data ?? []).length === 0 ? (
                    <p className="p-3 text-xs text-zinc-500">No users found.</p>
                  ) : (
                    (users.data?.data ?? []).map((u) => (
                      <div key={u.id} className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2 last:border-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-zinc-200">{u.username || u.email}</p>
                          <p className="truncate text-[11px] text-zinc-500">
                            {u.email} · {u.role_name || 'no role'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shrink-0 border-zinc-700 text-zinc-200"
                          disabled={assigning || u.role_name === role.name}
                          onClick={() => assign(u)}
                        >
                          {u.role_name === role.name ? 'Member' : 'Assign'}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <UsersThree className="h-4 w-4" /> Members
            </p>
            {members.isLoading ? (
              <Loading />
            ) : (members.data ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500">Nobody has this role.</p>
            ) : (
              <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                {members.data.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-zinc-200">{m.username || m.email}</p>
                      <p className="truncate text-[11px] text-zinc-500">{m.email}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-zinc-500">
                      {m.last_login_at ? `seen ${timeAgo(m.last_login_at)}` : 'never signed in'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canManage && !locked && !role.is_admin_tier && (
            <div className="space-y-3 rounded-lg border border-zinc-800 p-3">
              <Field label="Level" htmlFor="role-level-edit">
                <div className="flex gap-2">
                  <input
                    id="role-level-edit"
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    placeholder={String(role.hierarchy_level)}
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="h-9 bg-white text-black hover:bg-zinc-200"
                    disabled={saving || level === ''}
                    onClick={saveLevel}
                  >
                    Save
                  </Button>
                </div>
              </Field>
              {!role.is_system && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-900 text-red-300 hover:bg-red-950"
                  disabled={role.member_count > 0}
                  title={role.member_count > 0 ? 'Move members to another role first' : undefined}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete role
                </Button>
              )}
            </div>
          )}

          <Link
            to={`/admin/activity-logs?entityType=role`}
            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline"
          >
            <ClockCounterClockwise className="h-3.5 w-3.5" /> Role change history
          </Link>
        </div>

        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Delete ${role.name}?`}
          description="This can't be undone."
          confirmLabel="Delete role"
          tone="danger"
          busy={deleting}
          onConfirm={remove}
        />
      </SheetContent>
    </Sheet>
  );
};

// ── Matrix ───────────────────────────────────────────────────────────────
export const RolesPage = () => {
  const { can } = useAuth();
  const canManage = can('roles.manage');
  const matrix = useGetRoleMatrixQuery();
  const [updateRole] = useUpdateRoleMutation();

  const [drafts, setDrafts] = useState({}); // roleId -> { key: true }
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [drawerRoleId, setDrawerRoleId] = useState(null);
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);

  const modules = matrix.data?.modules ?? [];
  const roles = matrix.data?.roles ?? [];
  const canEditAdmin = !!matrix.data?.can_edit_admin_roles;

  const labelOf = useMemo(() => {
    const map = {};
    modules.forEach((m) => m.permissions.forEach((p) => (map[p.key] = p.label)));
    return (k) => map[k] || k;
  }, [modules]);

  const visibleModules = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return modules;
    return modules
      .map((m) => ({
        ...m,
        permissions: m.permissions.filter(
          (p) =>
            p.key.toLowerCase().includes(f) ||
            p.label.toLowerCase().includes(f) ||
            m.label.toLowerCase().includes(f)
        ),
      }))
      .filter((m) => m.permissions.length);
  }, [modules, filter]);

  const current = (role) => drafts[role.id] ?? role.stored_permissions ?? {};
  const has = (role, key) => (role.is_admin_tier ? true : current(role)[key] === true);
  const editable = (role) => canManage && !role.is_admin_tier;

  const setPerm = (role, key, value) => {
    setDrafts((d) => {
      const next = { ...(d[role.id] ?? role.stored_permissions ?? {}) };
      if (value) next[key] = true;
      else delete next[key];
      return { ...d, [role.id]: next };
    });
  };

  const setModule = (role, mod, value) => {
    setDrafts((d) => {
      const next = { ...(d[role.id] ?? role.stored_permissions ?? {}) };
      mod.permissions.forEach((p) => (value ? (next[p.key] = true) : delete next[p.key]));
      return { ...d, [role.id]: next };
    });
  };

  // What actually changed, per role.
  const changes = roles
    .filter((r) => drafts[r.id])
    .map((r) => {
      const before = new Set(keysOf(r.stored_permissions));
      const after = new Set(keysOf(drafts[r.id]));
      return {
        role: r,
        granted: [...after].filter((k) => !before.has(k)),
        revoked: [...before].filter((k) => !after.has(k)),
      };
    })
    .filter((c) => c.granted.length || c.revoked.length);

  const dirtyIds = new Set(changes.map((c) => c.role.id));

  const saveAll = async () => {
    setSaving(true);
    let ok = 0;
    for (const c of changes) {
      try {
        await updateRole({ id: c.role.id, permissions: drafts[c.role.id] }).unwrap();
        ok += 1;
        setDrafts((d) => {
          const { [c.role.id]: _, ...rest } = d;
          return rest;
        });
      } catch (err) {
        toast.error(`${c.role.name}: ${errorMessage(err, 'save failed')}`);
      }
    }
    setSaving(false);
    setReview(false);
    if (ok) toast.success(`Saved ${ok} role${ok === 1 ? '' : 's'}`);
  };

  const drawerRole = roles.find((r) => r.id === drawerRoleId) ?? null;

  return (
    <PageShell
      title="Roles & permissions"
      subtitle={canManage ? 'Tick to grant, untick to revoke, then review and save' : 'Read-only: your role can view but not change permissions'}
      testId="rbac-matrix-page"
    >
      <QueryState query={matrix} isEmpty={!roles.length}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[16rem] flex-1">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Filter permissions"
              className={`${inputClass} pl-9`}
              placeholder="Filter permissions…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          {canManage && (
            <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> New role
            </Button>
          )}
        </div>

        {changes.length > 0 && (
          <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/60 px-4 py-3 backdrop-blur">
            <p className="text-sm text-amber-200">
              Unsaved changes on {changes.length} role{changes.length === 1 ? '' : 's'}:{' '}
              {changes.map((c) => c.role.name).join(', ')}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-amber-100 hover:bg-amber-900/40"
                onClick={() => setDrafts({})}
              >
                <ArrowCounterClockwise className="mr-2 h-4 w-4" /> Discard
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200" onClick={() => setReview(true)}>
                <FloppyDisk className="mr-2 h-4 w-4" /> Review & save
              </Button>
            </div>
          </div>
        )}

        <Panel bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 min-w-[16rem] border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500"
                  >
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th
                      key={r.id}
                      scope="col"
                      className={cn(
                        'min-w-[7.5rem] border-b border-l border-zinc-800 bg-zinc-900 px-2 py-3 text-center align-bottom',
                        dirtyIds.has(r.id) && 'bg-amber-950/40'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setDrawerRoleId(r.id)}
                        className="group flex w-full flex-col items-center gap-1 rounded-md px-1 py-1 hover:bg-zinc-800"
                        title="Members, level and history"
                      >
                        <span className="flex items-center gap-1 text-xs font-semibold text-white">
                          {r.is_admin_tier && <Lock className="h-3 w-3 text-violet-300" />}
                          {r.name}
                        </span>
                        <span className="text-[10px] font-normal text-zinc-500">
                          L{r.hierarchy_level} · {r.member_count} member{r.member_count === 1 ? '' : 's'}
                        </span>
                        {dirtyIds.has(r.id) && <span className="text-[10px] font-medium text-amber-300">unsaved</span>}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleModules.map((mod) => (
                  <React.Fragment key={mod.module}>
                    <tr>
                      <th
                        scope="rowgroup"
                        className="sticky left-0 z-10 border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                      >
                        {mod.label}
                      </th>
                      {roles.map((r) => {
                        const n = mod.permissions.filter((p) => has(r, p.key)).length;
                        const all = n === mod.permissions.length;
                        return (
                          <td key={r.id} className="border-b border-l border-zinc-800 bg-zinc-950 px-2 py-2 text-center">
                            {editable(r) ? (
                              <button
                                type="button"
                                className="text-[10px] text-zinc-500 hover:text-white"
                                onClick={() => setModule(r, mod, !all)}
                                aria-label={`${all ? 'Revoke' : 'Grant'} all ${mod.label} permissions for ${r.name}`}
                              >
                                {n}/{mod.permissions.length} · {all ? 'none' : 'all'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-600">
                                {n}/{mod.permissions.length}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {mod.permissions.map((p) => (
                      <tr key={p.key} className="group">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 border-b border-zinc-800/70 bg-zinc-900 px-4 py-2 text-left font-normal group-hover:bg-zinc-800/60"
                        >
                          <p className="text-sm text-zinc-200">{p.label}</p>
                          <p className="text-[11px] text-zinc-500" title={p.description}>
                            <code>{p.key}</code>
                            <span className="hidden lg:inline"> — {p.description}</span>
                          </p>
                        </th>
                        {roles.map((r) => {
                          const checked = has(r, p.key);
                          const changed =
                            drafts[r.id] && (drafts[r.id][p.key] === true) !== (r.stored_permissions?.[p.key] === true);
                          return (
                            <td
                              key={r.id}
                              className={cn(
                                'border-b border-l border-zinc-800/70 px-2 py-2 text-center group-hover:bg-zinc-800/40',
                                changed && 'bg-amber-500/10'
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                disabled={!editable(r)}
                                onCheckedChange={(v) => setPerm(r, p.key, v === true)}
                                aria-label={`${p.label} for ${r.name}`}
                                className="border-zinc-600 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <p className="text-xs text-zinc-500">
          <Lock className="mr-1 inline h-3 w-3" /> Admin-tier roles (ADMIN, SUPER_ADMIN, DEVELOPER) hold every permission and
          can't be narrowed. Only a super admin can assign or remove them. You can't grant permissions your own role lacks.
        </p>
      </QueryState>

      <CreateRoleDialog open={showCreate} onOpenChange={setShowCreate} roles={roles} />

      <RoleDrawer
        role={drawerRole}
        onClose={() => setDrawerRoleId(null)}
        canManage={canManage}
        canEditAdmin={canEditAdmin}
        catalogLabel={labelOf}
      />

      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review permission changes</DialogTitle>
            <DialogDescription className="text-zinc-400">
              These take effect on the members' next request.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-4 overflow-y-auto">
            {changes.map((c) => (
              <div key={c.role.id} className="rounded-lg border border-zinc-800 p-3">
                <p className="mb-2 text-sm font-semibold">
                  {c.role.name}{' '}
                  <span className="text-xs font-normal text-zinc-500">({c.role.member_count} members)</span>
                </p>
                {c.granted.map((k) => (
                  <p key={k} className="text-xs text-emerald-300">
                    + {labelOf(k)} <code className="text-emerald-500/70">{k}</code>
                  </p>
                ))}
                {c.revoked.map((k) => (
                  <p key={k} className="text-xs text-red-300">
                    − {labelOf(k)} <code className="text-red-500/70">{k}</code>
                  </p>
                ))}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-zinc-300" onClick={() => setReview(false)}>
              Keep editing
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200" disabled={saving} onClick={saveAll}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default RolesPage;
