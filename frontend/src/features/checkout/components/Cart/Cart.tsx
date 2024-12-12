import { useNavigate } from "react-router-dom";
import { useCartStore } from "~/hooks";
import { formatPrice } from "~/utils/format";
import "./Cart.scss";

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, changeQuantity, getTotalCents } = useCartStore();

  return (
    <div className="Cart">
      <div className="Cart__content">
        {cart.length === 0 ? (
          <p className="Cart__empty">Your cart is empty.</p>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="Cart__item">
              <img
                src={item.clothing.images[0]?.image}
                alt={item.clothing.name}
                className="Cart__item__image"
                onClick={() => {
                  navigate(`/art/${item.clothing.id}`);
                }}
              />
              <div className="Cart__item__details">
                <h3
                  onClick={() => {
                    navigate(`/products/${item.clothing.id}`);
                  }}
                >
                  {item.clothing.name} - {item.size.name} - {item.color.name}
                </h3>
                <span className="Cart__item__details__info">
                  <p className="Cart__item__details__price">
                    {formatPrice(item.clothing.final_price_cents)}
                  </p>
                  <div className="Cart__item__details__quantity">
                    <button onClick={() => changeQuantity(item.clothing.id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQuantity(item.clothing.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <a
                    className="Cart__item__details__remove"
                    onClick={() => removeFromCart(item.clothing.id, item.size.id, item.color.id)}
                  >
                    Remove
                  </a>
                </span>
              </div>
              <div className="Cart__item__total">
                <p>{formatPrice(item.clothing.final_price_cents * item.quantity)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="Cart__footer">
        <span className="Cart__footer__subtotal">
          <p className="Cart__footer__subtotal__label">Subtotal:</p>
          <p className="Cart__footer__subtotal__amount">{formatPrice(getTotalCents())}</p>
        </span>
        <button
          className="Cart__footer__checkout"
          disabled={cart.length === 0}
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};
