import React, { useContext, useEffect, useState } from "react";
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
  const { userInfo } = useContext(UserContext);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyLikePosts = async () => {
      try {
        const apiUrl = "https://43.203.202.100.nip.io/api/v1"; // 올바른 API 경로
        const response = await axios.get(`${apiUrl}/profile/my-like-posts`, {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`, // 토큰 추가
          },
        });

        if (response.status === 200) {
          setFavoriteProducts(response.data.data); // 관심 게시물 데이터 설정
        }
      } catch (error) {
        console.error("관심 게시물 조회 에러:", error);
      }
    };

    fetchMyLikePosts();
  }, [userInfo]);

  const removeFavorite = async (productId) => {
    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "https://43.203.202.100.nip.io";
  
      console.log("Deleting favorite product with ID:", productId);
      console.log("Request URL:", `${apiUrl}/api/v1/posts/like/${productId}`);
  
      // 관심 해제 요청
      await axios.delete(`${apiUrl}/api/v1/posts/like/${productId}`, {
        headers: {
          Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
        },
      });
  
      // 성공적으로 삭제 후 상태 업데이트
      alert("관심 등록이 성공적으로 취소되었습니다.");
      const updatedFavorites = favoriteProducts.filter((item) => item.postId !== productId);
      setFavoriteProducts(updatedFavorites);
      localStorage.setItem("favoriteProducts", JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("관심 상품 제거 실패:", error.response?.data || error.message);
      alert("관심 상품 제거에 실패했습니다.");
    }
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
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // 날짜 순 정렬
            .map((product) => (
              <ItemCard key={product.postId}>
                <ItemDate>{product.date}</ItemDate>
                <ItemImage
                  src={product.productImageUrls[0] || "/default-image.png"}
                  alt={product.name}
                />
                <ItemDetails>
                  <span>{product.name}</span>
                  <p>{product.price}원</p>
                </ItemDetails>
                <HeartIcon onClick={() => removeFavorite(product.postId)} />
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