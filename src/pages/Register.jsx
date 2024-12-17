import React, { useState, useContext, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";
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
    position: relative;
    overflow: hidden;
  }

  input[type="file"] {
    display: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;

  label {
    font-size: 16px;
    font-weight: bold;
    color: #555;
    margin-bottom: 4px;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px;
    font-size: 14px;
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

const SelectionRow = styled.div`
  display: flex;
  gap: 10px;

  button {
    padding: 8px 12px;
    border: none;
    background-color: #d9d9d9;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    flex: 1;
    height: 40px;

    &.selected {
      background-color: #555;
      color: white;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
`;

const TermsSection = styled.section`
  margin-top: 20px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.active {
    font-weight: bold;
  }

  svg {
    transform: ${(props) => (props.$isOpen ? "rotate(90deg)" : "rotate(0)")};
    transition: transform 0.3s ease;
  }
`;

const TermsContent = styled.div`
  margin-top: 10px;
  padding-left: 20px;
  color: #555;
  font-size: 14px;
  text-align: left;
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

const categoryToKeywordMap = {
  서적: "BOOK",
  생활용품: "NECESSITY",
  전자제품: "ELECTRONICS",
  의류: "CLOTH",
  잡화: "GOODS",
  기타: "OTHER",
};

const Register = () => {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [input, setInput] = useState({
    productName: "",
    keyword: "",
    type: "",
    content: "",
    date: new Date().toISOString().slice(0, 10), // "YYYY-MM-DDTHH:MM"
    price: "",
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTerms, setActiveTerms] = useState({});
  const [checklist, setChecklist] = useState({
    termsConfirmed: false,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 유효성 검사 함수
  const validate = () => {
    const newErrors = {};
    if (!input.productName) newErrors.productName = "상품명을 입력하세요.";
    if (!input.keyword) newErrors.keyword = "카테고리를 선택하세요.";
    if (!input.type) newErrors.type = "대여 또는 판매를 선택하세요.";
    if (!input.price) newErrors.price = "가격을 입력하세요.";
    // 추가적인 유효성 검사 필요 시 여기에 추가
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력 변경 핸들러
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setInput({
      ...input,
      [name]: value,
    });
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prevPreviews) => [...prevPreviews, ...previews]);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategoryClick = (category) => {
    const keyword = categoryToKeywordMap[category];
    setSelectedCategory(category);
    setInput({ ...input, keyword });
  };

  // 타입 선택 핸들러 (대여/판매)
  const handleTypeClick = (type) => {
    setSelectedType(type);
    setInput({ ...input, type });
  };

  // 모달 제출 핸들러
  const handleRegisterConfirm = async () => {
    if (!validate()) return;
    if (!checklist.termsConfirmed) {
      alert("모든 약관에 동의해야 합니다.");
      return;
    }
    setLoading(true);

    try {
      const apiUrl = "https://43.203.202.100.nip.io"; // 실제 API URL로 변경 필요

      // FormData를 사용하여 이미지 파일과 데이터를 함께 전송
      const formData = new FormData();
      const requestDTO = {
        tradeType: input.type, // "SALE" or "RENTAL"
        name: input.productName,
        productContent: input.content,
        keyword: input.keyword, // "BOOK", "NECESSITY", etc.
        date: input.date, // "YYYY-MM-DDTHH:MM"
        price: parseFloat(input.price), // 가격을 숫자로 변환
      };
      formData.append("requestDTO", JSON.stringify(requestDTO));

      // productImages 배열에 파일 추가
      selectedFiles.forEach((file) => {
        formData.append("productImages", file);
      });

      const response = await axios.post(`${apiUrl}/api/v1/posts`, formData, {
        headers: {
          Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        alert("상품이 성공적으로 등록되었습니다.");
        navigate("/");
      } else {
        alert("상품 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("상품 등록 에러:", err);
      alert("상품 등록 중 오류가 발생했습니다.");

      // 백엔드가 반환하는 오류 메시지 확인 (추가)
      if (err.response && err.response.data && err.response.data.message) {
        alert(`오류 메시지: ${err.response.data.message}`);
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      // 미리보기 이미지 및 선택 파일 초기화
      setPreviewImages([]);
      setSelectedFiles([]);
      // 필요 시 추가적인 상태 초기화
    }
  };

  // 모달 제출 취소 핸들러
  const handleCancelRegister = () => {
    setIsModalOpen(false);
  };

  // 약관 토글 핸들러
  const toggleTermsContent = (term) => {
    setActiveTerms((prev) => ({
      ...prev,
      [term]: !prev[term],
    }));
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setChecklist((prev) => ({ ...prev, [name]: checked }));
  };

  // 등록 버튼 클릭 핸들러
  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    setIsModalOpen(true);
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    navigate("/");
  };

  return (
    <Container>
      <Header>상품 등록</Header>
      <UploadSection>
        <div
          className="upload-box"
          onClick={() => fileInputRef.current.click()}
        >
          {previewImages.length > 0
            ? previewImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`미리보기 ${index + 1}`}
                  style={{ marginRight: "5px" }}
                />
              ))
            : "사진/동영상 업로드"}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
        />
      </UploadSection>
      <InputRow>
        <label>상품명</label>
        <input
          type="text"
          name="productName"
          value={input.productName}
          onChange={onChangeInput}
        />
        {errors.productName && (
          <span className="error">{errors.productName}</span>
        )}
      </InputRow>
      <CategorySection>
        <h4>카테고리</h4>
        <CategoryList>
          {["서적", "생활용품", "전자제품", "의류", "잡화", "기타"].map(
            (category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={selectedCategory === category ? "selected" : ""}
              >
                {category}
              </button>
            )
          )}
        </CategoryList>
        {errors.keyword && <span className="error">{errors.keyword}</span>}
      </CategorySection>
      <CategorySection>
        <h4>대여/판매</h4>
        <SelectionRow>
          {["SALE", "RENTAL"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              className={selectedType === type ? "selected" : ""}
            >
              {type === "SALE" ? "판매" : "대여"}
            </button>
          ))}
        </SelectionRow>
        {errors.type && <span className="error">{errors.type}</span>}
      </CategorySection>
      <InputRow>
        <label>상세설명</label>
        <textarea
          name="content"
          value={input.content}
          onChange={onChangeInput}
        />
      </InputRow>
      <InputRow>
        <label>거래/반납 날짜</label>
        <input
          type="date"
          name="date"
          value={input.date}
          onChange={onChangeInput}
        />
      </InputRow>
      <InputRow>
        <label>판매/보증 금액</label>
        <input
          type="number"
          name="price"
          value={input.price}
          onChange={onChangeInput}
        />
        {errors.price && <span className="error">{errors.price}</span>}
      </InputRow>
      <ButtonContainer>
        <button className="cancel-btn" onClick={handleCancel}>
          취소
        </button>
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          등록
        </button>
      </ButtonContainer>

      <Modal $isOpen={isModalOpen}>
        <ModalContent>
          <h2>약관 동의</h2>
          <TermsSection>
            <ToggleButton
              $isOpen={activeTerms.term1}
              onClick={() => toggleTermsContent("term1")}
            >
              <span>1. 대여 상품 미반납 시 약관</span>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M3 0 L7 5 L3 10 Z" />
              </svg>
            </ToggleButton>
            {activeTerms.term1 && (
              <TermsContent>
                - 대여자는 반드시 반납 날짜까지 대여 상품을 반납해야 한다.
                <br />
                - 반납 날짜까지 반납하지 않을 시 보증금을 돌려받지 못하며 최대
                3일 이내 반드시 반납해야 한다.
                <br />
                - 3일 이후에도 반납하지 않을 시, 대여 상품 원가에 해당하는
                금액을 지급해야 하며 최대 5일 이내로 반드시 반납해야 한다.
                <br />- 만약 그 이후에도 반납하지 않을 시 형법 제355조에 의거,
                횡령죄로 간주하여 법적인 처벌을 받을 수 있다.
              </TermsContent>
            )}
          </TermsSection>
          <TermsSection>
            <ToggleButton
              $isOpen={activeTerms.term2}
              onClick={() => toggleTermsContent("term2")}
            >
              <span>2. 대여 시 상품 파손에 관한 약관</span>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M3 0 L7 5 L3 10 Z" />
              </svg>
            </ToggleButton>
            {activeTerms.term2 && (
              <TermsContent>
                상품 소유주는 상품 등록 시 상품의 정확한 사진을 등록하여 반납 시
                상태와 확실한 구별이 가능하게 한다. 만약 소유주의 실수로 대여
                전후 상태의 차이 확인이 불가능할 경우 소유주의 책임으로
                간주한다. 대여자는 상품 반납 시, 대여 전과 동일한 상태를
                유지해야 한다. 맨눈으로 확인할 수 있는 찍힘, 긁힘, 오염 등의
                파손의 경우 대여자는 수리비 전액을 지급해야 한다.
                <br />
                <br />
                서적의 경우 상품의 소유주는 대여자의 추가적인 필기가 가능함에
                동의한다. 단, 서적의 원본 글씨를 알아볼 수 없을 정도의 낙서가
                생겼을 경우, 해당 경우는 파손으로 간주, 대여자는 소유주에게 전공
                서적 원가의 절반에 해당하는 금액을 지불한다. 상품의 소유주는
                서적의 특성상 서적의 약간의 구겨짐, 찢어짐 등 약간의 훼손은
                불가피함에 동의한다. 단, 서적을 읽음에 있어 글씨의 정확한 확인이
                불가능할 정도의 훼손은 파손으로 간주, 대여자는 소유주에게 전공
                서적 원가의 절반에 해당하는 금액을 지불한다.
              </TermsContent>
            )}
          </TermsSection>
          <TermsSection>
            <label>
              <input
                type="checkbox"
                name="termsConfirmed"
                checked={checklist.termsConfirmed}
                onChange={handleCheckboxChange}
              />
              <span>약관을 모두 확인했습니다.</span>
            </label>
          </TermsSection>
          <ButtonContainer>
            <button className="cancel-btn" onClick={handleCancelRegister}>
              닫기
            </button>
            <button
              className="submit-btn"
              disabled={!checklist.termsConfirmed || loading}
              onClick={handleRegisterConfirm}
              style={{
                backgroundColor: checklist.termsConfirmed
                  ? "#007bff"
                  : "#f0f0f0",
                color: checklist.termsConfirmed ? "white" : "#888",
              }}
            >
              {loading ? "등록 중..." : "동의하고 등록"}
            </button>
          </ButtonContainer>
        </ModalContent>
      </Modal>
      <Footer />
    </Container>
  );
};

export default Register;
