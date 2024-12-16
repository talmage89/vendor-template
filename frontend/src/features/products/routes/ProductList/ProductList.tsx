import * as React from "react";
import { useNavigate } from "react-router-dom";
import { http, PrintifyProduct } from "~/api";
import { useToast } from "~/hooks";
import "./ProductList.scss";
import { Spinner } from "~/components";

export const ProductList = () => {
  const navigate = useNavigate();
  const toaster = useToast();

  const [printifyProducts, setPrintifyProducts] = React.useState<PrintifyProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    http
      .get("/api/fulfillment/products/")
      .then((res) => setPrintifyProducts(res.data.data))
      .catch(() => toaster.error("Failed to load products. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  function renderProductCard(product: PrintifyProduct) {
    return (
      <div
        key={product.id}
        className="ProductList__card"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <h4>{product.title}</h4>
        <div className="ProductList__card__image">
          <img src={product.images[0]?.medium} alt={product.title} width={300} height={300} />
        </div>
        <div className="ProductList__card__images">
          {product.images
            .filter((image) => image.is_default)
            .map((image, index) => (
              <img key={index} src={image.thumbnail} alt={product.title} width={100} height={100} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ProductList">
      {isLoading ? (
        <div className="ProductList__loading">
          <Spinner />
        </div>
      ) : (
        <div className="ProductList__container">
          {printifyProducts.map((item) => renderProductCard(item))}
        </div>
      )}
    </div>
  );
};
