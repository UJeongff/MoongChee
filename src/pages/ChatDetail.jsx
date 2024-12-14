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
  const { id } = useParams(); // roomId
  const navigate = useNavigate();
  const { chatData, setChatData, userInfo } = useContext(UserContext);
  const [input, setInput] = useState("");
  const [client, setClient] = useState(null);

  // 콘솔 로그 추가
  console.log("ChatDetail id:", id);
  console.log("currentChat:", chatData[id]);

  const currentChat = chatData[id];

  useEffect(() => {
    if (!currentChat || !id) {
      console.log("Invalid chat data or id. Navigating to /chat.");
      navigate("/chat");
      return;
    }

    // STOMP 클라이언트 설정
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://43.203.202.100:8080/ws"),
      connectHeaders: {
        Authorization: `Bearer ${userInfo.jwtToken.accessToken}`,
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");

      // 채팅방 구독
      stompClient.subscribe(`/ws/sub/chats/messages/${id}`, (message) => {
        if (message.body) {
          const receivedMessage = JSON.parse(message.body);
          setChatData((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              messages: [
                ...prev[id].messages,
                {
                  sender: receivedMessage.senderId === userInfo.id ? "me" : "other",
                  text: receivedMessage.content,
                  time: receivedMessage.createdAt,
                },
              ],
            },
          }));
        }
      });

      console.log("Subscribed to /ws/sub/chats/messages/", id);
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    stompClient.activate();
    setClient(stompClient);

    // Cleanup on unmount
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [id, currentChat, navigate, setChatData, userInfo.jwtToken.accessToken, userInfo.id]);

  const sendMessage = () => {
    if (input.trim() && client && client.connected) {
      const message = {
        roomId: parseInt(id),
        senderId: userInfo.id,
        senderName: userInfo.name,
        content: input.trim(),
      };

      client.publish({
        destination: "/ws/pub/chats/messages",
        body: JSON.stringify(message),
      });

      // 메시지를 로컬 상태에 추가
      setChatData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          messages: [
            ...prev[id].messages,
            { sender: "me", text: input.trim(), time: new Date().toISOString() },
          ],
        },
      }));
      setInput("");
    }
  };

  if (!currentChat) {
    return <div>채팅 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <Container>
      <Header>채팅 상대: {currentChat.product?.user?.name || "사용자"}</Header>
      <ChatHeader>
        <ProductImage
          src={currentChat.product?.image || "/default-image.png"}
          alt={currentChat.product?.productName}
        />
        <div className="product-info">
          <div className="product-name">
            {currentChat.product?.productName}
            <ReviewButton
              onClick={() =>
                navigate("/review", {
                  state: {
                    productId: currentChat.product?.id, 
                    productName: currentChat.product?.productName,
                    productImage: currentChat.product?.image,
                  },
                })
              }
            >
              후기쓰기
            </ReviewButton>
          </div>
        </div>
      </ChatHeader>
      <ChatContent>
        {currentChat.messages.map((msg, index) => (
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
