import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0;
  background-color: white;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: white;
  font-weight: bold;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
`;

const UploadSection = styled.section`
  display: flex;
  align-items: center;
  margin: 16px 0;
  gap: 10px;
  width: 100%;

  .upload-box {
    width: 100px;
    height: 100px;
    border: 1px dashed #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 12px;
    color: #555;
    cursor: pointer;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;

  label {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-right: 16px;
    min-width: 80px;
  }

  input,
  textarea {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px;
    font-size: 14px;
  }

  textarea {
    resize: none;
    height: 100px;
  }
`;

const CategorySection = styled.section`
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 16px;

  h4 {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-right: 16px;
    min-width: 80px;
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  flex: 1;

  button {
    padding: 8px 12px;
    border: none;
    background-color: #d9d9d9;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    width: 80px;
    height: 30px;

    &.selected {
      background-color: #555;
      color: white;
    }
  }
`;

const StatusSection = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;

  label {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-right: 16px;
    min-width: 80px;
  }

  div {
    display: flex;
    gap: 10px;

    button {
      padding: 8px 12px;
      border: none;
      background-color: #d9d9d9;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;

      &.selected {
        background-color: #555;
        color: white;
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 16px;

  button {
    flex: 1;
    height: 40px;
    margin: 0 5px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 5px;
    border: none;
    cursor: pointer;
  }

  .cancel-btn {
    background-color: #f5f5f5;
    color: #555;
  }

  .submit-btn {
    background-color: #007bff;
    color: white;
  }
`;

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext); // 상품 ID 가져오기
  const {
    ongoingProducts,
    setOngoingProducts,
    closedProducts,
    setClosedProducts,
  } = useContext(UserContext);

  const categoryToKeywordMap = {
    서적: "BOOK",
    생활용품: "NECESSITY",
    전자제품: "ELECTRONICS",
    의류: "CLOTH",
    잡화: "GOODS",
    기타: "OTHER",
  };

  const product =
    ongoingProducts.find((item) => item.id === parseInt(id)) || {};

  const [input, setInput] = useState({
    ...product,
    status: product.status || "거래가능",
  });

  const [productImages, setProductImages] = useState([]);

  const keywordToCategoryMap = {
    BOOK: "서적",
    NECESSITY: "생활용품",
    ELECTRONICS: "전자제품",
    CLOTH: "의류",
    GOODS: "잡화",
    OTHER: "기타",
  };

  const statusMappingToKorean = {
    ACTIVE: "거래가능",
    RESERVED: "거래중",
    CLOSED: "거래종료",
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const apiUrl = "https://43.203.202.100.nip.io/api/v1";
        const response = await axios.get(`${apiUrl}/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
          },
        });

        if (response.status === 200) {
          const productData = response.data.data;
          setInput({
            productName: productData.name || "",
            content: productData.productContent || "",
            category: keywordToCategoryMap[productData.keyword] || "",
            status: statusMappingToKorean[productData.postStatus] || "거래가능",
            possibleDate: productData.date || "",
            price: productData.price || "",
            image: productData.productImageUrls?.[0] || "",
          });
        }
      } catch (error) {
        console.error("상품 상세 정보 로드 에러:", error);
        alert("상품 정보를 가져오는 중 오류가 발생했습니다.");
      }
    };

    fetchProductDetails();
  }, [id, userInfo]);

  const handleCategoryClick = (category) => {
    setInput({ ...input, category });
  };

  const handleStatusClick = (status) => {
    setInput({ ...input, status });
  };  

  const handleCancel = () => {
    navigate("/ongoing-transaction");
  };

  const handleSubmit = async () => {
    try {
      const apiUrl = "https://43.203.202.100.nip.io/api/v1";

      // 카테고리 매핑 확인
      const keyword = categoryToKeywordMap[input.category];
      if (!keyword) {
        alert("유효하지 않은 카테고리입니다.");
        return;
      }

      // 필수 값 검증
      if (
        !input.productName ||
        !input.content ||
        !input.price ||
        !input.category
      ) {
        alert("모든 필수 입력 항목을 입력해주세요.");
        return;
      }

      // LocalDateTime 형식으로 변환
      const date = input.possibleDate ? `${input.possibleDate}T00:00:00` : null;

      // FormData 생성 및 필드 추가
      const formData = new FormData();
      const statusMapping = {
        거래종료: "CLOSED",
        거래중: "RESERVED",
        거래가능: "ACTIVE",
      };
      
      const requestDTO = {
        name: input.productName,
        productContent: input.content,
        keyword,
        postStatus: statusMapping[input.status],
        date,
        price: parseInt(input.price, 10),
      };
      

      formData.append("requestDTO", JSON.stringify(requestDTO));

      // 이미지 파일 추가
      if (productImages && productImages.length > 0) {
        productImages.forEach((file) => {
          formData.append("productImages", file);
        });
      }

      // API 요청
      const response = await axios.patch(`${apiUrl}/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // 요청 성공 시 처리
      if (response.status === 200) {
        const updatedProduct = response.data.data;

        if (updatedProduct.postStatus === "CLOSED") {
          // 거래 상태가 'CLOSED'인 경우 -> 종료된 거래 페이지로 이동
          setOngoingProducts((prev) =>
            prev.filter((product) => product.postId !== parseInt(id))
          );
          setClosedProducts((prev) => [...prev, updatedProduct]);
          alert("거래가 종료되었습니다.");
          navigate("/closed-transaction");
        } else {
          // 거래 상태가 'ACTIVE' 또는 'RESERVED'인 경우 -> 진행중인 거래 목록 업데이트
          setOngoingProducts((prev) => {
            return prev.map((product) =>
              product.postId === parseInt(id) ? updatedProduct : product
            );
          });
          alert("상품이 성공적으로 수정되었습니다.");
          navigate("/ongoing-transaction");
        }
      }
    } catch (error) {
      console.error("게시물 수정 에러:", error);

      if (error.response) {
        console.error("응답 상태:", error.response.status);
        console.error("응답 데이터:", error.response.data);

        const errorMessage =
          error.response.data?.message || "게시물 수정 중 오류가 발생했습니다.";
        alert(`서버 오류 메시지: ${errorMessage}`);
      } else {
        console.error("요청 자체 에러:", error.message);
        alert("게시물 수정 요청을 처리하지 못했습니다.");
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files); // 파일 배열로 변환
    setProductImages(files); // 상태에 파일 저장
  };

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setInput({
      ...input,
      [name]: value,
    });
  };

  return (
    <Container>
      <Header>상품 수정</Header>
      <UploadSection>
        <div className="upload-box">
          <label>
            {input.image ? (
              <img src={input.image} alt="미리보기" style={{ width: "100%" }} />
            ) : (
              "사진/동영상"
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              multiple
              style={{ display: "none" }}
            />
          </label>
        </div>
      </UploadSection>

      <InputRow>
        <label>상품명</label>
        <input
          type="text"
          name="productName"
          value={input.productName || ""}
          onChange={onChangeInput}
        />
      </InputRow>
      <CategorySection>
        <h4>카테고리</h4>
        <CategoryList>
          {["서적", "생활용품", "전자제품", "의류", "잡화", "기타"].map(
            (category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={input.category === category ? "selected" : ""}
              >
                {category}
              </button>
            )
          )}
        </CategoryList>
      </CategorySection>
      <InputRow>
        <label>상세설명</label>
        <textarea
          name="content"
          value={input.content || ""}
          onChange={onChangeInput}
        />
      </InputRow>
      <StatusSection>
        <label>상태변경</label>
        <div>
          {["거래가능", "거래중", "거래종료"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusClick(status)}
              className={input.status === status ? "selected" : ""}
            >
              {status}
            </button>
          ))}
        </div>
      </StatusSection>
      <InputRow>
        <label>대여 가능 날짜</label>
        <input
          type="date"
          name="possibleDate"
          value={input.possibleDate || ""}
          onChange={onChangeInput}
        />
      </InputRow>
      <InputRow>
        <label>가격</label>
        <input
          type="text"
          name="price"
          value={input.price || ""}
          onChange={onChangeInput}
        />
      </InputRow>
      <ButtonContainer>
        <button
          className="cancel-btn"
          onClick={() => navigate("/ongoing-transaction")}
        >
          취소
        </button>
        <button className="submit-btn" onClick={handleSubmit}>
          수정
        </button>
      </ButtonContainer>
    </Container>
  );
};

export default Edit;
