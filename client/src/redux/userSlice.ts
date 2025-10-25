// src/redux/userSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadProfileImage as apiUploadProfileImage } from "../lib/User";

interface AddressData {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface UserState {
  name: string | null;
  email: string | null;
  isAdmin?: boolean | null;
  profileImage?: string | null;
  cartdata: CartItem[];
  wishlistdata: Array<{ id: string; name: string; price: number }> | null;
  orderdata: Array<{ id: string; name: string; price: number }> | null;
  addressdata: Array<AddressData> | null;
}

const initialState: UserState = {
  name: null,
  email: null,
  isAdmin: null,
  profileImage: null,
  cartdata: [],
  wishlistdata: null,
  orderdata: null,
  addressdata: null,
};

export const uploadProfileImageThunk = createAsyncThunk(
  "user/uploadProfileImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const data = await apiUploadProfileImage(file);
      // API may return either: { message, image, user } or { message, image }
      // Normalize to either return the full user object (when provided) or
      // a plain string containing the image URL. Returning a plain string
      // for the image makes reducer handling simpler and avoids accidental
      // overwrites of other user fields (like isAdmin).
      const d = data as unknown;
      if (d && typeof d === "object") {
        const od = d as Record<string, unknown>;
        if (od.user !== undefined) return od.user as unknown;
        if (typeof od.image === "string") return od.image;
      }
      return undefined;
    } catch (err) {
      const e = err as unknown;
      let payload: unknown = { message: String(e) };
      if (e && typeof e === "object") {
        const oe = e as Record<string, unknown>;
        const resp = oe.response as Record<string, unknown> | undefined;
        payload = resp?.data ?? oe.message ?? payload;
      }
      return rejectWithValue(payload);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Accept partial updates and merge with existing state so callers
    // that provide only some fields (eg. cartdata) don't wipe other fields
    // like profileImage or isAdmin by replacing the whole state.
    // This merge is defensive: it only overwrites when the incoming value
    // is not undefined. This prevents accidental clears when callers send
    // objects missing optional properties.
    setUser(state, action: PayloadAction<Partial<UserState> | unknown>) {
      const payload = action.payload ?? {};
  const pl = payload as Record<string, unknown>;
  const incomingObj = (pl.user && typeof pl.user === 'object') ? (pl.user as Record<string, unknown>) : (payload as Record<string, unknown>);

      const next: UserState = { ...state };

      if (incomingObj == null || typeof incomingObj !== 'object') return next;

      // DEBUG: Log incoming partials during development to trace unexpected clears
      try {
        // Only log during development to avoid console noise in production
        if (process.env.NODE_ENV === 'development') {
          const incomingProfile = typeof incomingObj['profileImage'] === 'string' ? incomingObj['profileImage'] : undefined;
            // dev-only diagnostic log
          console.log("[userSlice:setUser] incoming keys:", Object.keys(incomingObj), "incoming.profileImage:", incomingProfile, "current.profileImage:", state.profileImage);
        }
      } catch {
        // ignore logging errors
      }

  if ('name' in incomingObj) next.name = typeof incomingObj['name'] === 'string' ? incomingObj['name'] as string : null;
  if ('email' in incomingObj) next.email = typeof incomingObj['email'] === 'string' ? incomingObj['email'] as string : null;
  if ('isAdmin' in incomingObj) next.isAdmin = typeof incomingObj['isAdmin'] === 'boolean' ? incomingObj['isAdmin'] as boolean : null;
  if ('profileImage' in incomingObj) next.profileImage = typeof incomingObj['profileImage'] === 'string' ? incomingObj['profileImage'] as string : null;
  if ('cartdata' in incomingObj) {
    const raw = Array.isArray(incomingObj['cartdata']) ? (incomingObj['cartdata'] as unknown as Array<Record<string, unknown>>) : [];
    // Normalize cart items so reducers can rely on `id` field consistently.
    next.cartdata = raw.map((it) => {
      const id = (it.id as string) || (it.productId as string) || (it._id as string) || '';
      return {
        id: String(id),
        name: typeof it.name === 'string' ? it.name : (typeof it.title === 'string' ? it.title : ''),
        price: Number(it.price || 0),
        quantity: Number(it.quantity ?? it.qty ?? 1),
        image: typeof it.image === 'string' ? it.image : undefined,
      } as CartItem;
    });
  }
  if ('wishlistdata' in incomingObj) next.wishlistdata = Array.isArray(incomingObj['wishlistdata']) ? incomingObj['wishlistdata'] as unknown as Array<{ id: string; name: string; price: number }> : null;
  if ('orderdata' in incomingObj) next.orderdata = Array.isArray(incomingObj['orderdata']) ? incomingObj['orderdata'] as unknown as Array<{ id: string; name: string; price: number }> : null;
  if ('addressdata' in incomingObj) next.addressdata = Array.isArray(incomingObj['addressdata']) ? incomingObj['addressdata'] as unknown as Array<AddressData> : null;

      return next;
    },
    resetUser() {
      return initialState;
    },
    updateName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    updateEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setAddresses(state, action: PayloadAction<Array<AddressData>>) {
      state.addressdata = action.payload;
    },
    removeAddress(state, action: PayloadAction<string>) {
      if (state.addressdata) {
        state.addressdata = state.addressdata.filter(
          (addr) => addr._id !== action.payload
        );
      }
    },

    // ✅ Fix: Cart updates now happen instantly
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.cartdata = action.payload;
    },
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.cartdata.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cartdata.push(action.payload);
      }
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const item = state.cartdata.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cartdata = state.cartdata.filter((item) => item.id !== action.payload);
    },

    updateWishlist(
      state,
      action: PayloadAction<Array<{ id: string; name: string; price: number }>>
    ) {
      state.wishlistdata = action.payload;
    },
    updateOrder(
      state,
      action: PayloadAction<Array<{ id: string; name: string; price: number }>>
    ) {
      state.orderdata = action.payload;
    },
    updateAddress(state, action: PayloadAction<Array<AddressData>>) {
      state.addressdata = action.payload;
    },
    setProfileImage(state, action: PayloadAction<string | null>) {
      state.profileImage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(uploadProfileImageThunk.fulfilled, (state, action: PayloadAction<unknown>) => {
      // Handle three possible payload shapes from the thunk:
      // 1) undefined/null -> nothing to do
      // 2) string -> image URL, update profileImage only
      // 3) object -> full user object (map fields) but preserve existing isAdmin
      const payload = action.payload;
      if (payload == null) return;

      if (typeof payload === "string") {
        state.profileImage = payload;
        return;
      }

      if (typeof payload === "object") {
        const p = payload as Record<string, unknown>;
        // If server returned a full user object, map values but preserve isAdmin
        if (p.name !== undefined) {
          const preservedIsAdmin = typeof p.isAdmin === 'boolean' ? p.isAdmin : (state.isAdmin ?? null);
          return {
            name: typeof p.name === "string" ? p.name : null,
            email: typeof p.email === "string" ? p.email : null,
            isAdmin: preservedIsAdmin,
            profileImage: typeof p.profileImage === 'string' ? p.profileImage : state.profileImage ?? null,
            cartdata: Array.isArray(p.cartdata) ? (p.cartdata as unknown as CartItem[]) : state.cartdata ?? [],
            wishlistdata: Array.isArray(p.wishlistdata)
              ? (p.wishlistdata as unknown as Array<{ id: string; name: string; price: number }>)
              : state.wishlistdata ?? null,
            orderdata: Array.isArray(p.orderdata)
              ? (p.orderdata as unknown as Array<{ id: string; name: string; price: number }>)
              : state.orderdata ?? null,
            addressdata: Array.isArray(p.addressdata)
              ? (p.addressdata as unknown as Array<AddressData>)
              : state.addressdata ?? null,
          } as UserState;
        }
        // fallback: if object contains image key but not full user
        if (typeof p.image === 'string') {
          state.profileImage = p.image;
        }
      }
    });
  },
});

export const {
  setUser,
  resetUser,
  updateName,
  updateEmail,
  setAddresses,
  removeAddress,
  setCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  updateWishlist,
  updateOrder,
  updateAddress,
  setProfileImage,
} = userSlice.actions;

// uploadProfileImageThunk is exported where it is declared above

export default userSlice.reducer;
