/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import useCurrentUser from '@/hooks/useCurrentUser';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchProducts, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct, createProduct as apiCreateProduct } from "@/lib/Product";
import Spinner from '@/components/Spinner';
import CategorySelect from '@/components/CategorySelect';
import { toast as rtToast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

export default function AdminPanel() {
  const user = useSelector((s: RootState) => s.user);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [launchAt, setLaunchAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ensure current user is loaded before checking admin status
  const loading = useCurrentUser();

  // rely on server-provided isAdmin flag (safer)
  const signedIn = Boolean(user?.email);
  const isAdmin = Boolean((user as any)?.isAdmin);

  const [products, setProducts] = useState<Array<any>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [promoteEmail, setPromoteEmail] = useState<string>("");
  const [promoting, setPromoting] = useState<boolean>(false);
  const [demoteEmail, setDemoteEmail] = useState<string>("");
  const [demoting, setDemoting] = useState<boolean>(false);
  const [users, setUsers] = useState<Array<any>>([]);
  const [userActionLoading, setUserActionLoading] = useState<Record<string, boolean>>({});
  // modal promise resolver reference for confirm/input modal
  const confirmResolveRef = useRef<((v: any) => void) | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title?: string; message?: string; showInput?: boolean; defaultValue?: string; confirmLabel?: string; cancelLabel?: string }>(
    { open: false }
  );

  const load = async () => {
    try {
      setLoadingList(true);
      const data = await fetchProducts();
      setProducts(data.products ?? []);
      setLoadingList(false);
    } catch (err) {
      console.error("Failed to load products", err);
      rtToast.error('Failed to load products');
      setLoadingList(false);
    }
  };

  const loadUsers = async () => {
    try {
      const lib = await import('@/lib/User');
      const res = await lib.fetchAllUsers();
      setUsers(res?.users ?? []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      rtToast.error('Failed to load users');
    }
  };

  useEffect(() => {
    load();
    loadUsers();
    loadAudits(1);
    // intentionally run only once on mount; loadAudits is stable within this module
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // audits
  const [audits, setAudits] = useState<Array<any>>([]);
  const [auditsTotal, setAuditsTotal] = useState<number>(0);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditPageSize] = useState<number>(20);
  const [auditQuery, setAuditQuery] = useState<string>('');

  const loadAudits = async (page = 1, q?: string) => {
    try {
      const lib = await import('@/lib/User');
      const res = await lib.fetchAdminAudits(page, auditPageSize, q ?? undefined);
      setAudits(res.items || []);
      setAuditsTotal(res.total || 0);
      setAuditPage(res.page || page);
    } catch (err) {
      console.error('Failed to load audits', err);
      rtToast.error('Failed to load audit logs');
    }
  };

  // Promise-based modal helper: opens confirm/input modal and resolves with user response
  const [confirmInputValue, setConfirmInputValue] = useState<string>('');
  const [panelView, setPanelView] = useState<'home' | 'admin' | 'products'>('home');
  const openConfirmModal = (opts: { title?: string; message?: string; showInput?: boolean; defaultValue?: string; confirmLabel?: string; cancelLabel?: string }) => {
    return new Promise<any>((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmInputValue(opts.defaultValue ?? '');
      setConfirmModal({
        open: true,
        title: opts.title,
        message: opts.message,
        showInput: Boolean(opts.showInput),
        defaultValue: opts.defaultValue ?? '',
        confirmLabel: opts.confirmLabel ?? 'Confirm',
        cancelLabel: opts.cancelLabel ?? 'Cancel',
      });
    });
  };

  const handlePromote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoteEmail || promoteEmail.indexOf('@') === -1) {
      rtToast.error('Enter a valid email');
      return;
    }
    try {
      setPromoting(true);
      // prompt for optional reason via modal
      const reason = await openConfirmModal({ title: 'Reason (optional)', message: 'Enter an optional reason for promotion (leave blank to skip)', showInput: true, defaultValue: '' });
      const lib = await import('@/lib/User');
      const res = await lib.promoteToAdmin(promoteEmail, reason ?? undefined);
      rtToast.success(res?.message || 'User promoted to admin');
      setPromoteEmail('');
    } catch (err) {
      console.error('promote failed', err);
      // try to extract useful message
      let msg = 'Promotion failed';
      if (err && typeof err === 'object') {
        // axios error shape
  // @ts-expect-error - axios error shape may differ at runtime
  msg = err?.response?.data?.error ?? err?.message ?? msg;
      }
      rtToast.error(String(msg));
    } finally {
      setPromoting(false);
      // refresh users
      await loadUsers();
    }
  };

  const handleDemote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!demoteEmail || demoteEmail.indexOf('@') === -1) {
      rtToast.error('Enter a valid email');
      return;
    }
    try {
      setDemoting(true);
      // confirmation modal
      const ok = await openConfirmModal({ title: 'Confirm revoke', message: `Revoke admin rights from ${demoteEmail}? This cannot be undone without another admin.`, showInput: false });
      if (!ok) return;
      const reason = await openConfirmModal({ title: 'Reason (optional)', message: 'Optional reason for revoking admin rights (leave blank to skip)', showInput: true, defaultValue: '' });
      const lib = await import('@/lib/User');
      const res = await lib.demoteFromAdmin(demoteEmail, reason ?? undefined);
      rtToast.success(res?.message || 'Admin rights revoked');
      setDemoteEmail('');
    } catch (err) {
      console.error('demote failed', err);
      let msg = 'Demotion failed';
      if (err && typeof err === 'object') {
        // @ts-expect-error - axios error shape may differ at runtime
        msg = err?.response?.data?.error ?? err?.message ?? msg;
      }
      rtToast.error(String(msg));
    } finally {
      setDemoting(false);
      // refresh users
      await loadUsers();
    }
  };

  const toggleUserActionLoading = (key: string, val: boolean) => {
    setUserActionLoading((s) => ({ ...s, [key]: val }));
  };

  const handleInlineToggle = async (userObj: any) => {
    const email = userObj.email;
    if (!email) return;
    const isTargetAdmin = Boolean(userObj.isAdmin);
    try {
      toggleUserActionLoading(email, true);
      if (isTargetAdmin) {
        const ok = await openConfirmModal({ title: 'Confirm revoke', message: `Revoke admin rights from ${email}?`, showInput: false });
        if (!ok) return;
        const reason = await openConfirmModal({ title: 'Reason (optional)', message: 'Optional reason for revoking admin rights (leave blank to skip)', showInput: true, defaultValue: '' });
        const lib = await import('@/lib/User');
        await lib.demoteFromAdmin(email, reason ?? undefined);
        rtToast.success('Admin rights revoked');
      } else {
        const reason = await openConfirmModal({ title: 'Reason (optional)', message: 'Optional reason for promotion (leave blank to skip)', showInput: true, defaultValue: '' });
        const lib = await import('@/lib/User');
        await lib.promoteToAdmin(email, reason ?? undefined);
        rtToast.success('User promoted to admin');
      }
      await loadUsers();
    } catch (err) {
      console.error('inline toggle failed', err);
      let msg = 'Action failed';
  // @ts-expect-error - axios error shape may differ at runtime
  msg = err?.response?.data?.error ?? err?.message ?? msg;
      rtToast.error(String(msg));
    } finally {
      toggleUserActionLoading(email, false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setQuantity("");
    setImageFile(null);
    setPreviewUrl(null);
    setStatus(null);
    setLaunchAt(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      // revoke previous preview if present
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setImageFile(f);
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setImageFile(null);
    }
  };

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (String(price).trim() === '') errs.price = 'Price is required';
    if (!category) errs.category = 'Category is required';
    if (String(quantity).trim() === '') errs.quantity = 'Quantity is required';
    return errs;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStatus("saving");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", String(name));
      fd.append("description", String(description));
      fd.append("price", String(price));
      fd.append("category", String(category));
      fd.append("quantity", String(quantity));
      if (launchAt) fd.append("launchAt", String(launchAt));
      if (imageFile) fd.append("image", imageFile as Blob, imageFile.name);

    await apiCreateProduct(fd);
    setStatus("saved");
  rtToast.success('Product created');
      resetForm();
      await load();
    } catch (err) {
      console.error("create failed", err);
      setStatus("error");
  rtToast.error('Create failed');
    }
    finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = await openConfirmModal({ title: 'Confirm delete', message: 'Delete this product?', showInput: false });
    if (!ok) return;
    try {
      await apiDeleteProduct(id);
      setProducts((p) => p.filter((x) => x._id !== id));
  rtToast.success('Deleted product');
    } catch (err) {
      console.error("delete failed", err);
  rtToast.error('Delete failed');
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p._id);
    setName(p.name || "");
    setDescription(p.description || "");
    setPrice(p.price ?? "");
    setCategory(p.category || "");
    setQuantity(p.quantity ?? "");
    setImageFile(null);
    setLaunchAt(p.launchAt ? String(new Date(p.launchAt).toISOString()).slice(0,16) : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (p: any) => {
    setModalProduct(p);
    setModalVisible(true);
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setStatus("saving");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", String(name));
      fd.append("description", String(description));
      fd.append("price", String(price));
      fd.append("category", String(category));
      fd.append("quantity", String(quantity));
      if (launchAt) fd.append("launchAt", String(launchAt));
      if (imageFile) fd.append("image", imageFile as Blob, imageFile.name);

      await apiUpdateProduct(editingId, fd);
      setEditingId(null);
      resetForm();
      await load();
      setStatus("saved");
  rtToast.success('Product updated');
    } catch (err) {
      console.error("update failed", err);
      setStatus("error");
  rtToast.error('Update failed');
    }
    finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading user…</div>;
  }

  if (!signedIn) {
    return <div className="p-6">Please sign in to access the admin panel.</div>;
  }

  if (!isAdmin) {
    return <div className="p-6">Access denied. You are not an admin.</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="text-sm text-gray-500">Manage products (admin)</div>
      </div>
      {/* Home selector: choose Admin Settings or Product Manager */}
      {panelView === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div onClick={() => setPanelView('admin')} role="button" className="p-6 cursor-pointer rounded-lg border hover:shadow-lg transition transform-gpu hover:-translate-y-1">
            <h3 className="text-lg font-semibold mb-2">Admin Settings</h3>
            <p className="text-sm text-gray-500">Manage users, promotions, and view audit logs.</p>
          </div>
          <div onClick={() => setPanelView('products')} role="button" className="p-6 cursor-pointer rounded-lg border hover:shadow-lg transition transform-gpu hover:-translate-y-1">
            <h3 className="text-lg font-semibold mb-2">Product Manager</h3>
            <p className="text-sm text-gray-500">Create, edit and delete products; manage product inventory and images.</p>
          </div>
        </div>
      )}

      {/* Admin Settings view */}
      {panelView === 'admin' && (
        <>
          <div className="flex items-center gap-2">
            <button onClick={() => setPanelView('home')} className="px-3 py-1 rounded border">← Back</button>
            <h2 className="text-lg font-medium">Admin Settings</h2>
          </div>
  {/* Audit log viewer */}
  <div className="p-4 bg-white rounded-md border">
        <h3 className="font-medium mb-2">Admin audit log</h3>
        <div className="flex gap-2 items-center mb-3">
          <input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="Search by email, action, note..." className="px-3 py-2 border rounded flex-1" />
          <button onClick={() => loadAudits(1, auditQuery)} className="px-3 py-2 bg-gray-100 rounded">Search</button>
        </div>
        <div className="overflow-auto max-h-64">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="text-xs text-gray-600 border-b">
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">Actor</th>
                <th className="py-2 px-2">Action</th>
                <th className="py-2 px-2">Target</th>
                <th className="py-2 px-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="py-2 px-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-2">{a.actorEmail || '-'}</td>
                  <td className="py-2 px-2">{a.action}</td>
                  <td className="py-2 px-2">{a.targetEmail || '-'}</td>
                  <td className="py-2 px-2">{a.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <div>{audits.length > 0 ? `Showing ${audits.length} of ${auditsTotal}` : 'No audit records'}</div>
          <div className="flex gap-2">
            <button disabled={auditPage <= 1} onClick={() => loadAudits(auditPage - 1, auditQuery)} className="px-2 py-1 border rounded">Prev</button>
            <button disabled={(auditPage * auditPageSize) >= auditsTotal} onClick={() => loadAudits(auditPage + 1, auditQuery)} className="px-2 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
      
  {/* Promote user to admin */}
      <div className="p-4 bg-gray-50 rounded-md border">
        <h3 className="font-medium">Promote user to admin</h3>
        <p className="text-xs text-gray-500 mb-2">Enter an email to grant admin privileges. Only current admins can perform this.</p>
        <form onSubmit={handlePromote} className="flex gap-2 items-center">
          <input type="email" placeholder="user@example.com" value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)} className="px-3 py-2 border rounded w-80" />
          <button type="submit" disabled={promoting} className="px-3 py-2 rounded btn btn-primary">
            {promoting ? 'Promoting...' : 'Promote'}
          </button>
        </form>
      </div>

  {/* Revoke admin rights */}
      <div className="p-4 bg-gray-50 rounded-md border">
        <h3 className="font-medium">Revoke admin rights</h3>
  <p className="text-xs text-gray-500 mb-2">Enter an admin&apos;s email to remove admin privileges. You cannot remove your own admin rights.</p>
        <form onSubmit={handleDemote} className="flex gap-2 items-center">
          <input type="email" placeholder="admin@example.com" value={demoteEmail} onChange={(e) => setDemoteEmail(e.target.value)} className="px-3 py-2 border rounded w-80" />
          <button type="submit" disabled={demoting} className="px-3 py-2 rounded btn btn-danger">
            {demoting ? 'Revoking...' : 'Revoke'}
          </button>
        </form>
      </div>

  {/* Users list with inline Promote/Revoke */}
  <div className="p-4 bg-white rounded-md border">
        <h3 className="font-medium mb-2">Users</h3>
        <div className="text-sm text-gray-500 mb-3">List of users. Use the inline buttons to promote or revoke admin rights.</div>
        <div className="overflow-auto max-h-80">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="text-xs text-gray-600 border-b">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Admin</th>
                <th className="py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{u.name || '-'}</td>
                  <td className="py-2 px-2">{u.email}</td>
                  <td className="py-2 px-2">{u.isAdmin ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-2">
                    <button disabled={!!userActionLoading[u.email]} onClick={() => handleInlineToggle(u)} className={`px-3 py-1 rounded text-sm ${u.isAdmin ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {userActionLoading[u.email] ? 'Working...' : (u.isAdmin ? 'Revoke' : 'Promote')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Product Manager view */}
      {panelView === 'products' && (
        <>
          <div className="flex items-center gap-2">
            <button onClick={() => setPanelView('home')} className="px-3 py-1 rounded border">← Back</button>
            <h2 className="text-lg font-medium">Product Manager</h2>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg bg-gradient-to-br from-white to-gray-50">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={editingId ? onSaveEdit : onSubmit} className="space-y-3">
            <input required aria-label="Product name" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow duration-200" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (required)" />
            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
            <textarea required aria-label="Product description" className="w-full border px-3 py-2 rounded h-28 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow duration-200" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (required)" />
            {errors.description && <div className="text-xs text-red-600 mt-1">{errors.description}</div>}
            <div className="grid grid-cols-3 gap-3 items-start">
              <div className="col-span-1">
                <label className="sr-only">Price</label>
                <input required aria-label="Product price" className="w-full border px-3 py-2 rounded focus:outline-none" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (required)" type="number" />
                <div className="text-xs text-gray-400 mt-1">Price in INR. Use numbers only (e.g. 1999 for ₹1,999).</div>
              </div>
              <div className="col-span-1">
                <label className="sr-only">Category</label>
                <CategorySelect value={category} onChange={(v) => setCategory(v)} placeholder="Select category" />
                {errors.category && <div className="text-xs text-red-600 mt-1">{errors.category}</div>}
              </div>
              <div className="col-span-1">
                <label className="sr-only">Quantity</label>
                <input required aria-label="Product quantity" className="w-full border px-3 py-2 rounded focus:outline-none" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity (required)" type="number" />
                {errors.quantity && <div className="text-xs text-red-600 mt-1">{errors.quantity}</div>}
                {!errors.quantity && <div className="text-xs text-gray-400 mt-1">Quantity is the available stock count (integer).</div>}
              </div>
              <div className="col-span-1">
                <label className="sr-only">Launch time</label>
                <input aria-label="Launch time" className="w-full border px-3 py-2 rounded focus:outline-none" value={launchAt ?? ''} onChange={(e) => setLaunchAt(e.target.value || null)} placeholder="Optional launch time" type="datetime-local" />
                <div className="text-xs text-gray-400 mt-1">Optional: schedule product launch (local datetime). Leave empty for immediate availability.</div>
              </div>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input id="product-image" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <span role="button" aria-controls="product-image" className="px-3 py-2 bg-gray-100 rounded text-sm hover:brightness-95 transition">Choose image</span>
              </label>
              {previewUrl && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Preview</div>
                  {/* previewUrl is a blob/object URL. keep plain img for local preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="preview" className="w-36 h-36 object-cover rounded border shadow-sm" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className={`px-4 py-2 bg-green-600 text-white rounded shadow transition transform-gpu ${submitting ? 'opacity-90 pointer-events-none' : 'hover:-translate-y-0.5 hover:brightness-105'}`} aria-label={editingId ? 'Save changes' : 'Create product'}>
                {!submitting ? (editingId ? 'Save Changes' : 'Create Product') : (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span>Saving</span>
                    <span className="ml-1">...</span>
                  </span>
                )}
              </button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="px-3 py-2 border rounded">Cancel</button>}
              <div className="text-sm text-gray-500">{status}</div>
            </div>
          </form>
        </div>

        <div className="p-6 border rounded-lg bg-white">
          <h2 className="font-semibold mb-4">Existing Products</h2>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {loadingList && <div className="text-sm text-gray-500 flex items-center gap-2"><Spinner size={1.5} /> Loading products...</div>}
            {!loadingList && products.length === 0 && <div className="text-sm text-gray-500">No products yet.</div>}
            {products.map((p, i) => (
              <div key={p._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition transform-gpu" style={{ animation: `listItemFade 320ms ease ${i * 30}ms both` }}>
                <Image src={p.image || '/images/placeholder.png'} alt={p.name} width={80} height={80} className="w-20 h-20 object-cover rounded transition-transform hover:scale-105" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.category} • ₹{p.price}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(p)} className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded border btn">Edit</button>
                  <button onClick={() => onDelete(p._id)} className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded border btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
          </>
        )}

        {/* react-toastify handles toasts globally via ToastContainer in providers */}

      {/* Confirmation / Input modal used for promote/demote/delete actions */}
      <Transition show={confirmModal.open} as={Fragment} appear>
        <Dialog as="div" className="relative z-50" onClose={() => {
          // cancel
          setConfirmModal({ open: false });
          if (confirmResolveRef.current) confirmResolveRef.current(null);
          confirmResolveRef.current = null;
        }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transform transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-4 scale-95"
            >
              <Dialog.Panel className="bg-white rounded p-6 w-[90%] max-w-md transform shadow-lg">
                <Dialog.Title className="font-semibold text-lg">{confirmModal.title || 'Confirm'}</Dialog.Title>
                <div className="mt-3 text-sm text-gray-700">{confirmModal.message}</div>
                {confirmModal.showInput && (
                  <div className="mt-3">
                    <input value={confirmInputValue} onChange={(e) => setConfirmInputValue(e.target.value)} placeholder="Optional note" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => {
                    setConfirmModal({ open: false });
                    if (confirmResolveRef.current) confirmResolveRef.current(null);
                    confirmResolveRef.current = null;
                  }} className="px-3 py-2 rounded border bg-gray-50">{confirmModal.cancelLabel || 'Cancel'}</button>
                  <button onClick={() => {
                    const val = confirmModal.showInput ? confirmInputValue : true;
                    setConfirmModal({ open: false });
                    if (confirmResolveRef.current) confirmResolveRef.current(val);
                    confirmResolveRef.current = null;
                  }} className="px-3 py-2 rounded bg-indigo-600 text-white">{confirmModal.confirmLabel || 'Confirm'}</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Modal for product detail/edit preview - Headless UI Dialog */}
      <Transition show={modalVisible} as={Fragment} afterLeave={() => setModalProduct(null)}>
        <Dialog as="div" className="relative z-50" onClose={() => setModalVisible(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transform transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-4 scale-95"
            >
              <Dialog.Panel className="bg-white rounded p-6 w-[90%] max-w-2xl transform">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="font-semibold">Edit product</Dialog.Title>
                  <button onClick={() => setModalVisible(false)} className="text-sm text-gray-500">Close</button>
                </div>
                {modalProduct && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {previewUrl ? (
                        // previewUrl is a blob/object URL; use plain img for local preview
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt={modalProduct.name} className="w-full h-56 object-cover rounded" />
                      ) : (
                        <Image src={modalProduct.image || '/images/placeholder.png'} alt={modalProduct.name} width={600} height={280} className="w-full h-56 object-cover rounded" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{modalProduct.name}</div>
                      <div className="text-sm text-gray-500">{modalProduct.category} • ₹{modalProduct.price}</div>
                      <div className="text-xs text-gray-500 mt-1">Created by: {modalProduct.createdByEmail || '—'}</div>
                      <div className="mt-3 text-sm">{modalProduct.description}</div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => { startEdit(modalProduct); setModalVisible(false); }} className="px-3 py-2 rounded btn btn-primary">Edit</button>
                        <button onClick={() => { onDelete(modalProduct._id); setModalVisible(false); }} className="px-3 py-2 rounded btn btn-danger">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 300ms ease-out; }
  .animate-scaleIn { animation: scaleIn 240ms cubic-bezier(.2,.9,.2,1); }
  @keyframes scaleIn { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
  @keyframes listItemFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .modal-enter { animation: fadeIn 220ms ease-out; }
  input, textarea, select { transition: box-shadow 180ms ease, transform 120ms ease; }
  input:focus, textarea:focus, select:focus { box-shadow: 0 6px 18px rgba(8, 102, 92, 0.06); transform: translateY(-2px); }
  .modal-exit { animation: modalExit 200ms ease-in forwards; }
  @keyframes modalExit { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(6px); } }
  @keyframes pulse { 0% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.2); opacity: .8 } 100% { transform: scale(1); opacity: 1 } }
  .animate-pulse { animation: pulse 800ms infinite ease-in-out; }
  .btn { transition: transform 160ms ease, box-shadow 160ms ease; }
  .btn:active { transform: translateY(1px) scale(.998); }
  .btn-primary { background: linear-gradient(180deg,#2563eb,#1e40af); color: white; box-shadow: 0 6px 20px rgba(37,99,235,0.12); }
  .btn-danger { background: linear-gradient(180deg,#ef4444,#b91c1c); color: white; box-shadow: 0 6px 20px rgba(239,68,68,0.12); }
  table tr { transition: transform 160ms ease, background-color 160ms ease; }
  table tr:hover { transform: translateY(-2px); background-color: #fbfbfd; }
  .dialog-shadow { box-shadow: 0 18px 40px rgba(2,6,23,0.12); }
      `}</style>
    </div>
  );
}
