
import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./shopSlice";

const analyticsMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  if (typeof action.type === "string" && action.type.startsWith("shop/")) {
    if (import.meta.env.DEV) {
      console.info("Redux Action:", action.type);
    }

    if (action.type.endsWith("/fulfilled")) {
      console.info("Analytics: Async operation completed");
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    shop: shopReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(analyticsMiddleware),
});

store.subscribe(() => {
  const state = store.getState().shop;

  try {
    localStorage.setItem("luxe-cart", JSON.stringify(state.cart));
    localStorage.setItem("luxe-orders", JSON.stringify(state.orders));
    localStorage.setItem(
      "luxe-preferences",
      JSON.stringify({
        search: state.search,
        category: state.category,
        sort: state.sort,
      })
    );
    localStorage.setItem("luxe-user", JSON.stringify(state.user));
  } catch (error) {
    console.warn("Storage error:", error);
  }
});
