// src/pages/Main.jsx

import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext"; // 올바른 경로로 수정
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Footer from "../components/Footer";
import { useAxios } from "../axiosInstance"; // Axios 인스턴스 임포트
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: white;
  overflow-y: auto; /* 스크롤 가능 */
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 393px;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 16px;

  h1 {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .search-icon {
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer; /* 클릭 가능한 UI로 변경 */
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  flex: 1;
  text-align: center; /* 중앙 정렬 */
  margin-left: 10px;

  .title-row {
    display: flex;
    justify-content: center; /* 중앙 배치 */
    align-items: center; /* 세로 정렬 */
    gap: 8px; /* 상품명과 대여/판매 정보 간격 */
  }

  .product-name {
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap; /* 한 줄 유지 */
    overflow: hidden;
    text-overflow: ellipsis; /* 말줄임 표시 */
  }

  .type {
    font-size: 12px;
    font-weight: bold;
  }

  .type.RENTAL {
    color: red; /* 대여는 빨간색 */
  }

  .type.SALE {
    color: blue; /* 판매는 파란색 */
  }

  p {
    font-size: 12px;
    color: #555;
  }
`;

const RegisterButton = styled.button`
  position: fixed;
  bottom: 70px; /* Footer 위로 이동 */
  left: 50%; /* 중앙 정렬 */
  transform: translateX(-50%);
  width: 80%;
  max-width: 393px;
  height: 50px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;

const Main = () => {
  const { ongoingProducts, setOngoingProducts } = useContext(UserContext);
  const navigate = useNavigate();
  const axiosInstance = useAxios(); // Axios 인스턴스 사용

  useEffect(() => {
    const getProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
    
        const response = await axiosInstance.get(`${apiUrl}/api/v1/posts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
    
        if (response.status === 200 && Array.isArray(response.data.data)) {
          setOngoingProducts(response.data.data);
        } else {
          console.error("응답 데이터가 배열이 아닙니다:", response.data);
        }
        
      } catch (error) {
        console.error("상품 데이터 페칭 에러:", error);
      }
    };
    

    getProducts();
  }, [setOngoingProducts]);

  useEffect(() => {
    console.log("ongoingProducts:", ongoingProducts); // 디버깅 로그
  }, [ongoingProducts]);

  return (
    <Container>
      <Header>
        <h1>가천대학교 뭉치서비스</h1>
        <FaSearch
          className="search-icon"
          onClick={() => navigate("/search")} // /search로 이동
        />
      </Header>
      <ItemList>
        {ongoingProducts.length === 0 ? (
          <p>등록된 상품이 없습니다. 상품을 등록해보세요!</p>
        ) : (
          ongoingProducts.map((product) => (
            <ItemCard
              key={product.postId} // 'postId'를 키로 사용
              onClick={() => navigate(`/product/${product.postId}`)}
            >
              <ItemImage
                src={product.productImageUrls || "/default-image.png"}
                alt={product.productName || "상품 이미지"}
              />

              <ItemDetails>
                <div className="title-row">
                  <span className="product-name">{product.name}</span>
                  <span className={`type ${product.tradeType}`}>
                    {product.tradeType === "SALE" ? "판매" : "대여"}
                  </span>
                </div>
                <p>금액 : {product.price}원</p>
                <p>{new Date(product.createdAt).toLocaleDateString()}</p>
              </ItemDetails>
            </ItemCard>
          ))
          
        )}
      </ItemList>
      <RegisterButton onClick={() => navigate("/register")}>
        + 상품 등록
      </RegisterButton>
      <Footer />
    </Container>
  );
};

export default Main;
