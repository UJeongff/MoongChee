import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext.jsx";
import Footer from "../components/Footer";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { Link } from "react-router-dom";

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

const ProductInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 16px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  margin-right: 20px;
`;

const ReviewButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
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
  const { roomId, productId } = useParams();  // roomId와 productId를 받아옵니다.
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!roomId) {
      navigate("/chat");
      return;
    }

    const fetchProductInfo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
            },
          }
        );
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProductInfo();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("https://43.203.202.100.nip.io/ws"),
      connectHeaders: {
        Authorization: `Bearer ${userInfo?.jwtToken?.accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: (frame) => {
        setLoading(false);

        stompClient.subscribe(`/sub/chats/${roomId}`, (message) => {
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
        navigate("/chat");
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [roomId, userInfo, navigate, productId]);

  const sendMessage = () => {
    if (!client || !client.connected) {
      alert("WebSocket에 연결되지 않았습니다.");
      return;
    }

    if (input.trim()) {
      const messagePayload = {
        roomId,
        senderId: userInfo.id,
        senderName: userInfo.name || "Anonymous",
        content: input.trim(),
      };

      client.publish({
        destination: "/pub/chats/messages",
        body: JSON.stringify(messagePayload),
      });
      setInput(""); // 메시지 전송 후 입력창 초기화
    } else {
      alert("메시지를 입력하세요.");
    }
  };

  return (
    <Container>
      <Header>채팅방</Header>

      {/* Product Information Section */}
      {product && (
        <ProductInfo>
          <ProductImage src={product.imageUrl} alt={product.name} />
          <ProductName>{product.name}</ProductName>
          <Link to={`/review/${product.id}`}>
            <ReviewButton>리뷰</ReviewButton>
          </Link>
        </ProductInfo>
      )}

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