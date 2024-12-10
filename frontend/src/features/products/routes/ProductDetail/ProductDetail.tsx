import * as React from "react";
import { useParams } from "react-router-dom";
import { Clothing, ClothingModel, ProductColor, ProductSize } from "~/api";
import { useCartStore, useToast } from "~/hooks";
import { formatPrice } from "~/utils/format";
import "./ProductDetail.scss";
import clsx from "clsx";

export const ProductDetail = () => {
  const [product, setProduct] = React.useState<Clothing | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<ProductSize | null>(null);
  const [selectedColor, setSelectedColor] = React.useState<ProductColor | null>(null);
  const [quantityDisplay, setQuantityDisplay] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);

  const { id } = useParams();
  const { addToCart } = useCartStore();
  const toaster = useToast();

  React.useEffect(() => {
    if (!id) return;
    ClothingModel.get(id).then((product) => setProduct(product.data));
  }, [id]);

  React.useEffect(() => {
    if (quantity > 0) {
      setQuantityDisplay(quantity.toString());
    } else {
      setQuantityDisplay("");
    }
  }, [quantity]);

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    toaster.success("Added to cart!");

    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
  };

  if (!product) return null;

  return (
    <div className="ProductDetail">
      <div className="ProductDetail__image">
        <img src={product.images[0].image} alt={product.name} />
      </div>
      <div className="ProductDetail__images">
        {product.images.map((image) => (
          <div className="ProductDetail__images__image" key={image.id}>
            <img src={image.image} alt={product.name} />
          </div>
        ))}
      </div>
      <h2 className="ProductDetail__name">{product.name}</h2>
      <h3 className="ProductDetail__price">{formatPrice(product.final_price_cents)}</h3>
      <div className="ProductDetail__colors">
        <h3>Colors</h3>
        {product.colors.map((color) => (
          <div
            key={color.id}
            className={clsx("ProductDetail__colors__color", {
              "ProductDetail__colors__color--selected": color.id === selectedColor?.id,
            })}
            onClick={() => setSelectedColor(color)}
          >
            {color.name}
          </div>
        ))}
      </div>
      <div className="ProductDetail__sizes">
        <h3>Sizes</h3>
        {product.available_sizes.map((size) => (
          <div
            key={size.id}
            className={clsx("ProductDetail__sizes__size", {
              "ProductDetail__sizes__size--selected": size.id === selectedSize?.id,
            })}
            onClick={() => setSelectedSize(size)}
          >
            {size.name}
          </div>
        ))}
      </div>
      <div className="ProductDetail__quantity">
        <h3>Quantity</h3>
        <div className="ProductDetail__quantity__input">
          <button onClick={() => setQuantity(Math.max(0, quantity - 1))}>-</button>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1"
            max="999"
            pattern="[0-9]*"
            value={quantityDisplay}
            onKeyDown={(e) => {
              e.key === "-" && e.preventDefault();
            }}
            onChange={(e) => {
              if (e.target.value === "") {
                setQuantityDisplay("");
                setQuantity(0);
                return;
              }
              const value = Number(e.target.value);
              const clampedValue = Math.max(0, Math.min(999, Math.floor(value)));
              setQuantity(clampedValue);
            }}
          />
          <button onClick={() => setQuantity(Math.min(999, quantity + 1))}>+</button>
        </div>
      </div>
      <button onClick={handleAddToCart} disabled={!selectedSize || !selectedColor || quantity <= 0}>
        Add to Cart
      </button>
    </div>
  );
};
