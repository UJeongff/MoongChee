import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";

const Container = styled.div`
  margin-top: 16px;
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

  .date {
    font-size: 12px;
    color: #777;
    margin-top: 8px;
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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
        const token = userInfo?.jwtToken?.accessToken;

        const response = await axios.get(`${apiUrl}/api/v1/reviews/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
      <h3>{reviews.length > 0 ? `${reviews[0].revieweeName} 리뷰` : "상대방 리뷰"}</h3>
      {loading ? (
        <p>리뷰 로딩 중...</p>
      ) : reviews.length > 0 ? (
        reviews.map((review, index) => (
          <ReviewCard key={review.id || index}>
            <div className="rating">{convertRatingToStars(review.reviewScore)}</div>
            <div className="content">{review.reviewContent}</div>
            <div className="date">{new Date(review.createdAt).toLocaleDateString()}</div>
          </ReviewCard>
        ))
      ) : (
        <NoReviews>작성된 리뷰가 없습니다.</NoReviews>
      )}
    </Container>

  );
};

export default OtherReviewList;
