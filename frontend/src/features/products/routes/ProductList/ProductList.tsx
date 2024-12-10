import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Clothing, ClothingModel } from "~/api";
import "./ProductList.scss";

export const ProductList = () => {
  const [clothing, setClothing] = React.useState<Clothing[]>([]);

  const navigate = useNavigate();

  React.useEffect(() => {
    ClothingModel.list().then((clothing) => setClothing(clothing.data));
  }, []);

  function renderProductCard(product: Clothing) {
    return (
      <div key={product.id} className="ProductList__card" onClick={() => navigate(`/products/${product.id}`)}>
        <div className="ProductList__card__image">
          <img src={product.images[0].image} alt={product.name} />
        </div>
        <div className="ProductList__card__name">{product.name}</div>
      </div>
    );
  }

  return (
    <div className="ProductList">
      {clothing.map((item) => renderProductCard(item))}
    </div>
  );
};
