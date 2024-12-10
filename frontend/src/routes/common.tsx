import { About } from "~/features/about";
import { Checkout } from "~/features/checkout";
import { ProductDetail, ProductList } from "~/features/products";

export const commonRoutes = [
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/cart",
    element: <Checkout />,
  },
  {
    path: "/products",
    element: <ProductList />,
  },
  {
    path: "/products/:id",
    element: <ProductDetail />,
  },
];
