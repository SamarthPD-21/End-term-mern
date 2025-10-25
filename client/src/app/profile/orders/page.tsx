"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type OrderProduct = { productId?: string; id?: string; name?: string; price?: number; quantity?: number; image?: string };
type OrderType = { orderId?: string; orderDate?: string; totalAmount?: number; status?: string; products?: OrderProduct[] };

export default function OrdersPage() {
  const user = useSelector((state: RootState) => state.user);
  const orders: OrderType[] = Array.isArray(user.orderdata) ? (user.orderdata as OrderType[]) : [];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Past Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-600">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <div key={`${o.orderId}-${idx}`} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Order <span className="font-mono text-sm">{o.orderId}</span></div>
                  <div className="text-xs text-gray-500">{new Date(o.orderDate || Date.now()).toLocaleString()}</div>
                </div>
                <div className="text-right">
                    <div className="font-semibold">₹{Number(o.totalAmount || 0).toFixed(2)}</div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : ''}
                        ${o.status === 'packing' ? 'bg-indigo-100 text-indigo-800 animate-pulse' : ''}
                        ${o.status === 'shipping' ? 'bg-blue-100 text-blue-800 animate-pulse' : ''}
                        ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${o.status === 'canceled' ? 'bg-red-100 text-red-800' : ''}
                      `}>{o.status}</span>
                    </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {(o.products || []).map((p) => (
                  <div key={p.productId || p.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">Qty: {p.quantity} • ₹{Number(p.price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
