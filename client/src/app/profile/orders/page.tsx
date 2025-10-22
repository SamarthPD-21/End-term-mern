"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function OrdersPage() {
  const user = useSelector((state: RootState) => state.user);
  const orders = user.orderdata || {};

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Past Orders</h2>
      {Object.keys(orders).length === 0 ? (
        <p className="text-sm text-gray-600">No orders yet.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(orders).map(([id, order]) => (
            <li key={id} className="bg-gray-50 p-3 rounded-lg">
              <pre className="text-xs">{JSON.stringify(order, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
