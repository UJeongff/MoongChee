import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 393px;
  height: 852px;
  margin: 0 auto;
  padding: 0;
  background-color: white;
  font-family: "Arial", sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  position: sticky; /* 헤더를 고정 */
  top: 0; /* 스크롤 시 상단에 고정 */
  z-index: 1000; /* 다른 요소 위에 나타나도록 z-index 설정 */

  .back-button {
    font-size: 20px;
    cursor: pointer;
    color: #333;
  }

  .search-input {
    flex: 1;
    margin-left: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px;
    font-size: 14px;
    outline: none;
  }
`;

const ProductList = styled.div`
  padding: 16px;
  overflow-y: auto; /* 세로 스크롤 가능 */
`;

const ProductCard = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 16px;

  .product-image {
    width: 80px;
    height: 80px;
    background-color: #d9d9d9;
    border-radius: 8px;
    margin-right: 16px;
  }

  .product-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 왼쪽 정렬 */

    .product-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      text-align: left; /* 왼쪽 정렬 */
      width: 100%; /* 텍스트가 부모 컨테이너를 채움 */
      white-space: nowrap; /* 한 줄로 표시 */
      overflow: hidden; /* 넘치는 텍스트 숨김 */
      text-overflow: ellipsis; /* 말줄임 표시 */
    }

    .product-info {
      font-size: 14px;
      color: #555;
      margin-bottom: 4px;
      text-align: left; /* 왼쪽 정렬 */
      width: 100%; /* 텍스트가 부모 컨테이너를 채움 */
    }

    .product-price {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      text-align: left; /* 왼쪽 정렬 */
      width: 100%; /* 텍스트가 부모 컨테이너를 채움 */
    }
  }
`;

const SearchResult = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const searchResults =
      JSON.parse(localStorage.getItem("searchResults")) || [];
    setResults(searchResults);
  }, []);

  return (
    <Container>
      <Header>
        <div className="back-button" onClick={() => navigate("/search")}>
          ←
        </div>
        <input
          type="text"
          className="search-input"
          value=""
          placeholder="검색 결과"
          readOnly
        />
      </Header>
      <ProductList>
        {results.map((product) => (
          <ProductCard key={product.id}>
            <div
              className="product-image"
              style={{
                backgroundImage: `url(${product.image})`,
                backgroundSize: "cover",
              }}
            />
            <div className="product-details">
              <span className="product-title">{product.productName}</span>
              <span className="product-info">{product.date}</span>
              <span className="product-price">{product.price}원</span>
            </div>
          </ProductCard>
        ))}
      </ProductList>
    </Container>
  );
};

export default SearchResult;
