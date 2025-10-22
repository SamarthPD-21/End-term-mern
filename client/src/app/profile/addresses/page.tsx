"use client";

import { useState } from "react";
import { addUserAddress, deleteUserAddress } from "@/lib/User";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setAddresses, removeAddress } from "@/redux/userSlice";

export default function AddressPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const addresses = user.addressdata || [];

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle add address
  const handleAdd = async () => {
    if (!street || !city || !stateName || !postalCode || !country || !phone) {
      alert("Please fill in all fields.");
      return;
    }

    const isDuplicate = addresses.some(
      (addr) =>
        addr.street === street &&
        addr.city === city &&
        addr.state === stateName &&
        addr.postalCode === postalCode &&
        addr.country === country &&
        addr.phone === phone
    );

    if (isDuplicate) {
      alert("This address already exists.");
      return;
    }

    setLoading(true);
    try {
      const newAddress = await addUserAddress(
        street,
        city,
        stateName,
        postalCode,
        country,
        phone
      );

      setStreet("");
      setCity("");
      setStateName("");
      setPostalCode("");
      setCountry("");
      setPhone("");
      setIsModalOpen(false);

      // Update redux with latest addresses
      dispatch(setAddresses(newAddress.addressdata));

      // Reset form + close modal
    } catch (err) {
      console.error("Error adding address:", err);
      alert("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle remove address
  const handleRemove = async (id: string) => {
    try {
      dispatch(removeAddress(id));
      await deleteUserAddress(id);
    } catch (err) {
      console.error("Error removing address:", err);
    }
  };

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#368581] text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Address
        </button>
      </div>

      {/* Address list */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-600">No addresses saved.</p>
        ) : (
          addresses.map((addr, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm"
            >
              <div className="text-sm space-y-1">
                <p>
                  {addr.street}, {addr.city}, {addr.state}
                </p>
                <p>
                  {addr.postalCode}, {addr.country}
                </p>
                <p>📞 {addr.phone}</p>
              </div>
              <button
                onClick={() => handleRemove(addr._id)}
                className="text-red-600 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[2px] z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>

            <div className="space-y-3">
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <input
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="State"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal Code"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="bg-[#368581] text-white px-4 py-2 rounded-lg shadow"
              >
                {loading ? "Adding..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
