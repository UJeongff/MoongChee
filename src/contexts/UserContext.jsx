// src/contexts/UserContext.js

import React, { createContext, useState, useEffect, useReducer, useRef } from "react";
import axios from "axios";

// UserContext 생성
export const UserContext = createContext();

// UserProvider 컴포넌트 생성
export const UserProvider = ({ children }) => {
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
        };
  });

  // 상품 관련 상태 초기화
  const [ongoingProducts, setOngoingProducts] = useState(() => {
    const saved = localStorage.getItem("ongoingProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const [closedProducts, setClosedProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("closedProducts")) || [];
  });

  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem("reviews");
    return savedReviews ? JSON.parse(savedReviews) : [];
  });

  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("favoriteProducts")) || [];
  });

  const [chatData, setChatData] = useState(() => {
    return JSON.parse(localStorage.getItem("chatData")) || {};
  });

  // 리듀서 및 참조 초기화
  const [data, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "CREATE":
        return [action.data, ...state];
      default:
        return state;
    }
  }, []);

  const idRef = useRef(
    Math.max(
      ...ongoingProducts.map((product) => product.id),
      ...closedProducts.map((product) => product.id),
      0
    ) + 1
  );

  // 로그인 상태 확인
  const isLoggedIn = !!userInfo.email || !!userInfo.jwtToken?.accessToken;

  // 상품 데이터를 백엔드에서 가져오는 함수
  // UserContext.jsx에서 fetchProducts 함수 수정
const fetchProducts = async () => {
  if (!userInfo || !userInfo.jwtToken?.accessToken) {
    console.warn("사용자 정보 또는 액세스 토큰이 없습니다.");
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080/api/v1";

    const response = await axios.get(`${apiUrl}/api/v1/posts`, {
      headers: {
        Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
      },
    });

    if (response.status === 200) {
      console.log("백엔드 응답 데이터:", response.data);
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
      console.log("매핑된 상품 데이터:", products);
      setOngoingProducts(products);
    }
  } catch (error) {
    console.error("상품 데이터 페칭 에러:", error);
  }
};


  // 사용자 정보 변경 시 상품 데이터 페칭
  useEffect(() => {
    fetchProducts();
  }, [userInfo]);

  // 사용자 정보 및 기타 상태를 로컬스토리지에 저장
  useEffect(() => {
    console.log("UserProvider - userInfo:", userInfo);
    console.log("UserProvider - isLoggedIn:", isLoggedIn);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }, [userInfo, isLoggedIn]);

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

  // 새로운 상품을 생성하는 함수
  const onCreate = (
    image,
    productName,
    category,
    content,
    possibleDate,
    price,
    type
  ) => {
    const newProduct = {
      id: idRef.current++,
      image,
      productName,
      category,
      content,
      possibleDate,
      price,
      type,
      date: new Date().toLocaleDateString("ko-KR"),
      status: "ACTIVE", // 상품 상태를 기본값으로 '거래가능'으로 설정
      userId: userInfo?.id,
    };
  
    setOngoingProducts((prev) => [newProduct, ...prev]);
    dispatch({ type: "CREATE", data: newProduct });
  };  

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
        fetchProducts, // fetchProducts 함수 제공
        onCreate, // onCreate 함수 제공
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
