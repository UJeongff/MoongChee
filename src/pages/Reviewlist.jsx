import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: center; /* 가로 방향 중앙 정렬 */
  position: relative; /* 자식 요소를 상대적 위치로 배치 */
  width: 100%;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .back-icon {
    position: absolute; /* 왼쪽에 고정 */
    left: 16px;
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }

  h1 {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0;
    text-align: center;
  }
`;

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
  display: flex;
  align-items: flex-start;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 12px;
  gap: 12px;

  .image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .review-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
  }

  .rating {
    font-size: 14px;
    color: #555;
    margin-bottom: 4px;
  }

  .content {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
    flex: 1;
  }

  .date {
    font-size: 12px;
    color: #777;
  }
`;

const NoReviews = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  color: #888;
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
  const navigate = useNavigate(); // navigate 훅 사용

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "https://43.203.202.100.nip.io";
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
      <StyledHeader>
        <div className="back-icon" onClick={() => navigate(-1)}>
          ←
        </div>
        <h1>내 리뷰</h1>
      </StyledHeader>
      <Content>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard key={review.id || index}>
              <img
                className="image"
                src={review.productImageUrls?.[0] || "/default-image.png"}
                alt="상품 이미지"
              />
              <div className="review-content">
                <div className="rating">{convertRatingToStars(review.reviewScore)}</div>
                <div className="content">{review.reviewContent}</div>
                <div className="date">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
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
