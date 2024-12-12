import React, { useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
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
  position: sticky; /* 헤더를 고정 */
  top: 0; /* 스크롤 시 상단에 고정 */
  z-index: 1000; /* 다른 요소 위에 나타나도록 z-index 설정 */

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
  overflow-y: auto; /* 세로 스크롤 가능 */
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 342px;
  height: 183px;
  background-color: white;
  align-items: center;
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
    white-space: nowrap; /* 줄바꿈 방지 */
    overflow: hidden; /* 넘치는 텍스트 숨김 */
    text-overflow: ellipsis; /* 말줄임 표시 */
  }

  p {
    font-size: 14px;
    color: #777;
    margin-top: 8px;
  }
`;

const Ongoing = () => {
  const { ongoingProducts } = useContext(UserContext);
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/edit/${id}`); // 수정 페이지로 이동
  };

  const availableProducts = ongoingProducts.filter(
    (item) => item.status === "ACTIVE"
  );

  return (
    <Container>
      <Header>
        <div className="back-icon" onClick={() => navigate("/mypage")}>
          ←
        </div>
        <h1>진행중인 거래</h1>
      </Header>

      <ListContainer>
        {availableProducts.length === 0 ? (
          <p>진행중인 거래가 없습니다.</p>
        ) : (
          availableProducts.map((item) => (
            <ItemCard key={item.id}>
              <ItemDate>{item.date}</ItemDate>
              <EditIcon onClick={() => navigate(`/edit/${item.id}`)}>✏️</EditIcon>
              <ItemImage
                src={item.image || "/default-image.png"}
                alt={item.productName}
              />
              <ItemDetails>
                <span>{item.productName}</span>
                <p>{item.price}원</p>
              </ItemDetails>
              <TransactionStatus>{item.status}</TransactionStatus>
            </ItemCard>
          ))
        )}
      </ListContainer>
    </Container>
  );
};

export default Ongoing;
