import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
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
  const { productId } = useParams();
  const navigate = useNavigate();
  const { userInfo, ongoingProducts, fetchUserProfile } = useContext(UserContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [product, setProduct] = useState(null);

  // 상품 정보 가져오기
  useEffect(() => {
    const selectedProduct = ongoingProducts.find((item) => item.id === parseInt(productId));
    setProduct(selectedProduct);
  }, [productId, ongoingProducts]);

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      alert("별점과 후기를 모두 입력해주세요.");
      return;
    }

    const reviewData = {
      reviewScore: ratingToEnum(rating),
      reviewContent: comment.trim(),
    };

    console.log("Sending review data:", reviewData);

    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
      const token = userInfo?.jwtToken?.accessToken;

      const response = await axios.post(`${apiUrl}/api/v1/reviews/${productId}`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert("리뷰 작성이 완료되었습니다!");
        await fetchUserProfile(); // 사용자 프로필 정보 새로고침
        navigate("/mypage");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        alert(`리뷰 작성 중 오류가 발생했습니다: ${error.response.data.message || error.message}`);
      } else {
        console.error("Error:", error.message);
        alert("리뷰 작성 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  // rating을 reviewScore enum으로 변환
  const ratingToEnum = (rating) => {
    const mapping = {
      1: "ONE",
      2: "TWO",
      3: "THREE",
      4: "FOUR",
      5: "FIVE",
    };
    return mapping[rating];
  };

  return (
    <Container>
      <Header>리뷰 작성</Header>
      <ReviewHeader>
        <ProductImage src={product?.image || "/default-image.png"} alt="상품 이미지" />
        <div className="product-info">
          <div className="product-name">{product?.productName || "상품명"}</div>
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
