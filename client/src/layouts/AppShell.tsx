import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const AppShell: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Xử lý khi bấm logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <h1 style={{ display: 'inline-block', marginRight: '20px' }}>Fashion Rental</h1>
        {/* Bộ chọn ngôn ngữ */}
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={{ marginRight: '20px' }}
        >
          <option value="en">{t('common.english')}</option>
          <option value="vi">{t('common.vietnamese')}</option>
        </select>
        {/* Nút đăng xuất */}
        <button onClick={handleLogout}>{t('common.logout')}</button>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
