"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import AuthModal from "@/components/AuthModal";

export default function ProfileOverview() {
  const user = useSelector((state: RootState) => state.user);
  
  if (!user.name) {
    return <AuthModal open={true} onClose={() => {}} />;
  }

  const cards = [
    { title: "Wishlist", count: Object.keys(user.wishlistdata || {}).length },
    { title: "Orders", count: Object.keys(user.orderdata || {}).length },
    { title: "Addresses", count: Object.keys(user.addressdata || {}).length },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Profile Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-gray-50 p-4 rounded-lg shadow h-40 overflow-auto">
            <h2 className="font-semibold">{card.title}</h2>
            <p className="mt-2 text-2xl">{card.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
