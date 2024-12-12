import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 393px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: white;
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
`;

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);

  .profile-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
  }

  .chat-info {
    flex: 1;

    .name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .last-message {
      font-size: 14px;
      color: #888;
    }
  }
`;

const Chat = () => {
  const navigate = useNavigate();
  const { chatData } = useContext(UserContext);

  

  if (!chatData || Object.keys(chatData).length === 0) {
    return (
      <Container>
        <Header>채팅 목록</Header>
        <ChatListContainer>
          <div>채팅 내역이 없습니다.</div>
        </ChatListContainer>
        <Footer />
      </Container>
    );
  }

  // 채팅 데이터를 최근 메시지 시간 순으로 정렬
  const sortedChats = Object.entries(chatData).sort(([, chatA], [, chatB]) => {
    const lastMessageTimeA = new Date(
      chatA.messages[chatA.messages.length - 1]?.time || 0
    ).getTime();
    const lastMessageTimeB = new Date(
      chatB.messages[chatB.messages.length - 1]?.time || 0
    ).getTime();
    return lastMessageTimeB - lastMessageTimeA; // 최근 시간이 먼저 오도록 내림차순 정렬
  });

  return (
    <Container>
      <Header>채팅 목록</Header>
      <ChatListContainer>
        {sortedChats.map(([id, chat]) => (
          <ChatItem key={id} onClick={() => navigate(`/chat/${id}`)}>
            <img
              src={chat.product?.image || "/default-profile.png"}
              alt={chat.product?.productName || "상품"}
              className="profile-image"
            />
            <div className="chat-info">
              <div className="name">{chat.product?.user?.name || "알 수 없음"}</div>
              <div className="last-message">
                {chat.messages[chat.messages.length - 1]?.text || "메시지가 없습니다."}
              </div>
            </div>
          </ChatItem>
        ))}
      </ChatListContainer>
      <Footer />
    </Container>
  );
};

export default Chat;
