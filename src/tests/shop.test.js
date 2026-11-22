
import { describe, it, expect, beforeEach, vi } from "vitest";

import reducer, {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setSearch,
  setCategory,
  setSort,
  login,
  logout,
  fetchProducts,
  selectCartCount,
  selectCartTotals,
  selectFilteredProducts,
} from "../src/shopSlice";

const sampleProduct = {
  id: 1,
  title: "Test product",
  description: "A useful test item",
  category: "electronics",
  price: 50,
  image: "test.jpg",
  rating: { rate: 4.5, count: 10 },
};

describe("Redux Toolkit shop slice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds an item and increments quantity", () => {
    let state = reducer(
      undefined,
      addToCart(sampleProduct)
    );

    state = reducer(
      state,
      addToCart(sampleProduct)
    );

    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].quantity).toBe(2);
  });

  it("updates and removes cart items", () => {
    let state = reducer(
      undefined,
      addToCart(sampleProduct)
    );

    state = reducer(
      state,
      updateQuantity({ id: 1, quantity: 3 })
    );

    expect(state.cart[0].quantity).toBe(3);

    state = reducer(state, removeFromCart(1));

    expect(state.cart).toHaveLength(0);
  });

  it("clears the cart", () => {
    let state = reducer(
      undefined,
      addToCart(sampleProduct)
    );

    state = reducer(state, clearCart());

    expect(state.cart).toHaveLength(0);
  });

  it("handles login and logout", () => {
    let state = reducer(
      undefined,
      login({ email: "demo@example.com" })
    );

    expect(state.user.email).toBe("demo@example.com");

    state = reducer(state, logout());

    expect(state.user).toBeNull();
  });

  it("calculates cart count and totals", () => {
    const shop = reducer(
      undefined,
      addToCart(sampleProduct)
    );

    const root = { shop };

    expect(selectCartCount(root)).toBe(1);
    expect(selectCartTotals(root).subtotal).toBe(50);
  });

  it("filters products by search text", () => {
    let shop = reducer(
      undefined,
      setSearch("test")
    );

    shop = reducer(shop, {
      type: "shop/fetchProducts/fulfilled",
      payload: [sampleProduct],
    });

    expect(
      selectFilteredProducts({ shop })
    ).toHaveLength(1);
  });

  it("stores category and sorting preferences", () => {
    let state = reducer(
      undefined,
      setCategory("electronics")
    );

    state = reducer(state, setSort("low"));

    expect(state.category).toBe("electronics");
    expect(state.sort).toBe("low");
  });

  it("handles async pending, fulfilled and rejected", () => {
    let state = reducer(undefined, {
      type: fetchProducts.pending.type,
    });

    expect(state.status).toBe("loading");

    state = reducer(state, {
      type: fetchProducts.fulfilled.type,
      payload: [sampleProduct],
    });

    expect(state.status).toBe("succeeded");
    expect(state.ids).toContain(1);

    state = reducer(state, {
      type: fetchProducts.rejected.type,
      payload: "Network error",
    });

    expect(state.status).toBe("failed");
    expect(state.error).toBe("Network error");
  });

  it("fetches products using async thunk", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [sampleProduct],
    });

    const action = await fetchProducts()(
      vi.fn(),
      () => ({}),
      undefined
    );

    expect(action.type).toBe(
      fetchProducts.fulfilled.type
    );

    expect(action.payload[0].id).toBe(1);
  });
});
