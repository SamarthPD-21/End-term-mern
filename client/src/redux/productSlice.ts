/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createProduct as apiCreateProduct } from "@/lib/Product";

export const createProductThunk = createAsyncThunk(
  "product/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await apiCreateProduct(formData);
      return res.product;
    } catch (err) {
      const e = err as any;
      return rejectWithValue(e.response?.data ?? { message: e.message });
    }
  }
);

interface ProductState {
  creating: boolean;
  error: string | null;
}

const initialState: ProductState = { creating: false, error: null };

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createProductThunk.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(createProductThunk.fulfilled, (state) => {
      state.creating = false;
      state.error = null;
    });
    builder.addCase(createProductThunk.rejected, (state, action: PayloadAction<any>) => {
      state.creating = false;
      state.error = action.payload?.error ?? action.payload?.message ?? String(action.payload);
    });
  },
});

export default productSlice.reducer;
