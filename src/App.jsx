
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchProducts,
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
  selectAllProducts,
  selectProductById,
  selectFilteredProducts,
  selectCartCount,
  selectCartItems,
  selectCartTotals,
} from "./shopSlice";

const money = (value) =>
  `$${Number(value || 0).toFixed(2)}`;

function Navbar() {
  const count = useSelector(selectCartCount);
  const user = useSelector((state) => state.shop.user);
  const dispatch = useDispatch();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        LUXE<span>STORE.</span>
      </Link>

      <nav>
        <Link to="/">Shop</Link>
        <Link to="/orders">Orders</Link>

        <Link to="/cart" className="cart-nav">
          Bag <b>{count}</b>
        </Link>

        {user ? (
          <button
            className="nav-button"
            onClick={() => dispatch(logout())}
          >
            Logout
          </button>
        ) : (
          <Link className="nav-button" to="/login">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <article className="product-card">
      <Link
        className="product-image"
        to={`/product/${product.id}`}
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
        />
      </Link>

      <div className="product-copy">
        <p className="category-label">
          {product.category}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="product-name"
        >
          {product.title}
        </Link>

        <div className="product-meta">
          <strong>{money(product.price)}</strong>
          <span>★ {product.rating?.rate ?? "—"}</span>
        </div>

        <button
          className="add-button"
          onClick={() => dispatch(addToCart(product))}
        >
          Add to bag <span>＋</span>
        </button>
      </div>
    </article>
  );
}

function Home() {
  const dispatch = useDispatch();

  const products = useSelector(selectFilteredProducts);
  const allProducts = useSelector(selectAllProducts);

  const { status, error, search, category, sort } =
    useSelector((state) => state.shop);

  const categories = [
    "all",
    ...new Set(allProducts.map((item) => item.category)),
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            THE ART OF EVERYDAY LIVING
          </p>

          <h1>
            Find pieces
            <br />
            that feel like <em>you.</em>
          </h1>

          <p className="hero-description">
            A considered collection of everyday essentials,
            selected to bring a little more beauty to your routine.
          </p>

          <a className="hero-cta" href="#collection">
            Explore the collection <span>↗</span>
          </a>
        </div>

        <div className="hero-art">
          <div className="art-circle"></div>

          <div className="art-card">
            <span>THE</span>
            <strong>EDIT</strong>
            <small>NO. 01 / 2026</small>
          </div>

          <span className="art-caption">
            CURATED WITH INTENTION
          </span>
        </div>
      </section>

      <main className="collection section-wrap" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              A LITTLE SOMETHING SPECIAL
            </p>
            <h2>Shop the collection</h2>
          </div>

          <span className="result-count">
            {allProducts.length} pieces to discover
          </span>
        </div>

        <div className="filters">
          <input
            type="search"
            placeholder="Search the collection..."
            value={search}
            onChange={(event) =>
              dispatch(setSearch(event.target.value))
            }
          />

          <select
            value={category}
            onChange={(event) =>
              dispatch(setCategory(event.target.value))
            }
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All categories" : item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) =>
              dispatch(setSort(event.target.value))
            }
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        {status === "loading" && (
          <div className="state-message">
            <span className="spinner"></span>
            <h3>Finding your favourites...</h3>
            <p>Please wait a moment.</p>
          </div>
        )}

        {status === "failed" && (
          <div className="state-message error-state">
            <h3>We couldn't load the collection.</h3>
            <p>{error}</p>

            <button
              className="dark-button"
              onClick={() => dispatch(fetchProducts())}
            >
              Try again
            </button>
          </div>
        )}

        {status === "succeeded" && products.length === 0 && (
          <div className="state-message">
            <h3>No pieces found</h3>
            <p>Try a different search or category.</p>
          </div>
        )}

        {status === "succeeded" && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function ProductDetails() {
  const { id } = useParams();

  const product = useSelector((state) =>
    selectProductById(state, Number(id))
  );

  const status = useSelector(
    (state) => state.shop.status
  );

  const dispatch = useDispatch();

  if (status === "loading" || status === "idle") {
    return (
      <div className="state-message">
        <span className="spinner"></span>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="state-message">
        <h2>Product not found</h2>
        <Link to="/" className="text-link">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <main className="detail-layout section-wrap">
      <div className="detail-image">
        <img src={product.image} alt={product.title} />
      </div>

      <div className="detail-copy">
        <p className="eyebrow">{product.category}</p>

        <h1>{product.title}</h1>

        <p className="rating">
          ★ {product.rating?.rate ?? "—"}
          <span>
            ({product.rating?.count ?? 0} reviews)
          </span>
        </p>

        <h2>{money(product.price)}</h2>

        <p className="description">
          {product.description}
        </p>

        <button
          className="dark-button"
          onClick={() => dispatch(addToCart(product))}
        >
          Add to bag
        </button>

        <p className="delivery-note">
          Thoughtfully packed · Secure checkout
        </p>
      </div>
    </main>
  );
}

function OrderSummary({ totals }) {
  return (
    <aside className="summary-card">
      <h2>Order summary</h2>

      <div>
        <span>Subtotal</span>
        <strong>{money(totals.subtotal)}</strong>
      </div>

      <div>
        <span>Discount</span>
        <strong className="discount">
          −{money(totals.discount)}
        </strong>
      </div>

      <div>
        <span>Tax (5%)</span>
        <strong>{money(totals.tax)}</strong>
      </div>

      <div>
        <span>Shipping</span>
        <strong>{money(totals.shipping)}</strong>
      </div>

      <div className="summary-total">
        <span>Total</span>
        <strong>{money(totals.total)}</strong>
      </div>

      <Link
        className="dark-button full-button"
        to="/checkout"
      >
        Continue to checkout
      </Link>

      <p className="secure-note">
        Secure checkout · Demo payment flow
      </p>
    </aside>
  );
}

function Cart() {
  const dispatch = useDispatch();

  const cart = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);

  return (
    <main className="section-wrap page-content">
      <p className="eyebrow">YOUR SELECTED PIECES</p>
      <h1 className="page-title">Shopping bag</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <h2>Your bag is taking a little break.</h2>
          <p>
            There is plenty to discover in our collection.
          </p>
          <Link className="dark-button" to="/">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.title} />

                <div className="cart-item-info">
                  <p className="category-label">
                    {item.category}
                  </p>

                  <h3>{item.title}</h3>

                  <strong>{money(item.price)}</strong>

                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                    >
                      ＋
                    </button>
                  </div>

                  <button
                    className="remove-link"
                    onClick={() =>
                      dispatch(removeFromCart(item.id))
                    }
                  >
                    Remove
                  </button>
                </div>

                <strong className="line-total">
                  {money(item.price * item.quantity)}
                </strong>
              </article>
            ))}

            <button
              className="remove-link clear-cart"
              onClick={() => dispatch(clearCart())}
            >
              Clear bag
            </button>
          </div>

          <OrderSummary totals={totals} />
        </div>
      )}
    </main>
  );
}

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    dispatch(login({ email: email.trim() }));
    navigate("/checkout");
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">WELCOME TO LUXE STORE</p>

        <h1>Sign in</h1>

        <p>
          Enter your email to continue to your checkout.
        </p>

        <label htmlFor="email">Email address</label>

        <input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />

        <button
          className="dark-button full-button"
          type="submit"
        >
          Continue
        </button>

        <small>
          Demo authentication for this academic assignment.
          No real account is used.
        </small>
      </form>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const user = useSelector(
    (state) => state.shop.user
  );

  return user ? children : <Navigate to="/login" replace />;
}

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const user = useSelector((state) => state.shop.user);

  const [address, setAddress] = useState("");

  function handleOrder(event) {
    event.preventDefault();

    if (!cart.length) {
      window.alert("Your shopping bag is empty.");
      navigate("/cart");
      return;
    }

    dispatch(
      placeOrder({
        id: Date.now(),
        date: new Date().toLocaleString(),
        email: user.email,
        address: address.trim(),
        items: cart.map((item) => ({ ...item })),
        total: totals.total,
        status: "Confirmed",
      })
    );

    dispatch(clearCart());
    navigate("/orders");
  }

  return (
    <main className="auth-wrap">
      <form
        className="auth-card checkout-card"
        onSubmit={handleOrder}
      >
        <p className="eyebrow">ALMOST YOURS</p>

        <h1>Checkout</h1>

        <p>Signed in as {user.email}</p>

        <label htmlFor="address">
          Delivery address
        </label>

        <textarea
          id="address"
          required
          rows="4"
          placeholder="Enter your complete delivery address"
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
        />

        <div className="checkout-total">
          <span>Amount due</span>
          <strong>{money(totals.total)}</strong>
        </div>

        <button
          className="dark-button full-button"
          type="submit"
        >
          Place demo order
        </button>

        <small>
          This assignment simulates checkout.
          No real payment is collected.
        </small>
      </form>
    </main>
  );
}

function Orders() {
  const orders = useSelector(
    (state) => state.shop.orders
  );

  return (
    <main className="section-wrap page-content">
      <p className="eyebrow">
        A RECORD OF THE GOOD FINDS
      </p>

      <h1 className="page-title">Your orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders just yet.</h2>
          <p>Your future favourites will appear here.</p>

          <Link className="dark-button" to="/">
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <p className="category-label">
                  ORDER #{order.id}
                </p>

                <h3>{order.date}</h3>
                <p>{order.email}</p>

                <span className="status-pill">
                  {order.status}
                </span>
              </div>

              <div className="order-total">
                <strong>{money(order.total)}</strong>
                <span>
                  {order.items.length} product type(s)
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function App() {
  const dispatch = useDispatch();

  const status = useSelector(
    (state) => state.shop.status
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  return (
    <div className="app-shell">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route path="/orders" element={<Orders />} />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      <footer className="footer">
        <Link to="/" className="brand">
          LUXE<span>STORE.</span>
        </Link>

        <p>
          Considered pieces for everyday living.
        </p>

        <small>
          © 2026 Luxe Store · Academic demo project
        </small>
      </footer>
    </div>
  );
}
