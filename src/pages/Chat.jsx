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
  height: 60px;
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
  font-size: 18px;
  color: #007bff;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: red;
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
  const { userInfo, isLoggedIn, setChatData } = useContext(UserContext);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchChatList = async () => {
      try {
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "https://43.203.202.100.nip.io";
        const response = await axios.get(`${apiUrl}/api/v1/chats/chattingList/${userInfo.id}`, {
          headers: { Authorization: `Bearer ${userInfo.jwtToken.accessToken}` },
        });
        setChatList(response.data.data);

        // chatData 업데이트
        const updatedChatData = {};
        response.data.data.forEach((chat) => {
          updatedChatData[chat.roomId] = {
            ...chat,
            messages: chat.latestMessageDto ? [chat.latestMessageDto] : [],
          };
        });
        setChatData(updatedChatData);
      } catch (err) {
        setError("채팅 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, [userInfo, isLoggedIn, navigate, setChatData]);

  return (
    <Container>
      <Header>채팅 목록</Header>
      <ChatListContainer>
        {loading && <Loading>로딩 중...</Loading>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!loading && !error && chatList.length === 0 && <Loading>채팅 내역이 없습니다.</Loading>}
        {!loading &&
          !error &&
          chatList.map((chat) => {
            const isUser1 = chat.user1Id === userInfo.id;
            const chatPartner = isUser1
              ? { name: chat.user2Name, profileImage: chat.user2ProfileImage }
              : { name: chat.user1Name, profileImage: chat.user1ProfileImage };

            return (
              <ChatItem
                key={chat.roomId}
                onClick={() => navigate(`/chat/${chat.roomId}`)}
              >
                <img
                  src={chatPartner.profileImage || "/default-profile.png"}
                  alt={chatPartner.name}
                  className="profile-image"
                  onError={(e) => (e.target.src = "/default-profile.png")}
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
