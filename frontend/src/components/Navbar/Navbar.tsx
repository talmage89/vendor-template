import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, User, X, LogOut } from "lucide-react";
import { Popover } from "~/components";
import { useAuthStore, useCartStore } from "~/hooks";
import "./Navbar.scss";

const navlinks = [
  {
    label: "About",
    to: "/about",
  },
  {
    label: "Products",
    to: "/products",
  },
];

export const Navbar = () => {
  const { cart } = useCartStore();
  const { user, logout } = useAuthStore();

  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 720px)");
    const handleResize = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMenuOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  function renderAvatar() {
    if (user) {
      return (
        <Popover
          trigger={
            <div className="Navbar__avatar">
              <User />
            </div>
          }
        >
          <div className="Navbar__avatar__menu">
            <button onClick={() => logout()}>
              <p>Log out</p>
              <LogOut />
            </button>
          </div>
        </Popover>
      );
    }

    return null;
  }

  return (
    <div className="Navbar__container">
      <div className="Navbar">
        <h1 className="Navbar__title">Vendor Frontend</h1>
        <div className="Navbar__links">
          {navlinks.map((link) => (
            <NavLink to={link.to} key={link.label}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/cart">Cart{cart.length > 0 && ` (${cart.length})`}</NavLink>
          {renderAvatar()}
        </div>
        <button className="Navbar__menu" onClick={() => setMenuOpen((p) => !p)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <MenuModal isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

type MenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MenuModal = ({ isOpen, onClose }: MenuModalProps) => {
  const { cart } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="Navbar__modal-overlay" onClick={onClose} />
      <div className="Navbar__modal">
        <div className="Navbar__modal__content">
          {navlinks.map((link) => (
            <NavLink to={link.to} key={link.label} onClick={onClose}>
              {link.label}
            </NavLink>
          ))}
          <button
            className="Navbar__modal__content__cart"
            onClick={() => {
              onClose();
              navigate("/cart");
            }}
          >
            My Cart - {cart.length} item{cart.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </>
  );
};
