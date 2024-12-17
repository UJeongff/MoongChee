import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";
import axios from "axios";
import Footer from "../components/Footer";
import Header from "../components/Header";
import DefaultProfile from "./assets/images/DefaultProfile.png";

const BackButton = styled.span`
  font-size: 20px;
  color: #333;
  cursor: pointer;
  margin-left: 16px;
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
`;

const InfoCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .label {
    font-size: 14px;
    font-weight: bold;
    color: #555;
    margin-bottom: 4px;
  }

  .value {
    font-size: 16px;
    color: #333;
  }
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
`;

const ProfileOther = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      try {
        const apiUrl =
          import.meta.env.VITE_REACT_APP_API_URL ||
          "https://43.203.202.100.nip.io";
        const token = userInfo?.jwtToken?.accessToken;

        const response = await axios.get(
          `${apiUrl}/api/v1/profile/details/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setProfileData(response.data.data);
        }
      } catch (error) {
        console.error("프로필 데이터 페칭 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, userInfo]);

  const departmentMapping = {
    SW: "소프트웨어전공",
    AI: "인공지능전공",
    COMPUTER_SCIENCE: "컴퓨터공학과",
    INDUSTRIAL_ENGINEERING: "산업공학과",
    VISUAL_DESIGN: "시각디자인학과",
    BUSINESS: "경영학과",
    ECONOMICS: "경제학과",
  };

  if (!userId) {
    return (
      <Container>
        <Header>사용자 정보</Header>

        <Content>
          <p>사용자 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/")}>홈으로 이동</button>
        </Content>
        <Footer />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        사용자 정보
      </Header>
      <Content>
        {loading ? (
          <p>로딩 중...</p>
        ) : profileData ? (
          <>
            <ProfileImage
              src={profileData.profileImageUrl || DefaultProfile}
              alt="프로필 이미지"
            />
            <InfoCard>
              <div className="label">이름</div>
              <div className="value">{profileData.name}</div>
            </InfoCard>
            <InfoCard>
              <div className="label">이메일</div>
              <div className="value">{profileData.email}</div>
            </InfoCard>
            <InfoCard>
              <div className="label">학과</div>
              <div className="value">
                {departmentMapping[profileData.department] || "정보 없음"}
              </div>
            </InfoCard>
          </>
        ) : (
          <p>사용자 정보를 불러올 수 없습니다.</p>
        )}
      </Content>
      <Footer />
    </Container>
  );
};

export default ProfileOther;
