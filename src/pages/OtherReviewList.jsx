import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";
import Header from "../components/Header";
import Footer from "../components/Footer";

const BackButton = styled.span`
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 20px;
  color: #333;
  cursor: pointer;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 393px; /* 최대 가로 폭을 제한 */
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
  gap: 12px; /* 이미지와 내용 사이 간격 */

  .image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0; /* 이미지 크기 고정 */
  }

  .review-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1; /* 남은 공간을 모두 차지 */
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
    flex: 1; /* 리뷰 내용이 남은 공간을 차지 */
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

const OtherReviewList = () => {
  const { userId } = useParams();
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_REACT_APP_API_URL ||
          "http://43.203.202.100:8080";
        const token = userInfo?.jwtToken?.accessToken;

        const response = await axios.get(
          `${apiUrl}/api/v1/reviews/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setReviews(response.data.data.reviews);
        }
      } catch (error) {
        console.error("상대방 리뷰 데이터 페칭 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReviews();
    }
  }, [userId, userInfo]);

  return (
    <Container>
      <BackButton onClick={() => navigate(`/product/${userId}`)}>←</BackButton>
      <Header title="상대방 리뷰" />
      <Content>
        {loading ? (
          <p>리뷰 로딩 중...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard key={review.id || index}>
              <img
                className="image"
                src={review.productImageUrls?.[0] || "/default-image.png"}
                alt="상품 이미지"
              />
              <div className="review-content">
                <div className="rating">
                  {convertRatingToStars(review.reviewScore)}
                </div>
                <div className="content">{review.reviewContent}</div>
                <div className="date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
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

export default OtherReviewList;
