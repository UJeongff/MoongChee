import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: white;
  font-family: "Arial", sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 1000;

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
  overflow-y: auto;
`;

const ProductCard = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 16px;
  cursor: pointer;

  .product-image {
    width: 80px;
    height: 80px;
    background-color: #d9d9d9;
    border-radius: 8px;
    margin-right: 16px;
    background-size: cover;
    background-position: center;
  }

  .product-details {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 상단, 중간, 하단 정렬 */
    align-items: flex-start; /* 왼쪽 정렬 */
    width: 100%; /* 남은 너비 모두 차지 */

    .product-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .product-info {
      font-size: 14px;
      color: #555;
      margin-bottom: 4px;
    }

    .product-price {
      font-size: 14px;
      color: #333;
    }
  }
`;

const NoResults = styled.div`
  text-align: center;
  margin-top: 50px;
  font-size: 16px;
  color: #888;
`;

// 카테고리 매핑 함수 추가
const mapCategoryToKeyword = (category) => {
  const categoryMap = {
    서적: "BOOK",
    생활용품: "NECESSITY",
    전자제품: "ELECTRONICS",
    의류: "CLOTH",
    잡화: "GOODS",
    기타: "OTHER",
  };
  return categoryMap[category] || null;
};

const SearchResult = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    // 로컬 스토리지에서 검색 결과와 선택된 카테고리를 가져옴
    const searchResults =
      JSON.parse(localStorage.getItem("searchResults")) || [];
    const selectedKeyword = localStorage.getItem("selectedKeyword") || "";
    const selectedCategory = localStorage.getItem("selectedCategory") || "";

    setResults(searchResults);
    setKeyword(selectedKeyword);
    setCategory(selectedCategory);
  }, []);

  const [category, setCategory] = useState("");

  // 선택된 카테고리를 기반으로 필터링
  const filteredResults = results.filter((product) => {
    const englishCategory = mapCategoryToKeyword(category);
    return englishCategory ? product.keyword === englishCategory : true;
  });

  return (
    <Container>
      <Header>
        <div className="back-button" onClick={() => navigate("/search")}>
          ←
        </div>
        <input
          type="text"
          className="search-input"
          value={keyword}
          placeholder="검색 결과"
          readOnly
        />
      </Header>
      <ProductList>
        {filteredResults.length > 0 ? (
          filteredResults.map((product) => (
            <ProductCard
              key={product.postId}
              onClick={() => navigate(`/product/${product.postId}`)}
            >
              <div
                className="product-image"
                style={{
                  backgroundImage: `url(${
                    product.productImageUrls?.[0] || "/default-image.png"
                  })`,
                }}
              />
              <div className="product-details">
                <span className="product-title">{product.name}</span>
                <span className="product-info">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
                <span className="product-price">
                  {product.price}원{" "}
                  <span
                    style={{
                      color: product.tradeType === "SALE" ? "blue" : "red",
                      marginLeft: "8px",
                    }}
                  >
                    {product.tradeType === "SALE" ? "판매" : "대여"}
                  </span>
                </span>
              </div>
            </ProductCard>
          ))
        ) : (
          <NoResults>검색 결과가 없습니다.</NoResults>
        )}
      </ProductList>
    </Container>
  );
};

export default SearchResult;
