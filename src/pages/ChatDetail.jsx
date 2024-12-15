// src/pages/ChatDetail.jsx

import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

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
  const { id: productId } = useParams(); // 상품 ID
  const navigate = useNavigate();
  const { userInfo, setChatData } = useContext(UserContext);
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState(null);

  // 채팅방 확인 및 생성 함수
  const checkOrCreateChatRoom = async () => {
    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
      const sellerId = 1; // 예제에서는 고정된 값, 실제로는 상품 정보에서 가져와야 함
      const buyerId = userInfo.id;

      // 채팅방 존재 확인
      const checkResponse = await axios.get(`${apiUrl}/api/v1/chatRooms/${sellerId}/${buyerId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
        },
      });

      if (checkResponse.data.data && checkResponse.data.data.roomId !== -1) {
        setRoomId(checkResponse.data.data.roomId);
        connectToWebSocket(checkResponse.data.data.roomId);
      } else {
        // 채팅방 생성
        const createResponse = await axios.post(
          `${apiUrl}/api/v1/chatRooms/${sellerId}/${buyerId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
            },
          }
        );
        setRoomId(createResponse.data.data.roomId);
        connectToWebSocket(createResponse.data.data.roomId);
      }
    } catch (error) {
      console.error("채팅방 확인/생성 에러:", error.response?.data || error.message);
      alert("채팅방 확인 또는 생성 중 오류가 발생했습니다.");
      navigate("/chat");
    }
  };

  const fetchChatHistory = async (roomId, page = 0, size = 20) => {
    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://43.203.202.100:8080";
  
      const response = await axios.get(`${apiUrl}/api/v1/chats/chatting/${roomId}/${page}/${size}`, {
        headers: {
          Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
        },
      });
  
      if (response.status === 200) {
        const chatMessages = response.data.data.chatMessageList;
        setMessages(chatMessages);
      } else {
        alert("채팅 내역을 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("채팅 내역 조회 에러:", error.response?.data || error.message);
      alert("채팅 내역을 불러오는 중 오류가 발생했습니다.");
    }
  };
  

  // WebSocket 연결 함수
  const connectToWebSocket = (roomId) => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://43.203.202.100:8080/ws"),
      connectHeaders: {
        Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");

      // 채팅방 구독
      stompClient.subscribe(`/ws/sub/chats/messages/${roomId}`, (message) => {
        if (message.body) {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [
            ...prev,
            {
              sender: receivedMessage.senderId === userInfo.id ? "me" : "other",
              text: receivedMessage.content,
              time: receivedMessage.createdAt,
            },
          ]);
        }
      });

      console.log("Subscribed to /ws/sub/chats/messages/", roomId);
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    stompClient.activate();
    setClient(stompClient);
  };

  useEffect(() => {
    checkOrCreateChatRoom();
  }, []);

  const sendMessage = (roomId, senderId, senderName, content) => {
    if (stompClient && stompClient.connected) {
      const message = {
        roomId,
        senderId,
        senderName,
        content,
      };
      stompClient.send("/ws/pub/chats/messages", {}, JSON.stringify(message));
    }
  };
  
  useEffect(() => {
    const socket = new SockJS(`${apiUrl}/ws`);
    stompClient = Stomp.over(socket);
  
    stompClient.connect({}, () => {
      stompClient.subscribe(`/ws/sub/chats/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [newMessage, ...prev]);
      });
    });
  
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [roomId]);
  

  return (
    <Container>
      <Header>채팅방</Header>
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
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>전송</button>
      </MessageInputContainer>
      <Footer />
    </Container>
  );
};

export default ChatDetail;