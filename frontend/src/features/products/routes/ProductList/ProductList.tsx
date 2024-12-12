import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ClothingModel, http, PrintifyProduct, PrintifyProductVariant } from "~/api";
import "./ProductList.scss";

export const ProductList = () => {
  // const [clothing, setClothing] = React.useState<Clothing[]>([]);
  const [printifyProducts, setPrintifyProducts] = React.useState<PrintifyProduct[]>([]);

  const navigate = useNavigate();

  // React.useEffect(() => {
  //   ClothingModel.list().then((clothing) => setClothing(clothing.data));
  // }, []);

  React.useEffect(() => {
    http.get("/api/printify/products/").then((res) => setPrintifyProducts(res.data.data));
  }, []);

  function renderProductCard(product: PrintifyProduct) {
    return (
      <div key={product.id} className="ProductList__card">
        <h4>{product.title}</h4>
        <img src={product.images[0]?.medium} alt={product.title} width={300} height={300} />
        <div>
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
    <div className="ProductList">{printifyProducts.map((item) => renderProductCard(item))}</div>
  );
};
