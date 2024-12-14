import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// UserContext 생성
export const UserContext = createContext();

// UserProvider 컴포넌트 생성
export const UserProvider = ({ children }) => {
  const navigate = useNavigate();

  // 사용자 정보 상태 초기화
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser
      ? JSON.parse(savedUser)
      : {
          id: null,
          status: "",
          jwtToken: {
            accessToken: "",
            refreshToken: "",
          },
          name: "",
          email: "",
          phoneNumber: "",
          birthday: "",
          studentNumber: "",
          department: "",
          profileImageUrl: "",
          reviewCount: 0,
          averageScore: "0.0",
        };
  });

  // 상품 관련 상태 초기화
  const [ongoingProducts, setOngoingProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("ongoingProducts")) || [];
  });

  const [closedProducts, setClosedProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("closedProducts")) || [];
  });

  const [reviews, setReviews] = useState(() => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  });

  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("favoriteProducts")) || [];
  });

  const [chatData, setChatData] = useState(() => {
    return JSON.parse(localStorage.getItem("chatData")) || {};
  });

  // 로그인 상태 확인
  const isLoggedIn = !!userInfo.email || !!userInfo.jwtToken?.accessToken;

  // 상태 초기화 함수 (세션 종료 시 사용)
  const resetUserInfo = () => {
    setUserInfo({
      id: null,
      status: "",
      jwtToken: {
        accessToken: "",
        refreshToken: "",
      },
      name: "",
      email: "",
      phoneNumber: "",
      birthday: "",
      studentNumber: "",
      department: "",
      profileImageUrl: "",
      reviewCount: 0,
      averageScore: "0.0",
    });
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // 사용자 프로필 데이터를 백엔드에서 가져오는 함수
  const fetchUserProfile = async () => {
    if (!userInfo || !userInfo.jwtToken?.accessToken) {
      console.warn("사용자 정보 또는 액세스 토큰이 없습니다.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";

      const response = await axios.get(`${apiUrl}/api/v1/profile`, {
        headers: {
          Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
        },
      });

      if (response.status === 200) {
        const { name, profileImageUrl, reviewCount, averageScore } = response.data.data;
        setUserInfo((prev) => ({
          ...prev,
          name,
          profileImageUrl,
          reviewCount,
          averageScore: averageScore.toFixed(1),
        }));
      }
    } catch (error) {
      console.error("프로필 데이터 페칭 에러:", error);

      if (error.response && error.response.status === 401) {
        resetUserInfo();
      }
    }
  };

  // 상품 데이터를 백엔드에서 가져오는 함수
  const fetchProducts = async () => {
    if (!userInfo || !userInfo.jwtToken?.accessToken) {
      console.warn("사용자 정보 또는 액세스 토큰이 없습니다.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";

      const response = await axios.get(`${apiUrl}/api/v1/posts`, {
        headers: {
          Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
        },
      });

      if (response.status === 200) {
        const products = response.data.data.map((item) => ({
          id: item.postId,
          authorName: item.authorName,
          tradeType: item.tradeType,
          productName: item.name,
          image: item.productImageUrls?.[0] || null,
          productContent: item.productContent,
          keyword: item.keyword,
          postStatus: item.postStatus,
          date: item.date,
          price: item.price,
          createdAt: item.createdAt,
        }));
        setOngoingProducts(products);
      }
    } catch (error) {
      console.error("상품 데이터 페칭 에러:", error);

      if (error.response && error.response.status === 401) {
        resetUserInfo();
      }
    }
  };

  // 사용자 정보 변경 시 프로필 및 상품 데이터 페칭
  useEffect(() => {
    fetchUserProfile();
    fetchProducts();
  }, [userInfo.jwtToken?.accessToken]);

  // 사용자 정보 및 기타 상태를 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }, [userInfo]);

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("favoriteProducts", JSON.stringify(favoriteProducts));
  }, [favoriteProducts]);

  useEffect(() => {
    localStorage.setItem("ongoingProducts", JSON.stringify(ongoingProducts));
  }, [ongoingProducts]);

  useEffect(() => {
    localStorage.setItem("closedProducts", JSON.stringify(closedProducts));
  }, [closedProducts]);

  useEffect(() => {
    localStorage.setItem("chatData", JSON.stringify(chatData));
  }, [chatData]);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        userInfo,
        setUserInfo,
        reviews,
        setReviews,
        favoriteProducts,
        setFavoriteProducts,
        ongoingProducts,
        setOngoingProducts,
        closedProducts,
        setClosedProducts,
        chatData,
        setChatData,
        fetchProducts,
        resetUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
