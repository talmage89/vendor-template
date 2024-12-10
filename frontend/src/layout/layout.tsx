import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Clothing, ClothingModel } from "~/api";
import { Navbar } from "~/components";
import { CartItem, useCartStore } from "~/hooks";
import "~/index.scss";
import "./layout.scss";

export const Layout = () => {
  const initialLoadRef = React.useRef(true);
  const location = useLocation();

  const { cart, setCart } = useCartStore();

  React.useEffect(() => {
    if (initialLoadRef.current) {
      const cartJSON = localStorage.getItem("cart");
      const cart = cartJSON ? JSON.parse(cartJSON) : [];
      Promise.allSettled(
        cart.map((item: CartItem) =>
          ClothingModel.get(item.clothing.id).then((clothing) => clothing.data)
        )
      ).then((clothing) => {
        const filteredClothing = clothing
          .filter(
            (promise): promise is PromiseFulfilledResult<Clothing> =>
              promise.status === "fulfilled" && promise.value.is_active
          )
          .map((promise) => promise.value);
        setCart(
          cart.filter(
            (item: CartItem) =>
              item.quantity > 0 &&
              item.clothing.available_sizes.find((s) => s.id === item.size.id) &&
              item.clothing.colors.find((c) => c.id === item.color.id) &&
              filteredClothing.find((clothing) => clothing.id === item.clothing.id)
          )
        );
      });
      initialLoadRef.current = false;
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="Layout">
      <Navbar />
      <div className="Layout__content">
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
};
