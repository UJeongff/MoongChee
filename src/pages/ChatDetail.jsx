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

  useEffect(() => {
    if (!roomId) {
      console.log("roomId가 없습니다. 채팅 목록으로 이동합니다.");
      navigate("/chat");
      return;
    }

    const fetchMessages = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "https://43.203.202.100.nip.io";
        const response = await axios.get(`${apiUrl}/api/v1/chats/chatting/${roomId}/0/50`, {
          headers: {
            Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
          },
        });

        if (response.status === 200) {
          // API 응답이 최신 메시지 순서로 오므로, 이를 역순으로 변경하여 오래된 메시지가 먼저 오도록 함
          const fetchedMessages = response.data.data.reverse().map(msg => ({
            sender: msg.senderId === userInfo.id ? "me" : "other",
            text: msg.content,
            createdAt: msg.createdAt,
          }));
          setMessages(fetchedMessages);
        } else {
          console.error("채팅 내역을 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("채팅 내역 로드 에러:", error);
      }
    };

    fetchMessages();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("https://43.203.202.100.nip.io/ws"),
      connectHeaders: {
        Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log("WebSocket 연결됨:", frame);
        setLoading(false);

        const subscriptionPath = `/sub/chats/${roomId}`;
        console.log("구독 경로:", subscriptionPath);

        stompClient.subscribe(subscriptionPath, (message) => {
          console.log("수신된 메시지:", message.body);
          if (message.body) {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prev) => [
              ...prev,
              {
                sender: receivedMessage.senderId === userInfo.id ? "me" : "other",
                text: receivedMessage.content,
                createdAt: receivedMessage.createdAt,
              },
            ]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket 오류:", frame);
        alert("WebSocket 연결에 실패했습니다.");
        setLoading(false);
        navigate("/chat");
      },
      onDisconnect: () => {
        console.warn("WebSocket 연결 해제됨. 재연결을 시도합니다...");
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      console.log("WebSocket 연결 종료...");
      stompClient.deactivate();
    };
  }, [roomId, userInfo, navigate]);

  const sendMessage = () => {
    if (!client || !client.connected) {
      alert("WebSocket에 연결되지 않았습니다.");
      return;
    }

    if (input.trim()) {
      try {
        const messagePayload = {
          roomId,
          senderId: userInfo.id,
          senderName: userInfo.name || "Anonymous",
          content: input.trim(),
        };
        console.log("보내는 메시지:", messagePayload);

        client.publish({
          destination: "/pub/chats/messages",
          body: JSON.stringify(messagePayload),
        });
        setInput("");
      } catch (error) {
        console.error("메시지 전송 오류:", error);
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
      <Footer />
    </Container>
  );
};

export default ChatDetail;
