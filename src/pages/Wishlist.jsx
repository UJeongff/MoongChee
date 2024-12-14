import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { UserContext } from "../contexts/UserContext.jsx";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 393px;
  height: 852px;
  margin: 0 auto;
  background-color: white;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  width: 393px;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .back-icon {
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }

  h1 {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-left: 145px;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 16px;
  padding: 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  width: 342px;
  cursor: pointer;
`;

const ItemDate = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  color: #777;
`;

const ItemImage = styled.img`
  width: 113px;
  height: 113px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
  margin-top: 20px;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
  margin-top: 20px;
  flex: 1;

  span {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: #777;
  }
`;

const HeartIcon = styled(FaHeart)`
  position: absolute;
  top: 16px;
  right: 16px;
  color: red;
  cursor: pointer;
`;

const Wishlist = () => {
  const { favoriteProducts, setFavoriteProducts, userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  // 관심 상품 데이터를 백엔드에서 가져오는 함수
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
        const response = await axios.get(`${apiUrl}/api/v1/profile/my-like-posts`, {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
          },
        });

        if (response.status === 200) {
          const products = response.data.data.map((item) => ({
            id: item.postId,
            productName: item.name,
            image: item.productImageUrls[0] || "/default-image.png",
            date: item.date,
            price: item.price,
          }));
          setFavoriteProducts(products);
        }
      } catch (error) {
        console.error("관심 목록 데이터 불러오기 실패:", error);
      }
    };

    fetchFavorites();
  }, [setFavoriteProducts, userInfo]);

  // 하트 아이콘 클릭 시 관심 상품 제거
  const removeFavorite = (productId) => {
    const updatedFavorites = favoriteProducts.filter((item) => item.id !== productId);
    setFavoriteProducts(updatedFavorites);
    localStorage.setItem("favoriteProducts", JSON.stringify(updatedFavorites));
  };

  // 상세 페이지로 이동하는 함수
  const handleNavigateToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };


  return (
    <Container>
      <Header>
        <div className="back-icon" onClick={() => navigate("/mypage")}>
          ←
        </div>
        <h1>관심 목록</h1>
      </Header>
      <ListContainer>
        {favoriteProducts.length > 0 ? (
          favoriteProducts
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((product, index) => (
              <ItemCard key={product.id || index} onClick={() => handleNavigateToDetail(product.id)}>
                <ItemDate>{product.date}</ItemDate>
                <ItemImage src={product.image} alt={product.productName} />
                <ItemDetails>
                  <span>{product.productName}</span>
                  <p>{product.price}원</p>
                </ItemDetails>
                <HeartIcon onClick={(e) => { e.stopPropagation(); removeFavorite(product.id); }} />
              </ItemCard>
            ))
        ) : (
          <p>관심 목록이 비어 있습니다.</p>
        )}
      </ListContainer>

    </Container>
  );
};

export default Wishlist;
