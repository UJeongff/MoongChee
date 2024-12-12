import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { FaHeart } from "react-icons/fa";
import { UserContext } from "../contexts/UserContext.jsx";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 16px;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const HeartIcon = styled(FaHeart)`
  font-size: 24px;
  color: ${(props) => (props.isFavorite ? "red" : "grey")};
  cursor: pointer;
  margin-top: 16px;
`;

const DetailPage = () => {
  const { favoriteProducts, setFavoriteProducts } = useContext(UserContext);

  // 상품 데이터 목록
  const products = [
    {
      id: 1,
      image: "https://via.placeholder.com/113",
      productName: "컴퓨터공학과 과잠",
      price: 20000,
      date: "2024-07-21",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/113",
      productName: "SQLD 노트",
      price: 10000,
      date: "2024-09-16",
    },
  ];

  // 현재 선택된 상품 ID
  const [currentProduct, setCurrentProduct] = useState(products[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(
      favoriteProducts.some((item) => item.id === currentProduct.id)
    );
  }, [favoriteProducts, currentProduct]);

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavoriteProducts(
        favoriteProducts.filter((item) => item.id !== currentProduct.id)
      );
    } else {
      setFavoriteProducts([...favoriteProducts, currentProduct]);
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <Container>
      {/* 상품 선택 */}
      <select
        value={currentProduct.id}
        onChange={(e) =>
          setCurrentProduct(
            products.find((product) => product.id === Number(e.target.value))
          )
        }
      >
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.productName}
          </option>
        ))}
      </select>

      {/* 현재 상품 정보 */}
      <ProductImage
        src={currentProduct.image}
        alt={currentProduct.productName}
      />
      <ProductDetails>
        <h2>{currentProduct.productName}</h2>
        <p>{currentProduct.price}원</p>
        <p>게시일: {currentProduct.date}</p>
        <HeartIcon isFavorite={isFavorite} onClick={toggleFavorite} />
      </ProductDetails>
    </Container>
  );
};

export default DetailPage;
