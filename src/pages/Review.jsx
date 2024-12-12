import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";

import Footer from "../components/Footer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: white;
  box-sizing: border-box;
  position: relative;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  background-color: white;
  font-weight: bold;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px;
  border-bottom: 1px solid #ddd;

  .product-info {
    flex: 1;

    .product-name {
      font-size: 16px;
      font-weight: bold;
    }
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 10px;
`;

const ReviewContent = styled.div`
  flex: 1;
  padding: 16px;
  margin-bottom: 60px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;

  button {
    font-size: 24px;
    background: none;
    border: none;
    cursor: pointer;
    color: gray;

    &.selected {
      color: yellow;
    }
  }
`;

const CommentBox = styled.textarea`
  width: 100%;
  height: 100px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  resize: none;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reviews, setReviews } = useContext(UserContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { productId, productName, productImage } = location.state || {};

  const handleSubmit = () => {
    if (!rating || !comment.trim()) {
      alert("별점과 후기를 모두 입력해주세요.");
      return;
    }

    const newReview = {
      productId, // 상품 ID 추가
      rating,
      comment,
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem("reviews", JSON.stringify(updatedReviews)); // 로컬 스토리지 저장
    navigate("/mypage");
  };

  return (
    <Container>
      <Header>리뷰 작성</Header>
      <ReviewHeader>
        <ProductImage src={productImage || "/default-image.png"} alt="상품 이미지" />
        <div className="product-info">
          <div className="product-name">{productName}</div>
        </div>
      </ReviewHeader>
      <ReviewContent>
        <h4>별점</h4>
        <StarRating>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={star <= rating ? "selected" : ""}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </StarRating>
        <CommentBox
          placeholder="후기를 입력하세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <SubmitButton onClick={handleSubmit}>작성하기</SubmitButton>
      </ReviewContent>
      <Footer />
    </Container>
  );
};

export default Review;
