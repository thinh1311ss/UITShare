import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "../common";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "uit_share_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "access_token" && !e.newValue) {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addToCart = useCallback(
    async (doc) => {
      if (cartItems.some((item) => item._id === doc._id)) {
        return { success: false, reason: "already_in_cart" };
      }

      try {
        const token = localStorage.getItem("access_token");
        if (token && token !== "undefined") {
          const res = await axios.get(`/api/marketplace/access/${doc._id}`);
          if (res.data?.hasAccess && res.data?.reason === "owner") {
            return { success: false, reason: "already_owned" };
          }
        }
      } catch {
        // Nếu API lỗi thì vẫn cho thêm vào giỏ, backend sẽ  lúc mua
      }

      setCartItems((prev) => [...prev, doc]);
      return { success: true };
    },
    [cartItems],
  );

  const removeFromCart = useCallback((docId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== docId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const removeMultipleFromCart = useCallback((docIds) => {
    setCartItems((prev) => prev.filter((item) => !docIds.includes(item._id)));
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        removeMultipleFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
