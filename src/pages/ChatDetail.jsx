// src/pages/ChatDetail.jsx

import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px;
  border-bottom: 1px solid #ddd;

  .product-info {
    flex: 1;

    .product-name {
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 10px;
`;

const ReviewButton = styled.button`
  padding: 6px 10px;
  font-size: 12px;
  color: white;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  margin-bottom: 60px;
  display: flex;
  flex-direction: column;
`;

const MessageInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid #ddd;
  background-color: white;
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 393px;

  input {
    flex: 1;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 8px;
  }

  button {
    padding: 8px 12px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  margin: 8px 0;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 16px;
  color: black;
  background-color: ${(props) =>
    props.sender === "me" ? "#d0e8ff" : "#d9f7d9"}; /* 연한 파랑, 초록 */
  align-self: ${(props) => (props.sender === "me" ? "flex-end" : "flex-start")};
  text-align: ${(props) => (props.sender === "me" ? "right" : "left")};
  word-wrap: break-word;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChatDetail = () => {
  const { id: roomId } = useParams();
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${apiUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
      },
      onConnect: () => {
        console.log("WebSocket connected");
        setLoading(false);
        stompClient.subscribe(`/ws/sub/chats/messages/${roomId}`, (message) => {
          if (message.body) {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prev) => [
              ...prev,
              {
                sender: receivedMessage.senderId === userInfo.id ? "me" : "other",
                text: receivedMessage.content,
              },
            ]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame);
        alert("WebSocket 연결에 실패했습니다.");
        navigate("/chat");
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [roomId, userInfo, navigate]);

  const sendMessage = () => {
    if (client && input.trim()) {
      try {
        client.publish({
          destination: "/ws/pub/chats/messages",
          body: JSON.stringify({ roomId, senderId: userInfo.id, content: input }),
        });
        setInput("");
      } catch (error) {
        console.error("메시지 전송 에러:", error);
        alert("메시지 전송에 실패했습니다.");
      }
    }
  };

  return (
    <Container>
      <Header>채팅방</Header>
      {loading ? (
        <Loading>Loading...</Loading>
      ) : (
        <>
          <ChatContent>
            {messages.map((msg, index) => (
              <MessageBubble key={index} sender={msg.sender}>
                {msg.text}
              </MessageBubble>
            ))}
          </ChatContent>
          <MessageInputContainer>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
            />
            <button onClick={sendMessage}>전송</button>
          </MessageInputContainer>
        </>
      )}
      <Footer />
    </Container>
  );
};

export default ChatDetail;