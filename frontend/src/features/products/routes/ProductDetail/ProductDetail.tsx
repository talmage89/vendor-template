import clsx from "clsx";
import * as React from "react";
import { useParams } from "react-router-dom";
import {
  http,
  PrintifyProduct,
  PrintifyProductColor,
  PrintifyProductSize,
  PrintifyProductImage,
} from "~/api";
import { useCartStore, useToast } from "~/hooks";
import { formatPrice } from "~/utils/format";
import "./ProductDetail.scss";

export const ProductDetail = () => {
  const [product, setProduct] = React.useState<PrintifyProduct | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<PrintifyProductSize | null>(null);
  const [selectedColor, setSelectedColor] = React.useState<PrintifyProductColor | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<PrintifyProductImage | null>(null);
  const [quantityDisplay, setQuantityDisplay] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);

  const { id } = useParams();
  const { addToCart } = useCartStore();
  const toaster = useToast();

  React.useEffect(() => {
    if (!id) return;
    http.get(`/api/fulfillment/products/${id}/`).then((res) => {
      setProduct(res.data);
      setSelectedColor(res.data.colors[0]);
    });
  }, [id]);

  React.useEffect(() => {
    if (!imageValidForColor(selectedImage, selectedColor))
      setSelectedImage(defaultImageForColor(product, selectedColor));
  }, [product, selectedImage, selectedColor]);

  React.useEffect(() => {
    if (selectedSize && !findVariant(selectedColor, selectedSize)?.is_available)
      setSelectedSize(null);
  }, [selectedColor, selectedSize]);

  React.useEffect(() => {
    quantity > 0 ? setQuantityDisplay(quantity.toString()) : setQuantityDisplay("");
  }, [quantity]);

  const imageValidForColor = (
    image: PrintifyProductImage | null,
    color: PrintifyProductColor | null
  ) => image?.variant_ids.some((id) => color?.variant_ids.includes(id)) ?? false;

  const defaultImageForColor = (
    product: PrintifyProduct | null,
    color: PrintifyProductColor | null
  ) =>
    product?.images.find((image) => image.is_default && imageValidForColor(image, color)) ?? null;

  const findVariant = (color: PrintifyProductColor | null, size: PrintifyProductSize | null) =>
    product?.variants.find(
      (variant) => color?.variant_ids.includes(variant.id) && size?.variant_ids.includes(variant.id)
    );

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor || quantity <= 0) return;
    const variant = findVariant(selectedColor, selectedSize);
    if (
      !variant ||
      variant.options[0] !== selectedColor?.id ||
      variant.options[1] !== selectedSize?.id
    ) {
      toaster.error("Could not add to cart. Please try again.");
      return;
    }
    const cartVariant = {
      ...variant,
      images: product.images.filter((image) => image.variant_ids.includes(variant.id)),
      color: selectedColor,
      size: selectedSize,
      product_id: product.id,
    };
    addToCart(cartVariant, quantity);
    toaster.success("Added to cart!");
    setSelectedSize(null);
    setQuantity(1);
  };

  if (!product) return null;

  return (
    <div className="ProductDetail">
      <div className="ProductDetail__left">
        <div className="ProductDetail__images">
          {product.images.map((image, index) => (
            <div
              className={clsx("ProductDetail__images__image", {
                "ProductDetail__images__image--selected": image.id === selectedImage?.id,
                "ProductDetail__images__image--hidden": !imageValidForColor(image, selectedColor),
              })}
              key={index}
              onClick={() => setSelectedImage(image)}
            >
              <img src={image.thumbnail} alt={product.title} width={100} height={100} />
            </div>
          ))}
        </div>
        <div className="ProductDetail__image">
          <img src={(selectedImage || product.images[0]).large} alt={product.title} />
        </div>
      </div>
      <div className="ProductDetail__right">
        <h2 className="ProductDetail__name">{product.title}</h2>
        <h3 className="ProductDetail__price">{formatPrice(product.variants[0].price)}</h3>
        <div className="ProductDetail__colors">
          <div className="ProductDetail__colors__header">
            <h4>Color:</h4>
            <p>{selectedColor?.title}</p>
          </div>
          <div className="ProductDetail__colors__list">
            {product.colors.map((color) => (
              <div
                key={color.id}
                className={clsx("ProductDetail__colors__color", {
                  "ProductDetail__colors__color--selected": color.id === selectedColor?.id,
                })}
                onClick={() => setSelectedColor(color)}
              >
                <div
                  className="ProductDetail__colors__color__hex"
                  style={{ backgroundColor: color.colors[0] || "#000000" }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="ProductDetail__sizes">
          <h4>Size:</h4>
          <div className="ProductDetail__sizes__list">
            {product.sizes.map((size) => (
              <div
                key={size.id}
                className={clsx("ProductDetail__sizes__size", {
                  "ProductDetail__sizes__size--unavailable": !findVariant(selectedColor, size)
                    ?.is_available,
                  "ProductDetail__sizes__size--selected": size.id === selectedSize?.id,
                })}
                onClick={() =>
                  findVariant(selectedColor, size)?.is_available && setSelectedSize(size)
                }
              >
                {size.title}
              </div>
            ))}
          </div>
        </div>
        <div className="ProductDetail__add">
          <div className="ProductDetail__add__quantity">
            <h4 className="ProductDetail__info__header">Qty:</h4>
            <select>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <button
            className="ProductDetail__add__button"
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedColor || quantity <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
