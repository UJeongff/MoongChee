import React from "react";
import styled from "styled-components";
import Footer from "../components/Footer";

// 환경 변수에서 clientId와 redirectUri 가져오기
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
`;

const LoginButton = styled.button`
  width: 100%;
  max-width: 280px;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Login = () => {
  const handleLogin = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&access_type=offline&prompt=consent`;
  };

  return (
    <Container>
      <Header>가천대학교 뭉치서비스</Header>
      <Content>
        <Title>로그인</Title>
        <Description>
          서비스를 이용하시려면 로그인이 필요합니다.
          <br />
          Google 계정을 사용하여 로그인해주세요.
        </Description>
        <LoginButton onClick={handleLogin}>Google로 로그인</LoginButton>
      </Content>
      <Footer />
    </Container>
  );
};

export default Login;
