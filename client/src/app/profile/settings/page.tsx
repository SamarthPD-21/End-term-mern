"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateEmail, updateName } from "@/redux/userSlice";
import { useState } from "react";
import { updateUserProfile } from "@/lib/User";

export default function SettingsPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");

  const handleSave = () => {
    // update profile details
    if (user.name == name && user.email == email) {
      return;
    }
    dispatch(updateName(name));
    dispatch(updateEmail(email));
    
    updateUserProfile(name, email)
      .then((data) => {
        console.log("Profile updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-veblyssPrimary text-white px-4 py-2 rounded-lg shadow"
          style={{ backgroundColor: "#368581" }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
