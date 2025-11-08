import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Logo from "./components/Logo";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import Matching from "./pages/Matching";
import Chat from "./pages/Chat";
import TradeHistory from "./pages/TradeHistory";
import Notifications from "./pages/Notifications";
import Promotion from "./pages/Promotion";
import Filter from "./pages/Filter";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("landing");
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo size={60} />
          <div className="mt-4 text-gray-600">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {currentPage === "landing" && <Landing onNavigate={setCurrentPage} />}
      {currentPage === "login" && <Login onNavigate={setCurrentPage} />}
      {currentPage === "home" && <Home onNavigate={setCurrentPage} />}
      {currentPage === "createPost" && <CreatePost onNavigate={setCurrentPage} />}
      {currentPage === "profile" && <Profile onNavigate={setCurrentPage} />}
      {currentPage === "matching" && <Matching onNavigate={setCurrentPage} />}
      {currentPage === "notification" && <Notifications onNavigate={setCurrentPage} />}
      {currentPage === "chat" && <Chat onNavigate={setCurrentPage} />}
      {currentPage === "history" && <TradeHistory onNavigate={setCurrentPage} />}
      {currentPage === "promotion" && <Promotion onNavigate={setCurrentPage} />}
      {currentPage === "filter" && <Filter onNavigate={setCurrentPage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
