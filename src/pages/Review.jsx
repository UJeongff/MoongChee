import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";
import axios from "axios";

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
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);
  const { reviews, setReviews } = useContext(UserContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { productId } = useParams();
  const [productInfo, setProductInfo] = useState({
    productName: "",
    productImage: "",
  });

  useEffect(() => {
    const fetchProductInfo = async () => {
      if (!productId) {
        console.error("productId가 undefined입니다.");
        return;
      }

      try {
        const apiUrl = "https://43.203.202.100.nip.io/api/v1";
        const response = await axios.get(`${apiUrl}/posts/${productId}`, {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const data = response.data.data;
          setProductInfo({
            productName: data.name,
            productImage: data.productImageUrls?.[0] || "/default-image.png",
          });
        }
      } catch (error) {
        console.error("상품 정보 로드 에러:", error);
        alert("상품 정보를 가져오는 중 오류가 발생했습니다.");
        navigate("/"); // 오류 발생 시 홈으로 이동
      }
    };

    fetchProductInfo();
    console.log("productId:", productId);
  }, [productId, userInfo, navigate]);

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      alert("별점과 후기를 모두 입력해주세요.");
      return;
    }

    const apiUrl = "https://43.203.202.100.nip.io/api/v1";
    const reviewScoreEnum = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];

    try {
      const formData = new FormData();
      // 서버가 requestDTO 키를 요구하므로 JSON 데이터를 문자열로 추가
      formData.append(
        "requestDTO",
        JSON.stringify({
          reviewScore: reviewScoreEnum[rating - 1],
          reviewContent: comment,
        })
      );

      const response = await axios.post(
        `${apiUrl}/reviews/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("리뷰가 성공적으로 작성되었습니다.");
        navigate("/mypage");
      }
    } catch (error) {
      console.error("리뷰 작성 에러:", error);

      if (error.response) {
        console.error("서버 응답 데이터:", error.response.data);
        alert(
          `리뷰 작성 실패: ${
            error.response.data?.message || "알 수 없는 오류입니다."
          }`
        );
      } else {
        alert("리뷰 작성 요청 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Container>
      <Header>리뷰 작성</Header>
      <ReviewHeader>
        <ProductImage
          src={productInfo.productImage || "/default-image.png"}
          alt="상품 이미지"
        />
        <div className="product-info">
          <div className="product-name">{productInfo.productName}</div>
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