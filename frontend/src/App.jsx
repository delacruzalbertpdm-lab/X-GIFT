import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeroTicket from './components/HeroTicket';
import WishlistView from './components/WishlistView';
import LuckyDrawView from './components/LuckyDrawView';
import AdminView from './components/AdminView';
import AuthModal from './components/AuthModal';
import HamsterQuizModal from './components/HamsterQuizModal';
import { api, getAuthToken, removeAuthToken } from './api';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('wishlist'); // 'wishlist' | 'draw' | 'admin_participants' | 'admin_questions'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [drawStatus, setDrawStatus] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchAppData = async () => {
    try {
      const user = await api.getMe();
      setCurrentUser(user);
      if (user.is_staff && (activeTab === 'wishlist' || activeTab === 'draw')) {
        setActiveTab('admin_participants');
      }

      const [items, draw] = await Promise.all([
        api.getWishlist(),
        api.getDrawStatus(),
      ]);

      setWishlistItems(items);
      setDrawStatus(draw);
    } catch (err) {
      console.error('Session expired or error loading user:', err);
      removeAuthToken();
      setCurrentUser(null);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchAppData();
    } else {
      setInitialLoading(false);
    }
  }, []);

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    if (user.is_staff) {
      setActiveTab('admin_participants');
    } else {
      setActiveTab('wishlist');
    }
    setInitialLoading(true);
    await fetchAppData();
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    setWishlistItems([]);
    setDrawStatus(null);
    setActiveTab('wishlist');
  };

  // Wishlist handlers
  const handleAddItem = async (formData) => {
    const newItem = await api.addWishlistItem(formData);
    setWishlistItems((prev) => [newItem, ...prev]);
    // Refresh draw status so the system recognizes user now has items
    const updatedDraw = await api.getDrawStatus();
    setDrawStatus(updatedDraw);
  };

  const handleUpdateItem = async (id, formData) => {
    const updated = await api.updateWishlistItem(id, formData);
    setWishlistItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const handleDeleteItem = async (id) => {
    await api.deleteWishlistItem(id);
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    const updatedDraw = await api.getDrawStatus();
    setDrawStatus(updatedDraw);
  };

  // Draw handlers
  const handlePickDraw = async () => {
    const res = await api.pickDraw();
    const updatedDraw = await api.getDrawStatus();
    setDrawStatus(updatedDraw);
    return res;
  };

  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={42} color="var(--primary-rose)" />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Connecting to LA Familia De Hamster Corporation...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  // Gate participant entrance until they take the Hamster Verification Quiz
  if (!currentUser.is_staff && !currentUser.quiz_completed) {
    return <HamsterQuizModal user={currentUser} onQuizComplete={fetchAppData} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wishlistCount={wishlistItems.length}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="app-main-viewport">
        <main className="main-content">
          {!currentUser.is_staff && (
            <HeroTicket user={currentUser} />
          )}

          {!currentUser.is_staff && activeTab === 'wishlist' && (
            <WishlistView
              items={wishlistItems}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onGoToDraw={() => setActiveTab('draw')}
            />
          )}

          {!currentUser.is_staff && activeTab === 'draw' && (
            <LuckyDrawView
              drawStatus={drawStatus}
              wishlistCount={wishlistItems.length}
              onPickDraw={handlePickDraw}
              onGoToWishlist={() => setActiveTab('wishlist')}
            />
          )}

          {currentUser.is_staff && (
            <AdminView currentTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}
