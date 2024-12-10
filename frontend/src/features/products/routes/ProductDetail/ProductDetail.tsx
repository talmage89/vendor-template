import * as React from "react";
import { useParams } from "react-router-dom";
import { Clothing, ClothingModel } from "~/api";
import { formatPrice } from "~/utils/format";
import "./ProductDetail.scss";
import { useCartStore } from "~/hooks";

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Clothing | null>(null);

  const { cart, addToCart, isInCart } = useCartStore();

  React.useEffect(() => {
    if (!id) return;
    ClothingModel.get(id).then((product) => setProduct(product.data));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (isInCart(product.id)) return;
    addToCart(product);
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
          <div key={color.id}>{color.name}</div>
        ))}
      </div>
      <div className="ProductDetail__sizes">
        <h3>Sizes</h3>
        {product.available_sizes.map((size) => (
          <div key={size.id}>{size.name}</div>
        ))}
      </div>
      <button onClick={handleAddToCart} disabled={isInCart(product.id)}>
        {isInCart(product.id) ? "Added to Cart!" : "Add to Cart"}
      </button>
    </div>
  );
};
