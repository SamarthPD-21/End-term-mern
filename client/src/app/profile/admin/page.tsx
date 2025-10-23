/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchProducts, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct, createProduct as apiCreateProduct } from "@/lib/Product";
import Spinner from '@/components/Spinner';
import CategorySelect from '@/components/CategorySelect';
import { toast as rtToast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';

export default function AdminPanel() {
  const user = useSelector((s: RootState) => s.user);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // rely on server-provided isAdmin flag (safer)
  const signedIn = Boolean(user?.email);
  const isAdmin = Boolean((user as any)?.isAdmin);

  const [products, setProducts] = useState<Array<any>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoadingList(true);
      const data = await fetchProducts();
      setProducts(data.products ?? []);
      setLoadingList(false);
    } catch (err) {
      console.error("Failed to load products", err);
      setLoadingList(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setQuantity("");
    setImageFile(null);
    setPreviewUrl(null);
    setStatus(null);
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
    if (!confirm("Delete this product?")) return;
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
            </div>

            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input id="product-image" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <span role="button" aria-controls="product-image" className="px-3 py-2 bg-gray-100 rounded text-sm hover:brightness-95 transition">Choose image</span>
              </label>
              {previewUrl && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Preview</div>
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
                <img src={p.image || '/images/placeholder.png'} alt={p.name} className="w-20 h-20 object-cover rounded transition-transform hover:scale-105" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.category} • ₹{p.price}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(p)} className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded border">Edit</button>
                  <button onClick={() => onDelete(p._id)} className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded border">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* react-toastify handles toasts globally via ToastContainer in providers */}

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
                      <img src={previewUrl || modalProduct.image || '/images/placeholder.png'} alt={modalProduct.name} className="w-full h-56 object-cover rounded" />
                    </div>
                    <div>
                      <div className="font-medium">{modalProduct.name}</div>
                      <div className="text-sm text-gray-500">{modalProduct.category} • ₹{modalProduct.price}</div>
                      <div className="mt-3 text-sm">{modalProduct.description}</div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => { startEdit(modalProduct); setModalVisible(false); }} className="px-3 py-2 bg-blue-600 text-white rounded">Edit</button>
                        <button onClick={() => { onDelete(modalProduct._id); setModalVisible(false); }} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
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
      `}</style>
    </div>
  );
}
