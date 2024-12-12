import React, { useContext } from "react"; 
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 393px;
  height: 60px;
  background-color: white;
  border-top: 1px solid #ddd;
  box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.1);

  .footer-icon {
    font-size: 24px;
    color: #888;
    cursor: pointer;

    &:hover {
      color: #333;
    }
  }
`;

const Footer = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);

  const handleNavigation = (path) => {
    if (path === "/") {
      // Main 페이지는 항상 접근 가능
      navigate(path);
      return;
    }

    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login"); // 로그인 페이지로 리다이렉트
    }
  };

  return (
    <FooterContainer>
      <div className="footer-icon" onClick={() => handleNavigation("/chat")}>
        💬
      </div>
      <div className="footer-icon" onClick={() => handleNavigation("/")}>
        🏠
      </div>
      <div className="footer-icon" onClick={() => handleNavigation("/mypage")}>
        👤
      </div>
    </FooterContainer>
  );
};

export default Footer;
