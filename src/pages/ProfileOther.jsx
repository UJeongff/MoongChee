import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";

import Footer from "../components/Footer";
import Header from "../components/Header";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: white;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
`;

const InfoCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .label {
    font-size: 14px;
    font-weight: bold;
    color: #555;
    margin-bottom: 4px;
  }

  .value {
    font-size: 16px;
    color: #333;
  }
`;

const ProfileOther = () => {
  const { state } = useLocation();
  const { ongoingProducts, reviews } = useContext(UserContext);
  const navigate = useNavigate();

  const userId = state?.userId;

  if (!userId) {
    return (
      <Container>
        <Header>사용자 정보</Header>
        <Content>
          <p>사용자 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/")}>홈으로 이동</button>
        </Content>
        <Footer />
      </Container>
    );
  }

  // 해당 사용자의 제품 및 리뷰 정보
  const userProducts = ongoingProducts.filter((product) => product.userId === userId);
  const userReviews = reviews.filter((review) => review.targetUserId === userId);

  const userInfo = userProducts[0]?.user || {
    name: "홍길동",
    email: "unknown@example.com",
    department: "정보 없음",
  };

  return (
    <Container>
      <Header>사용자 정보</Header>
      <Content>
        <InfoCard>
          <div className="label">이름</div>
          <div className="value">{userInfo.name}</div>
        </InfoCard>
        <InfoCard>
          <div className="label">이메일</div>
          <div className="value">{userInfo.email}</div>
        </InfoCard>
        <InfoCard>
          <div className="label">학과</div>
          <div className="value">{userInfo.department}</div>
        </InfoCard>
        <InfoCard>
          <div className="label">등록된 상품 수</div>
          <div className="value">{userProducts.length}</div>
        </InfoCard>
        <InfoCard>
          <div className="label">리뷰 수</div>
          <div className="value">{userReviews.length}</div>
        </InfoCard>
      </Content>
      <Footer />
    </Container>
  );
};

export default ProfileOther;
