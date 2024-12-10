import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Clothing, ClothingModel } from "~/api";
import { Navbar } from "~/components";
import { useCartStore } from "~/hooks";
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
        cart.map((item: Clothing) => ClothingModel.get(item.id).then((clothing) => clothing.data))
      ).then((clothing) => {
        console.log(clothing);
        const filteredClothing = clothing
          .filter(
            (promise): promise is PromiseFulfilledResult<Clothing> =>
              promise.status === "fulfilled" && promise.value.is_active
          )
          .map((promise) => promise.value);
        setCart(filteredClothing);
        console.log(filteredClothing);
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
