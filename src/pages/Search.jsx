import React, { useState, useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 393px;
  margin: 0 auto;
  height: 100vh;
  background-color: white;
  font-family: "Arial", sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;

  .back-button {
    font-size: 20px;
    cursor: pointer;
    color: #333;
  }

  .search-container {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 10px;

    .search-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 8px;
      font-size: 14px;
      outline: none;
    }

    .search-button {
      margin-left: 8px;
      background: none;
      border: none;
      border-radius: 5px;
      padding: 8px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

const CategorySection = styled.section`
  padding: 16px;

  h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  button {
    padding: 8px 12px;
    border: none;
    background-color: #d9d9d9;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;

    &.selected {
      background-color: #555;
      color: white;
    }
  }
`;

const TypeSection = styled.section`
  padding: 16px;

  h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
`;

const TypeList = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    flex: 1;
    padding: 8px;
    border: none;
    margin-right: 10px;
    background-color: #d9d9d9;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;

    &.selected {
      background-color: #555;
      color: white;
    }
  }

  button:last-child {
    margin-right: 0;
  }
`;

const Search = () => {
  const { ongoingProducts } = useContext(UserContext);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 대여/판매 필터링 상태 추가
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    navigate("/"); // 메인 페이지로 이동
  };

  const handleSearch = () => {
    const results = ongoingProducts
      .filter(
        (product) =>
          product.status !== "거래종료" &&
          product.productName.includes(keyword) &&
          (!selectedCategory || product.category === selectedCategory) &&
          (!selectedType || product.type === selectedType) // 대여/판매 필터링 추가
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem("searchResults", JSON.stringify(results));
    navigate("/searchresult"); // 검색 결과 페이지로 이동
  };

  return (
    <Container>
      <Header>
        <div className="back-button" onClick={handleBack}>
          ←
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            🔍
          </button>
        </div>
      </Header>
      <CategorySection>
        <h4>카테고리</h4>
        <CategoryList>
          {["서적", "생활용품", "전자제품", "의류", "잡화", "기타"].map(
            (category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={selectedCategory === category ? "selected" : ""}
              >
                {category}
              </button>
            )
          )}
        </CategoryList>
      </CategorySection>
      <TypeSection>
        <h4>대여/판매</h4>
        <TypeList>
          {["대여", "판매"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              className={selectedType === type ? "selected" : ""}
            >
              {type}
            </button>
          ))}
        </TypeList>
      </TypeSection>
    </Container>
  );
};

export default Search;
