import React, { useContext } from "react";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";

import Header from "../components/Header";
import Footer from "../components/Footer";

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
  overflow-y: auto;
`;

const ReviewCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
  }

  .rating {
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
  }

  .content {
    font-size: 14px;
    color: #666;
  }
`;

const NoReviews = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  color: #888;
`;

const ReviewList = () => {
  const { userInfo, reviews, ongoingProducts } = useContext(UserContext);

  // 내가 등록한 상품 필터링
  const myProducts = ongoingProducts.filter(
    (product) => product.userId === userInfo?.id
  );

  // 내가 등록한 상품에 대한 리뷰 필터링
  const myReviews = reviews.filter((review) =>
    myProducts.some((product) => product.id === review.targetProductId)
  );

  return (
    <Container>
      <Header title="내 리뷰" />
      <Content>
        {myReviews.length > 0 ? (
          myReviews.map((review) => (
            <ReviewCard key={review.id}>
              <div className="title">상품: {review.productName}</div>
              <div className="rating">별점: ⭐ {review.rating}</div>
              <div className="content">{review.content}</div>
            </ReviewCard>
          ))
        ) : (
          <NoReviews>작성된 리뷰가 없습니다.</NoReviews>
        )}
      </Content>
      <Footer />
    </Container>
  );
};

export default ReviewList;
