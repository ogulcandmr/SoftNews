import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import YoutubeSection from './components/YoutubeSection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import VideosPage from './pages/VideosPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ForumPage from './pages/ForumPage';
import ForumTopicPage from './pages/ForumTopicPage';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import ChatbotWidget from './components/ChatbotWidget';
import WeeklySummaryPage from './pages/WeeklySummaryPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GitHubCallbackPage from './pages/GitHubCallbackPage';
import { AuthProvider } from './contexts/AuthContext';

// Dummy sayfa bileşenleri
const Home = () => (
  <div style={{ padding: 24 }}>
    <h2>Ana Sayfa</h2>
    <p>Yazılım ve teknoloji dünyasından en güncel haberler burada!</p>
    <YoutubeSection />
  </div>
);

const News = () => (
  <div style={{ padding: 24 }}>
    <h2>Haberler</h2>
    <p>Burada güncel haberler listelenecek.</p>
  </div>
);

const Videos = () => (
  <div style={{ padding: 24 }}>
    <h2>Videolar</h2>
    <YoutubeSection />
  </div>
);

const Forum = () => (
  <div style={{ padding: 24 }}>
    <h2>Forum</h2>
    <p>Topluluk tartışmaları ve paylaşımlar burada olacak.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CustomNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:id" element={<ForumTopicPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegisterPage" element={<RegisterPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/summary" element={<WeeklySummaryPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
      </Routes>
      <Footer />
      <ChatbotWidget />
    </AuthProvider>
  );
}

export default App;
