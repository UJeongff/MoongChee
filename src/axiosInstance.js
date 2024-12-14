// src/axiosInstance.js

import axios from "axios";
import React, { useContext } from "react";
import { UserContext } from "/src/contexts/UserContext.jsx";
import { useNavigate } from "react-router-dom";

// 커스텀 훅으로 Axios 인스턴스 생성
export const useAxios = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080/api/v1",
    headers: {
      Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  // 요청 인터셉터
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers["Authorization"] = `Bearer ${userInfo.jwtToken.accessToken}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post("/auth/refresh", {
            refreshToken: userInfo.jwtToken.refreshToken,
          });

          if (refreshResponse.status === 200) {
            const newAccessToken = refreshResponse.data.accessToken;

            setUserInfo((prev) => ({
              ...prev,
              jwtToken: {
                ...prev.jwtToken,
                accessToken: newAccessToken,
              },
            }));

            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh Token 만료 또는 오류 발생:", refreshError);

          setUserInfo(null);
          localStorage.removeItem("userInfo");

          navigate("/login");
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
