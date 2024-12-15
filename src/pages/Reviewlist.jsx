import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import axios from "axios";
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

  .image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
  }
`;

// 별점 문자열을 숫자로 변환하는 함수
const convertRatingToStars = (rating) => {
  const ratingMap = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  const starsCount = ratingMap[rating.toLowerCase()] || 0;
  return "⭐".repeat(starsCount);
};

const ReviewList = () => {
  const { userInfo, reviews, setReviews } = useContext(UserContext);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
        const token = userInfo?.jwtToken?.accessToken;

        const response = await axios.get(`${apiUrl}/api/v1/reviews/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setReviews(response.data.data.reviews);
        }
      } catch (error) {
        console.error("리뷰 데이터 페칭 에러:", error);
      }
    };

    fetchReviews();
  }, [setReviews, userInfo]);

  return (
    <Container>
      <Header title="내 리뷰" />
      <Content>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard key={review.id || index}>
              <div className="title">리뷰 대상: {review.revieweeName}</div>
              <img
                className="image"
                src={review.productImageUrls?.[0] || "/default-image.png"}
                alt="상품 이미지"
              />
              <div className="rating">
                별점: {convertRatingToStars(review.reviewScore)}
              </div>
              <div className="content">{review.reviewContent}</div>
              <div className="date">작성일: {new Date(review.createdAt).toLocaleDateString()}</div>
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
