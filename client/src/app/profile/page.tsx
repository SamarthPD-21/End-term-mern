"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import AuthModal from "@/components/AuthModal";
import { useState } from "react";
import { uploadProfileImageThunk } from "@/redux/userSlice";

export default function ProfileOverview() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  if (!user.name) {
    return <AuthModal open={true} onClose={() => {}} />;
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    // dispatch upload immediately
    setUploading(true);
    setStatus("uploading");
    // dispatch thunk (returns a promise)
    // @ts-ignore
    dispatch(uploadProfileImageThunk(file))
      // @ts-ignore
      .unwrap()
      .then(() => {
        setUploading(false);
        setStatus("saved");
        setStatusMessage(null);
        // clear status after 2s
        setTimeout(() => setStatus("idle"), 2000);
      })
      .catch((err: any) => {
        setUploading(false);
        // Try several places for a server message
        const msg =
          err?.payload?.error ||
          err?.error?.error ||
          err?.error?.message ||
          err?.message ||
          err?.payload?.message ||
          "Upload failed";
        setStatus("error");
        setStatusMessage(String(msg));
      });
  };

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

      <div className="mt-6 flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            {status === "uploading" && (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-500">Uploading...</span>
              </>
            )}
            {status === "saved" && <span className="text-sm text-green-600">Saved ✓</span>}
            {status === "error" && <span className="text-sm text-red-600">Error</span>}
          </div>
          {statusMessage && <div className="text-xs text-red-600 mt-1">{statusMessage}</div>}
        </div>

        <div className="ml-6">
          <h3 className="font-medium">Primary Address</h3>
          {user.addressdata && user.addressdata.length > 0 ? (
            <div className="text-sm text-gray-700">
              <div>{user.addressdata[0].street}</div>
              <div>{user.addressdata[0].city}, {user.addressdata[0].state} {user.addressdata[0].postalCode}</div>
              <div>{user.addressdata[0].country}</div>
              <div className="text-xs text-gray-500">{user.addressdata[0].phone}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No address saved</div>
          )}
        </div>
      </div>
    </div>
  );
}
