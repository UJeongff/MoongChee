import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const OAuthCallback = () => {
  console.log("OAuthCallback component loaded");
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);

  // 로그인 성공 시 호출
  const handleLogin = (userData) => {
    const updatedUserInfo = {
      id: userData.id,
      status: userData.status,
      jwtToken: {
        accessToken: userData.jwtToken?.accessToken || "",
        refreshToken: userData.jwtToken?.refreshToken || "",
      },
      name: userData.name || "",
      email: userData.email || "",
      phoneNumber: userData.phoneNumber || "",
      birthday: userData.birthday || "",
      studentNumber: userData.studentNumber || "",
      department: userData.department || "",
      profileImageUrl: userData.profileImageUrl || "",
    };

    // 사용자 정보 업데이트
    setUserInfo(updatedUserInfo);

    // 페이지 이동
    navigate("/");
  };

  const handleInit = () => {
    navigate("/initialinfo");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const handleLoginPost = async (authCode) => {
      try {
        const apiUrl =
          import.meta.env.VITE_REACT_APP_API_URL ||
          "http://43.203.202.100:8080";

        console.log("Sending request to backend with code:", authCode);

        const response = await fetch(
          `${apiUrl}/api/v1/users/login?code=${authCode}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(
            `HTTP error! Status: ${response.status}, Message: ${errorResponse.message}`
          );
        }

        const data = await response.json();
        console.log("Response Data:", data);

        const userData = data?.data;
        console.log("Extracted User Data:", userData);

        const accessToken = userData?.jwtToken?.accessToken;
        const refreshToken = userData?.jwtToken?.refreshToken;

        if (accessToken && refreshToken) {
          // 토큰을 로컬스토리지에 저장
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          console.log("Access Token and Refresh Token saved to localStorage.");

          // 사용자 정보 업데이트
          handleLogin(userData);
        } else {
          console.error("Access Token 또는 Refresh Token이 응답에 없습니다.");
          handleInit();
        }
      } catch (error) {
        console.error("Login Error:", error.message);
        handleInit();
      } finally {
        window.history.replaceState(null, "", "/oauth/google/callback");
      }
    };

    if (code) {
      console.log("Authorization Code found:", code);
      handleLoginPost(code);
    } else {
      console.error("Google authorization code not found.");
      handleInit();
    }
  }, [navigate, setUserInfo]);

  return (
    <div>
      <h2>로그인 중...</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default OAuthCallback;
