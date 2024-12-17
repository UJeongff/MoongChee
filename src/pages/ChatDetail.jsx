import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios"; // axios 임포트 추가

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
    props.sender === "me" ? "#d0e8ff" : "#d9f7d9"};
  align-self: ${(props) => (props.sender === "me" ? "flex-end" : "flex-start")};
  text-align: ${(props) => (props.sender === "me" ? "right" : "left")};
  word-wrap: break-word;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #007bff;
`;

const ChatDetail = () => {
  const { roomId } = useParams();
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false); // 재연결 상태 추적
  const [page, setPage] = useState(0); // 페이지 번호 상태
  const [size] = useState(20); // 페이지 당 메시지 수 (이 예시에서는 20개)

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    if (!roomId) {
      console.log("roomId is missing, redirecting to chat list...");
      navigate("/chat");
      return;
    }

    // 서버에서 채팅 메시지 불러오기
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/chats/chatting/${roomId}/${page}/${size}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
            },
          }
        );
        if (response.data) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    // WebSocket 연결 설정
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("https://43.203.202.100.nip.io/ws"),
      connectHeaders: {
        Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log("WebSocket connected:", frame);
        setLoading(false);

        const subscriptionPath = `/sub/chats/${roomId}`;
        console.log("Subscribing to:", subscriptionPath);

        stompClient.subscribe(subscriptionPath, (message) => {
          console.log("Received message:", message.body);
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
        setLoading(false);
        setReconnecting(true);
        alert("WebSocket 연결에 실패했습니다.");
        setTimeout(() => {
          stompClient.activate();
        }, 5000);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      console.log("WebSocket connection deactivating...");
      stompClient.deactivate();
    };
  }, [roomId, userInfo, navigate, page, size]);

  const sendMessage = () => {
    if (!client || !client.connected) {
      alert("WebSocket에 연결되지 않았습니다.");
      return;
    }

    if (input.trim()) {
      try {
        const messagePayload = {
          roomId,  // 채팅방 ID
          senderId: userInfo.id,  // 사용자 ID
          senderName: userInfo.name || "Anonymous",  // 사용자 이름
          content: input.trim(),  // 메시지 내용
        };
        console.log("Sending message:", messagePayload);

        client.publish({
          destination: "/pub/chats/messages",
          body: JSON.stringify(messagePayload),
        });
        setInput(""); // 메시지 전송 후 입력창 초기화
      } catch (error) {
        console.error("메시지 전송 에러:", error);
        alert("메시지 전송에 실패했습니다.");
      }
    } else {
      alert("메시지를 입력하세요.");
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>전송</button>
          </MessageInputContainer>
        </>
      )}
      {reconnecting && <Loading>Reconnecting...</Loading>}
      <Footer />
    </Container>
  );
};

export default ChatDetail;