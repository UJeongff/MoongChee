import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer"; 

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
    margin-left: 135px;
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
  margin-left: 10px;
  flex: 1;

  span {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  p {
    font-size: 14px;
    color: #777;
    margin-top: 8px;
  }
`;

const NoDataMessage = styled.div`
  font-size: 16px;
  color: #777;
  margin-top: 50px;
  text-align: center;
`;

const Closed = () => {
  const { closedProducts, setClosedProducts, userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  // 종료된 거래 데이터 불러오기
  useEffect(() => {
    const fetchClosedProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "https://43.203.202.100.nip.io";
        const token = userInfo?.jwtToken?.accessToken;
  
        const response = await axios.get(`${apiUrl}/api/v1/profile/my-closed-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.status === 200) {
          const products = response.data.data.map((item) => ({
            id: item.postId,
            productName: item.name,
            image: item.productImageUrls?.[0] || "/default-image.png",
            price: item.price || item.rentalPrice || item.salePrice, // 가격 필드 확인 및 설정
            date: item.createdAt,
          }));
  
          setClosedProducts(products);
        }
      } catch (error) {
        console.error("종료된 거래 데이터 불러오기 실패:", error);
      }
    };
  
    fetchClosedProducts();
  }, [setClosedProducts, userInfo]);
  

  return (
    <Container>
      <Header>
        <div className="back-icon" onClick={() => navigate("/mypage")}>
          ←
        </div>
        <h1>종료된 거래</h1>
      </Header>

      <ListContainer>
        {closedProducts.length > 0 ? (
          closedProducts
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((product) => (
              <ItemCard key={product.id}>
                <ItemDate>{new Date(product.date).toLocaleDateString()}</ItemDate>
                <ItemImage src={product.image} alt={product.productName} />
                <ItemDetails>
                  <span>{product.productName}</span>
                  <p>{product.price}원</p>
                </ItemDetails>
                <TransactionStatus>거래종료</TransactionStatus>
              </ItemCard>
            ))
        ) : (
          <NoDataMessage>종료된 거래가 없습니다.</NoDataMessage>
        )}
      </ListContainer>
      <Footer />
    </Container>
  );
};

export default Closed;
