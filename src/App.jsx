import "./App.css";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Product from "./pages/Product";
import Notfound from "./pages/Notfound";
import Mypage from "./pages/Mypage";
import Main from "./pages/Main";
import Wishlist from "./pages/Wishlist";
import Ongoing from "./pages/Ongoing";
import Closed from "./pages/Closed";
import Profile from "./pages/Profile";
import Edit from "./pages/Edit";
import Search from "./pages/Search";
import SearchResult from "./pages/SearchResult";
import Initialinfo from "./pages/Initialinfo";
import Review from "./pages/Review";
import Chat from "./pages/Chat";
import ChatDetail from "./pages/ChatDetail"; // Import 추가
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import ReviewList from "./pages/Reviewlist";
import ProfileOther from "./pages/ProfileOther";
import OtherReviewList from "./pages/OtherReviewList";

import { UserProvider, UserContext } from "./contexts/UserContext.jsx";
import { useContext } from "react";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);
  console.log("isLoggedIn:", isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/search" element={<Search />} />
        <Route path="/searchresult" element={<SearchResult />} />
        <Route path="/detail" element={<Detail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/google/callback" element={<OAuthCallback />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/initialinfo" element={<Initialinfo />} />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ongoing-transaction"
          element={
            <ProtectedRoute>
              <Ongoing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/closed-transaction"
          element={
            <ProtectedRoute>
              <Closed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <Mypage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <ChatDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:productId"
          element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewlist"
          element={
            <ProtectedRoute>
              <ReviewList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profileother/:userId"
          element={
            <ProtectedRoute>
              <ProfileOther />
            </ProtectedRoute>
          }
        />
        <Route
          path="/otherreviews/:userId"
          element={
            <ProtectedRoute>
              <OtherReviewList />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
