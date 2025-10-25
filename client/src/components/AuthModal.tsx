"use client";
import React, { useState, FC, MouseEvent, FormEvent } from "react";
import { notify } from '@/lib/toast'
import { useDispatch } from "react-redux";
import { login, signup } from "@/lib/Auth";
import { setUser } from "@/redux/userSlice";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

// Use Tailwind classes for styling and animation so the modal matches the app theme.

const EXIT_MS = 260;

const AuthModal: FC<AuthModalProps> = ({ open, onClose }) => {
  const [isSignup, setIsSignup] = useState(false);
  const dispatch = useDispatch();

  // animate exit before calling onClose so the modal unmounts smoothly
  const [exiting, setExiting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep mounted while playing exit animation
  if (!open && !exiting) return null;

  const startClose = () => {
    setExiting(true);
    window.setTimeout(() => {
      setExiting(false);
      onClose();
    }, EXIT_MS);
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) startClose();
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const payload = isSignup
        ? await signup(name.trim(), email.trim(), password)
        : await login(email.trim(), password);

      const user = payload.user || payload;
      console.log("Authenticated user:", user);
      dispatch(setUser({
        name: user.name ?? null,
        email: user.email ?? null,
        cartdata: user.cartdata ?? null,
        wishlistdata: user.wishlistdata ?? null,
        orderdata: user.orderdata ?? null,
        addressdata: user.addressdata ?? null,
      }));

  setName(""); setEmail(""); setPassword("");
  // play exit animation before informing parent to close
  setExiting(true);
  // close modal and then reload so pages that rely on server-side session or
  // fresh data reflect the logged-in state immediately
  window.setTimeout(() => {
    try {
      onClose();
    } finally {
      // small delay to ensure cookies are set; a hard reload guarantees fresh data
      window.setTimeout(() => window.location.reload(), 80);
    }
  }, EXIT_MS);
    } catch (err) {
      console.error(err);
      // Friendly mapping for authentication failures — prefer simple user-facing messages
      let friendly = 'Authentication failed';
      try {
        // axios-like error detection without `any`
        const maybe: unknown = err;
        if (typeof maybe === 'object' && maybe !== null) {
          const resp = maybe as { response?: { status?: number } };
          const status = resp.response?.status;
          if (status === 401) {
            friendly = 'Not logged in';
          } else if (status === 409) {
            friendly = 'User already exists';
          }
        } else if (typeof maybe === 'string') {
          friendly = maybe;
        } else if (maybe instanceof Error && maybe.message) {
          friendly = maybe.message;
        }
      } catch {
        // fallback
      }
      setError(friendly);
      notify.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${exiting ? 'pointer-events-none' : ''}`} onClick={handleBackdropClick}>
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition duration-200 ease-out ${exiting ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <h3 className="text-2xl font-semibold text-[#0f766e]">{isSignup ? "Create an Account" : "Welcome Back"}</h3>
          <p className="text-sm text-gray-500 mt-1">{isSignup ? 'Join SPD — save favorites and checkout faster' : 'Sign in to manage your orders and wishlist'}</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          {isSignup && (
            <input
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#368581]"
              type="text"
              placeholder="Full Name"
              required
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}

          <input
            className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#368581]"
            type="email"
            placeholder="Email Address"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#368581]"
            type="password"
            placeholder="Password"
            required
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <div className="text-center text-sm text-red-600 mt-1">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-2 rounded-md text-white font-semibold bg-gradient-to-r from-[#2f8a7f] to-[#0f766e] hover:scale-[1.02] transform transition">
            {isSignup ? (loading ? "Signing up..." : "Sign Up") : (loading ? "Signing in..." : "Login")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <button className="underline text-[#0f766e]" onClick={() => { setIsSignup(!isSignup); setError(null); }}>
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
