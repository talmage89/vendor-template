import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Clothing, ClothingModel, http } from "~/api";
import "./ProductList.scss";

export const ProductList = () => {
  const [clothing, setClothing] = React.useState<Clothing[]>([]);
  const [printifyProducts, setPrintifyProducts] = React.useState<any[]>([]);

  const navigate = useNavigate();

  // React.useEffect(() => {
  //   ClothingModel.list().then((clothing) => setClothing(clothing.data));
  // }, []);

  React.useEffect(() => {
    http.get("/api/printify/products/").then((res) => setPrintifyProducts(res.data.data));
  }, []);

  function renderProductCard(product: any) {
    return (
      <div
        key={product.id}
        className="ProductList__card"
        // onClick={() => navigate(`/products/${product.id}`)}
      >
        <h4>{product.title}</h4>
        <img src={product.images[0]?.src} alt={product.title} width={100} height={100} />
        
      </div>
    );
  }

  return <div className="ProductList">{printifyProducts.map((item) => renderProductCard(item))}</div>;
};
