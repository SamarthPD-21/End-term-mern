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
  profileImage?: string | null;
  cartdata: CartItem[];
  wishlistdata: Array<{ id: string; name: string; price: number }> | null;
  orderdata: Array<{ id: string; name: string; price: number }> | null;
  addressdata: Array<AddressData> | null;
}

const initialState: UserState = {
  name: null,
  email: null,
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
      // API returns { message, image, user }
      const d = data as unknown;
      if (d && typeof d === "object") {
        const od = d as Record<string, unknown>;
        if (od.user !== undefined) return od.user as unknown;
        return { image: typeof od.image === "string" ? od.image : undefined };
      }
      return { image: undefined };
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
    setUser(state, action: PayloadAction<UserState>) {
      return action.payload;
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
      // If the thunk returned a user object, map it into state
      const payload = action.payload as unknown;
      if (payload && typeof payload === 'object') {
        const p = payload as Record<string, unknown>;
        if (p.name !== undefined) {
          return {
            name: typeof p.name === "string" ? p.name : null,
            email: typeof p.email === "string" ? p.email : null,
            profileImage: typeof p.profileImage === "string" ? p.profileImage : null,
            cartdata: Array.isArray(p.cartdata) ? (p.cartdata as unknown as CartItem[]) : [],
            wishlistdata: Array.isArray(p.wishlistdata)
              ? (p.wishlistdata as unknown as Array<{ id: string; name: string; price: number }>)
              : null,
            orderdata: Array.isArray(p.orderdata)
              ? (p.orderdata as unknown as Array<{ id: string; name: string; price: number }>)
              : null,
            addressdata: Array.isArray(p.addressdata)
              ? (p.addressdata as unknown as Array<AddressData>)
              : null,
          } as UserState;
        }
      }
      // otherwise payload might be just the image string
      if (typeof payload === 'string') {
        state.profileImage = payload;
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
