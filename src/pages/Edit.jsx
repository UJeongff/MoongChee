// src/components/Edit.jsx

import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useAxios } from "../axiosInstance.js";
import { UserContext } from "../contexts/UserContext.jsx";

// Styled Components (변경 없음)
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
    flex-wrap: wrap; /* 이미지가 여러 개일 경우 */
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 12px;
    color: #555;
    cursor: pointer;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
      margin-bottom: 5px;
    }
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: column; /* 에러 메시지를 아래에 표시하기 위해 변경 */
  margin-bottom: 16px;
  width: 100%;

  label {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-bottom: 8px;
  }

  input,
  textarea {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
  }

  textarea {
    resize: none;
    height: 100px;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const CategorySection = styled.section`
  display: flex;
  flex-direction: column; /* 에러 메시지를 아래에 표시하기 위해 변경 */
  width: 100%;
  margin-bottom: 16px;

  h4 {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-bottom: 8px;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;

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
  flex-direction: column; /* 에러 메시지를 아래에 표시하기 위해 변경 */
  width: 100%;
  margin-bottom: 16px;

  label {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-bottom: 8px;
  }

  div {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  button {
    flex: 1;
    padding: 8px 12px;
    border: none;
    background-color: #d9d9d9;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    height: 30px;

    &.selected {
      background-color: #555;
      color: white;
    }
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 4px;
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
    background-color: ${(props) => (props.disabled ? "#f0f0f0" : "#007bff")};
    color: ${(props) => (props.disabled ? "#888" : "white")};
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  }
`;

const categoryMapping = {
  NECESSITY: "생활용품",
  BOOK: "서적",
  ELECTRONICS: "전자제품",
  CLOTH: "의류",
  GOODS: "잡화",
  OTHER: "기타",
};

const koreanToEnglishCategory = {
  생활용품: "NECESSITY",
  서적: "BOOK",
  전자제품: "ELECTRONICS",
  의류: "CLOTH",
  잡화: "GOODS",
  기타: "OTHER",
};

const statusMapping = {
  거래가능: "ACTIVE",
  거래중: "RESERVED",
  거래종료: "CLOSED",
};

const englishToKoreanStatus = {
  ACTIVE: "거래가능",
  RESERVED: "거래중",
  CLOSED: "거래종료",
};

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ongoingProducts, userInfo } = useContext(UserContext);
  const axiosInstance = useAxios();

  // 상태 정의
  const [input, setInput] = useState({
    productName: "",
    keyword: "",
    content: "",
    date: "",
    price: "",
    image: null,
    status: "거래가능",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState([]);

  const [checklist, setChecklist] = useState({
    termsConfirmed: true, // Edit 페이지에서는 기본값을 true로 설정하거나 필요에 따라 변경
  });

  useEffect(() => {
    console.log("Ongoing Products:", ongoingProducts); // 데이터 확인
    const foundProduct = ongoingProducts.find((item) => item.id === parseInt(id));
    console.log("Found Product:", foundProduct); // 선택된 상품 확인
  
    if (foundProduct) {
      setInput({
        productName: foundProduct.productName || "",
        keyword: categoryMapping[foundProduct.keyword] || foundProduct.keyword || "",
        content: foundProduct.productContent || "",
        date: foundProduct.date ? foundProduct.date.slice(0, 10) : "",
        price: foundProduct.price || "",
        image: null,
        status: englishToKoreanStatus[foundProduct.postStatus] || "거래가능",
      });
      setExistingImageUrls(foundProduct.productImageUrls || [foundProduct.image]);
    }
  }, [id, ongoingProducts]);
  
  

  // 유효성 검사 함수
  const validate = () => {
    const newErrors = {};
    if (!input.productName) newErrors.productName = "상품명을 입력하세요.";
    if (!input.keyword) newErrors.keyword = "카테고리를 선택하세요.";
    if (!input.status) newErrors.status = "상태를 선택하세요.";
    if (!input.price) newErrors.price = "가격을 입력하세요.";
    // 추가적인 유효성 검사 필요 시 여기에 추가
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryClick = (category) => {
    setInput({ ...input, keyword: category });
  };

  const handleStatusClick = (status) => {
    setInput({ ...input, status });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInput({ ...input, image: file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!validate()) return;
      if (!checklist.termsConfirmed) {
        alert("모든 약관에 동의해야 합니다.");
        return;
      }
      setLoading(true);
  
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
  
      const formData = new FormData();
      formData.append("name", input.productName);
      formData.append("keyword", koreanToEnglishCategory[input.keyword]);
      formData.append("productContent", input.content);
      formData.append("date", `${input.date}T00:00:00.000`);
      formData.append("price", parseFloat(input.price));
      formData.append("postStatus", statusMapping[input.status]);
  
      // 이미지가 변경되었을 때만 파일 추가
      if (input.image) {
        formData.append("productImages", input.image);
      } else if (existingImageUrls.length > 0) {
        // 기존 이미지 URL을 다시 전송 (백엔드에서 URL로 처리가 가능한 경우)
        existingImageUrls.forEach((url) => formData.append("productImageUrls", url));
      }
  
      console.log("FormData Entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
  
      const response = await axiosInstance.patch(`${apiUrl}/api/v1/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        alert("상품이 성공적으로 수정되었습니다.");
        navigate("/ongoing-transaction");
      }
    } catch (error) {
      console.error("상품 수정 에러:", error);
      if (error.response) {
        console.error("서버 응답 에러:", error.response.data);
        alert(`에러 메시지: ${error.response.data.message || "상품 수정에 실패했습니다."}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <Container>
      <Header>상품 수정</Header>
      <UploadSection>
        <div className="upload-box" onClick={() => document.getElementById("fileInput").click()}>
          {input.image ? (
            <img src={URL.createObjectURL(input.image)} alt="미리보기" />
          ) : existingImageUrls.length > 0 ? (
            existingImageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`기존 이미지 ${index + 1}`}
                onError={(e) => { e.target.src = "/default-image.png"; }} // 기본 이미지로 대체
              />
            ))
          ) : (
            "사진/동영상"
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </UploadSection>

      <InputRow>
        <label>상품명</label>
        <input type="text" name="productName" value={input.productName} onChange={handleInputChange} />
        {errors.productName && <span className="error">{errors.productName}</span>}
      </InputRow>
      <CategorySection>
        <h4>카테고리</h4>
        <CategoryList>
          {["서적", "생활용품", "전자제품", "의류", "잡화", "기타"].map((keyword) => (
            <button
              key={keyword}
              onClick={() => handleCategoryClick(keyword)}
              className={input.keyword === keyword ? "selected" : ""}
            >
              {keyword}
            </button>
          ))}
        </CategoryList>
        {errors.keyword && <span className="error">{errors.keyword}</span>}
      </CategorySection>
      <InputRow>
        <label>상세설명</label>
        <textarea name="content" value={input.content} onChange={handleInputChange} />
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
        {errors.status && <span className="error">{errors.status}</span>}
      </StatusSection>
      <InputRow>
        <label>거래/반납 날짜</label>
        <input type="date" name="date" value={input.date} onChange={handleInputChange} />
      </InputRow>
      <InputRow>
        <label>판매/보증 금액</label>
        <input type="number" name="price" value={input.price} onChange={handleInputChange} />
        {errors.price && <span className="error">{errors.price}</span>}
      </InputRow>
      <ButtonContainer>
        <button className="cancel-btn" onClick={() => navigate("/ongoing-transaction")}>
          취소
        </button>
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !checklist.termsConfirmed}
          style={{
            backgroundColor: loading || !checklist.termsConfirmed ? "#f0f0f0" : "#007bff",
            color: loading || !checklist.termsConfirmed ? "#888" : "white",
            cursor: loading || !checklist.termsConfirmed ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "수정 중..." : "수정"}
        </button>
      </ButtonContainer>
    </Container>
  );
};

export default Edit;
