// src/pages/Chat.jsx

import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";

// Styled Components 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: white;
  box-sizing: border-box;
  position: relative;
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
`;

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  padding: 20px;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;

  .profile-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
  }

  .chat-info {
    flex: 1;

    .name {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .last-message {
      color: #555;
      font-size: 14px;
    }
  }
`;

const Chat = () => {
  const navigate = useNavigate();
  const { userInfo, isLoggedIn, chatData, setChatData } = useContext(UserContext);

  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 로그인 상태 확인
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchChatList = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "https://43.203.202.100.nip.io";
        console.log(`Fetching chat list from: ${apiUrl}/api/v1/chats/chattingList/${userInfo.id}`);
    
        const response = await axios.get(`${apiUrl}/api/v1/chats/chattingList/${userInfo.id}`, {
          headers: {
            Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
          },
        });
    
        if (response.status === 200) {
          const chats = response.data.data;
          setChatList(chats);
    
          // chatData 업데이트
          const updatedChatData = {};
          chats.forEach((chat) => {
            updatedChatData[chat.roomId] = {
              ...chat,
              messages: chat.latestMessageDto ? [chat.latestMessageDto] : [],
            };
          });
          setChatData(updatedChatData);
        } else {
          setError("채팅 목록을 불러오는 데 실패했습니다.");
        }
      } catch (err) {
        console.error("채팅 목록 불러오기 에러:", err);
        setError("채팅 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, [userInfo, isLoggedIn, navigate, setChatData]);

  if (loading) {
    return (
      <Container>
        <Header>채팅 목록</Header>
        <ChatListContainer>
          <Loading>로딩 중...</Loading>
        </ChatListContainer>
        <Footer />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>채팅 목록</Header>
        <ChatListContainer>
          <ErrorMessage>{error}</ErrorMessage>
        </ChatListContainer>
        <Footer />
      </Container>
    );
  }

  if (chatList.length === 0) {
    return (
      <Container>
        <Header>채팅 목록</Header>
        <ChatListContainer>
          <Loading>채팅 내역이 없습니다.</Loading>
        </ChatListContainer>
        <Footer />
      </Container>
    );
  }

  return (
    <Container>
      <Header>채팅 목록</Header>
      <ChatListContainer>
        {chatList.map((chat) => {
          const isUser1 = chat.userlId === userInfo.id;
          const chatPartner = isUser1
            ? { name: chat.userName, profileImage: chat.user2ProfileImage }
            : { name: chat.userName, profileImage: chat.user1ProfileImage };         

          return (
            <ChatItem
              key={chat.roomId}
              onClick={() => {
                console.log("Navigating to /chat/", chat.roomId);
                navigate(`/chat/${chat.roomId}`);
              }}
            >
              <img
                src={chatPartner.profileImage || "/default-profile.png"}
                alt={chatPartner.name}
                className="profile-image"
                onError={(e) => { e.target.src = "/default-profile.png"; }}
              />
              <div className="chat-info">
                <div className="name">{chatPartner.name}</div>
                <div className="last-message">
                  {chat.latestMessageDto?.content || "메시지가 없습니다."}
                </div>
              </div>
            </ChatItem>
          );
        })}
      </ChatListContainer>
      <Footer />
    </Container>
  );
};

export default Chat;
