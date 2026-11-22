
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

const productsAdapter = createEntityAdapter();

export const fetchProducts = createAsyncThunk(
  "shop/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://fakestoreapi.com/products"
      );

      if (!response.ok) {
        return rejectWithValue("Failed to fetch products");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const preferences = readStorage("luxe-preferences", {});

const initialState = productsAdapter.getInitialState({
  status: "idle",
  error: null,
  cart: readStorage("luxe-cart", []),
  orders: readStorage("luxe-orders", []),
  user: readStorage("luxe-user", null),
  search: preferences.search || "",
  category: preferences.category || "all",
  sort: preferences.sort || "featured",
});

const shopSlice = createSlice({
  name: "shop",
  initialState,

  reducers: {
    addToCart(state, action) {
      const product = action.payload;

      const existing = state.cart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({
          ...product,
          quantity: 1,
        });
      }
    },

    updateQuantity(state, action) {
      const { id, quantity } = action.payload;

      const item = state.cart.find(
        (product) => product.id === id
      );

      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },

    removeFromCart(state, action) {
      state.cart = state.cart.filter(
        (item) => item.id !== action.payload
      );
    },

    clearCart(state) {
      state.cart = [];
    },

    setSearch(state, action) {
      state.search = action.payload;
    },

    setCategory(state, action) {
      state.category = action.payload;
    },

    setSort(state, action) {
      state.sort = action.payload;
    },

    login(state, action) {
      state.user = action.payload;
    },

    logout(state) {
      state.user = null;
    },

    placeOrder(state, action) {
      state.orders.unshift(action.payload);
    },
  },

  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        productsAdapter.setAll(state, action.payload);
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error.message;
      });
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setSearch,
  setCategory,
  setSort,
  login,
  logout,
  placeOrder,
} = shopSlice.actions;

const adapterSelectors = productsAdapter.getSelectors(
  (state) => state.shop
);

export const selectAllProducts =
  adapterSelectors.selectAll;

export const selectProductById =
  adapterSelectors.selectById;

export const selectCartItems = (state) => state.shop.cart;

export const selectCartCount = createSelector(
  [selectCartItems],
  (cart) =>
    cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
);

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (cart) =>
    cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
);

export const selectCartTotals = createSelector(
  [selectCartSubtotal],
  (subtotal) => {
    const discount =
      subtotal >= 100 ? subtotal * 0.10 : 0;

    const tax = (subtotal - discount) * 0.05;

    const shipping =
      subtotal === 0 || subtotal >= 100 ? 0 : 10;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total: subtotal - discount + tax + shipping,
    };
  }
);

export const selectFilteredProducts = createSelector(
  [
    selectAllProducts,
    (state) => state.shop.search,
    (state) => state.shop.category,
    (state) => state.shop.sort,
  ],

  (products, search, category, sort) => {
    let filtered = products.filter((product) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      const matchesCategory =
        category === "all" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
      filtered = [...filtered].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === "high") {
      filtered = [...filtered].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sort === "rating") {
      filtered = [...filtered].sort(
        (a, b) =>
          (b.rating?.rate || 0) -
          (a.rating?.rate || 0)
      );
    }

    return filtered;
  }
);

export default shopSlice.reducer;
