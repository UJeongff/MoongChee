import React, { useState, useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";

import axios from "axios"; // axios import 추가

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 393px;
  height: 100vh;
  margin: 0 auto;
  background-color: white;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
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
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    font-weight: bold;
    color: #555;
    margin-bottom: 8px;
  }

  input,
  select {
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  border: 1px solid #ddd;
`;

const AgreementSection = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;

  input[type="checkbox"] {
    margin-right: 8px;
  }

  label {
    font-size: 14px;
    color: #555;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-left: 8px;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => (props.disabled ? "#ccc" : "#007bff")};
  border: none;
  border-radius: 5px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  margin-top: 20px;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#ccc" : "#0056b3")};
  }
`;

const InitialInfo = () => {
  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    birthDate: "",
    department: "",
    studentId: "",
  });

  const [errors, setErrors] = useState({});
  const [agreement, setAgreement] = useState(false);

  // 파일 객체 저장
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);  // 파일을 선택하지 않으면 selectedFile을 null로 설정
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedFile)
      newErrors.profileImage = "학생증 이미지를 업로드해주세요.";
    if (!form.email.trim()) newErrors.email = "이메일을 입력해주세요.";
    if (!form.phone.trim()) newErrors.phone = "핸드폰 번호를 입력해주세요.";
    if (!form.birthDate.trim())
      newErrors.birthDate = "생년월일을 선택해주세요.";
    if (!form.department.trim()) newErrors.department = "학과를 입력해주세요.";
    if (!form.studentId.trim()) newErrors.studentId = "학번을 입력해주세요.";
    if (!agreement) newErrors.agreement = "동의해야 저장이 가능합니다.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          console.error("Access token이 없습니다. 로그인 후 다시 시도하세요.");
          navigate("/login");
          return;
        }

        // FormData 생성
        const formData = new FormData();

        // 'request' 필드에 JSON 문자열 추가
        const jsonPayload = {
          phoneNumber: form.phone,
          birthday: form.birthDate,
          studentNumber: form.studentId,
          department: form.department,
        };
        formData.append("request", JSON.stringify(jsonPayload));

        // 'profileImage' 필드에 파일 추가
        if (selectedFile) {
          formData.append("profileImage", selectedFile);
        } else {
          console.error("프로필 이미지 파일이 없습니다.");
          return;
        }

        // 백엔드에 PATCH 요청
        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/users/init`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // 'Content-Type'은 axios가 자동으로 설정하므로 명시하지 않습니다.
            },
            // withCredentials는 JWT를 사용하는 경우 필요하지 않을 수 있습니다.
          }
        );

        if (response.status === 200) {
          const data = response.data;
          console.log("Initialization Response Data:", data);

          // 백엔드 응답 구조에 맞게 데이터 추출
          // Swagger에 따르면 'data'는 문자열이지만, 실제 구현에서는 사용자 정보일 가능성이 큽니다.
          const userData = data.data;
          console.log("Extracted User Data:", userData);

          // 사용자 정보를 Context에 저장
          setUserInfo(userData);

          // 새로 받은 accessToken과 refreshToken 저장 (백엔드가 이를 반환하는지 확인)
          if (data.jwtToken) {
            localStorage.setItem("accessToken", data.jwtToken.accessToken);
            localStorage.setItem("refreshToken", data.jwtToken.refreshToken);
          }

          // 메인 페이지로 이동
          navigate("/");
        }
      } catch (error) {
        console.error("정보 저장 오류:", error);
        if (error.response) {
          console.error("에러 응답 데이터:", error.response.data);
        }
        navigate("/login");
      }
    }
  };

  return (
    <Container>
      <Header>초기 정보 입력</Header>
      <Content>
        <InputGroup>
        <div>
          <label>학생증 사진을 첨부하세요</label>
          {selectedFile ? (
            <span>선택된 파일: {selectedFile.name}</span>
          ) : (
            <span>학생증 사진이 선택되지 않았습니다.</span>
          )}
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {errors.profileImage && <div className="error">{errors.profileImage}</div>}
        </div>
        </InputGroup>
        <InputGroup>
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </InputGroup>
        <InputGroup>
          <label>핸드폰</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <div className="error">{errors.phone}</div>}
        </InputGroup>
        <InputGroup>
          <label>생년월일</label>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
          />
          {errors.birthDate && <div className="error">{errors.birthDate}</div>}
        </InputGroup>
        <InputGroup>
          <label>학과</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
          >
            <option value="">학과를 선택해주세요</option>
            <option value="SW">소프트웨어전공</option>
            <option value="AI">인공지능전공</option>
            <option value="COMPUTER_SCIENCE">컴퓨터공학과</option>
            <option value="INDUSTRIAL_ENGINEERING">산업공학과</option>
            <option value="VISUAL_DESIGN">시각디자인학과</option>
            <option value="BUSINESS">경영학과</option>
            <option value="ECONOMICS">경제학과</option>
          </select>
          {errors.department && (
            <div className="error">{errors.department}</div>
          )}
        </InputGroup>

        <InputGroup>
          <label>학번</label>
          <input
            type="text"
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
          />
          {errors.studentId && <div className="error">{errors.studentId}</div>}
        </InputGroup>
        <AgreementSection>
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => {
              setAgreement(e.target.checked);
              setErrors({ ...errors, agreement: "" });
            }}
          />
          <label>
            사기 행각 발각 시 거래 품목 원가의 10배에 해당하는 벌금을 지불할
            것에 동의합니다
          </label>
        </AgreementSection>
        {errors.agreement && <div className="error">{errors.agreement}</div>}
        <SaveButton onClick={handleSave} disabled={!agreement}>
          저장
        </SaveButton>
      </Content>
    </Container>
  );
};

export default InitialInfo;
