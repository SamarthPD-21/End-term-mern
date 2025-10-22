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
      return data.user || { image: data.image };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: err.message });
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
    builder.addCase(uploadProfileImageThunk.fulfilled, (state, action) => {
      // If the thunk returned a user object, map it into state
      const payload = action.payload as any;
      if (payload && payload.name !== undefined) {
        return {
          name: payload.name,
          email: payload.email,
          profileImage: payload.profileImage || null,
          cartdata: payload.cartdata || [],
          wishlistdata: payload.wishlistdata || null,
          orderdata: payload.orderdata || null,
          addressdata: payload.addressdata || null,
        } as UserState;
      }
      // otherwise payload might be just the image string
      if (typeof payload === "string") {
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
