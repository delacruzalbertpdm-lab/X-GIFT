import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeroTicket from './components/HeroTicket';
import WishlistView from './components/WishlistView';
import BatchSelectView from './components/BatchSelectView';
import AdminView from './components/AdminView';
import AuthModal from './components/AuthModal';
import HamsterQuizModal from './components/HamsterQuizModal';
import { api, getAuthToken, removeAuthToken } from './api';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'wishlist' | 'admin_batches' | 'admin_participants' | 'admin_questions'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Batches state
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchAppData = async () => {
    try {
      const user = await api.getMe();
      setCurrentUser(user);

      if (user.is_staff) {
        if (!activeTab.startsWith('admin_')) {
          setActiveTab('admin_batches');
        }
        return;
      }

      // Fetch Batches for participant
      const batchList = await api.getBatches();
      setBatches(batchList || []);

      // Check if user has already joined any batch
      const joinedBatches = (batchList || []).filter((b) => b.is_joined);

      let targetBatchId = selectedBatchId;
      if (!targetBatchId && joinedBatches.length > 0) {
        targetBatchId = joinedBatches[0].id;
      }

      if (targetBatchId) {
        setSelectedBatchId(targetBatchId);
        const items = await api.getWishlist(targetBatchId);
        setWishlistItems(items || []);
        // If they have a batch and were on default events, take them to their wishlist
        if (activeTab === 'events' && joinedBatches.length > 0) {
          setActiveTab('wishlist');
        }
      } else {
        // No batch joined yet -> show events tab so they can pick/join an event
        setActiveTab('events');
      }
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
      setActiveTab('admin_batches');
    } else {
      setActiveTab('events');
    }
    setInitialLoading(true);
    await fetchAppData();
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    setWishlistItems([]);
    setBatches([]);
    setSelectedBatchId(null);
    setActiveTab('events');
  };

  // Batch Selection & Joining
  const handleSelectBatch = async (batch) => {
    setSelectedBatchId(batch.id);
    try {
      const items = await api.getWishlist(batch.id);
      setWishlistItems(items || []);
    } catch (err) {
      console.error('Error fetching wishlist for batch:', err);
    }
    setActiveTab('wishlist');
  };

  const handleJoinBatch = async (batchId) => {
    await api.joinBatch(batchId);
    const updatedBatches = await api.getBatches();
    setBatches(updatedBatches || []);

    const targetBatch = updatedBatches.find((b) => b.id === batchId);
    if (targetBatch) {
      setSelectedBatchId(targetBatch.id);
      const items = await api.getWishlist(targetBatch.id);
      setWishlistItems(items || []);
      setActiveTab('wishlist');
    }
  };

  const handleRefreshBatches = async () => {
    const updated = await api.getBatches();
    setBatches(updated || []);
    if (selectedBatchId) {
      const items = await api.getWishlist(selectedBatchId);
      setWishlistItems(items || []);
    }
  };

  // Wishlist handlers scoped to active batch
  const handleAddItem = async (formData) => {
    const newItem = await api.addWishlistItem({
      ...formData,
      batch: selectedBatchId,
    });
    setWishlistItems((prev) => [newItem, ...prev]);
    // Refresh batch data to update counts
    const updated = await api.getBatches();
    setBatches(updated || []);
  };

  const handleUpdateItem = async (id, formData) => {
    const updated = await api.updateWishlistItem(id, formData);
    setWishlistItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const handleDeleteItem = async (id) => {
    await api.deleteWishlistItem(id);
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    const updated = await api.getBatches();
    setBatches(updated || []);
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

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || null;

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

          {/* User Tab 1: Event Batches Selection */}
          {!currentUser.is_staff && activeTab === 'events' && (
            <BatchSelectView
              batches={batches}
              currentBatch={currentBatch}
              onSelectBatch={handleSelectBatch}
              onJoinBatch={handleJoinBatch}
              onRefresh={handleRefreshBatches}
            />
          )}

          {/* User Tab 2: Wishlist & Matched Partner */}
          {!currentUser.is_staff && activeTab === 'wishlist' && (
            <WishlistView
              items={wishlistItems}
              currentBatch={currentBatch}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onSwitchEvent={() => setActiveTab('events')}
            />
          )}

          {/* Admin Tabs: Batches, Participants, Questions */}
          {currentUser.is_staff && (
            <AdminView currentTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}
