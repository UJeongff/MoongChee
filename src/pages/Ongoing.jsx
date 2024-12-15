import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";
import axios from "axios";

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
    margin-left: 120px;
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
  width: 342px;
  height: 183px;
  background-color: white;
  justify-content: space-between;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 16px;
  padding: 16px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
`;

const ItemDate = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  color: #777;
`;

const EditIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 16px;
  color: #777;
  cursor: pointer;

  &:hover {
    color: #333;
  }
`;

const ItemImage = styled.img`
  width: 113px;
  height: 113px;
  border-radius: 8px;
  object-fit: cover;
  margin-top: 10px;
`;

const TransactionStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 85px;
  height: 27px;
  background-color: #d9d9d9;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 8px;
  margin-top: 10px;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  margin-left: 10px;
  flex: 1;

  span {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: 14px;
    color: #777;
    margin-top: 8px;
  }
`;

const Ongoing = () => {
  const { userInfo } = useContext(UserContext);
  const [ongoingProducts, setOngoingProducts] = useState([]);
  const navigate = useNavigate();

  // 진행 중인 거래 데이터 가져오기
  useEffect(() => {
    const fetchActivePosts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/v1/profile/my-active-posts`, {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
          },
        });
    
        if (response.status === 200) {
          const products = response.data.data.map((item) => ({
            id: item.postId,
            productName: item.name,
            image: item.productImageUrls?.[0] || "/default-image.png",
            date: item.date || item.createdAt.split("T")[0],
            price: item.rentalPrice || 0,
            status: item.postStatus,
          }));
          setOngoingProducts(products);
        }
      } catch (error) {
        console.error("진행 중인 거래 데이터 불러오기 실패:", error);
      }
    };
    

    fetchActivePosts();
  }, [userInfo]);

  const statusMappingToKorean = {
    ACTIVE: "거래가능",
    RESERVED: "거래중",
    CLOSED: "거래종료",
  };
  
  return (
    <Container>
      <Header>
        <div className="back-icon" onClick={() => navigate("/mypage")}>
          ←
        </div>
        <h1>진행중인 거래</h1>
      </Header>

      <ListContainer>
        {ongoingProducts.length === 0 ? (
          <p>진행중인 거래가 없습니다.</p>
        ) : (
          ongoingProducts.map((item) => (
            <ItemCard key={item.id}>
              <ItemDate>{item.date}</ItemDate>
              <EditIcon onClick={() => navigate(`/edit/${item.id}`)}>✏️</EditIcon>
              <ItemImage src={item.image} alt={item.productName} />
              <ItemDetails>
                <span>{item.productName}</span>
                <p>{item.price}원</p>
              </ItemDetails>
              <TransactionStatus>
                {statusMappingToKorean[item.status] || "알 수 없는 상태"}
              </TransactionStatus>
            </ItemCard>
          ))
        )}
      </ListContainer>

    </Container>
  );
};

export default Ongoing;
