"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";


export default function WishlistPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const wishlist = user.wishlistdata || {};

  const handleRemove = (id: string) => {
    // remove from wishlist
    console.log(id);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Your Wishlist</h2>
      {Object.keys(wishlist).length === 0 ? (
        <p className="text-sm text-gray-600">No saved items.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(wishlist).map(([id, item]) => (
            <li key={id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span>{JSON.stringify(item)}</span>
              <button
                onClick={() => handleRemove(id)}
                className="text-red-600 text-sm font-medium"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
