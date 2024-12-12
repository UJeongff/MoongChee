// src/axiosInstance.js

import axios from 'axios';
import { UserContext } from "/src/contexts/UserContext.jsx";
import React, { useContext } from 'react';

// 커스텀 훅으로 Axios 인스턴스 생성
export const useAxios = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://43.203.202.100:8080/api/v1', // 환경 변수 사용
    headers: {
      Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터: 매 요청마다 Access Token을 헤더에 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers['Authorization'] = `Bearer ${userInfo.jwtToken.accessToken}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터: 401 에러 발생 시 Refresh Token을 사용하여 Access Token 갱신
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Access Token이 만료되었을 때
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Refresh Token을 사용하여 새로운 Access Token 요청
          const refreshResponse = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh`, {
            refreshToken: userInfo.jwtToken.refreshToken,
          });

          if (refreshResponse.status === 200) {
            const newAccessToken = refreshResponse.data.accessToken;

            // 사용자 정보 업데이트
            setUserInfo((prev) => ({
              ...prev,
              jwtToken: {
                ...prev.jwtToken,
                accessToken: newAccessToken,
              },
            }));

            // 새로운 Access Token으로 원래 요청 재시도
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Refresh Token 만료 또는 오류 발생:', refreshError);

          // Refresh Token도 만료된 경우 세션 종료
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
          });

          // 로그인 페이지로 리디렉션
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
