import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { http, PrintifyProductVariant } from "~/api";
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
          http
            .get(`/api/fulfillment/products/${item.variant.product_id}/`)
            .then((res) =>
              res.data.variants.find(
                (variant: PrintifyProductVariant) => variant.id === item.variant.id
              )
            )
        )
      ).then((variants) => {
        const filteredVariants = variants
          .filter(
            (promise): promise is PromiseFulfilledResult<PrintifyProductVariant> =>
              promise.status === "fulfilled" && promise.value.is_available
          )
          .map((promise) => promise.value);
        setCart(
          cart.filter(
            (item: CartItem) =>
              item.quantity > 0 &&
              filteredVariants.find((variant) => variant.id === item.variant.id)
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
