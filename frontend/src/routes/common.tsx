import { About } from "~/features/about";
import { Checkout } from "~/features/checkout";

export const commonRoutes = [
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/cart",
    element: <Checkout />,
  },
];
