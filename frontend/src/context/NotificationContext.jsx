import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`} onClick={() => removeNotification(n.id)}>
            <div className="toast-icon">
              {n.type === 'error' ? '✕' : n.type === 'success' ? '✓' : 'ℹ'}
            </div>
            <div className="toast-message">{n.message}</div>
            <div className="toast-close">&times;</div>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
          width: 100%;
          max-width: 400px;
        }
        .toast {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        @keyframes toastIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 0.9rem;
          font-weight: bold;
          flex-shrink: 0;
        }
        .toast-success .toast-icon { background: #dcfce7; color: #166534; }
        .toast-error .toast-icon { background: #fee2e2; color: #991b1b; }
        .toast-info .toast-icon { background: #e0f2fe; color: #075985; }
        
        .toast-message {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
          line-height: 1.4;
          flex: 1;
        }
        .toast-close {
          color: #94a3b8;
          font-size: 1.25rem;
          line-height: 1;
        }
        .toast::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background: #cbd5e1;
          animation: toastProgress 4s linear forwards;
        }
        .toast-success::after { background: #22c55e; }
        .toast-error::after { background: #ef4444; }
        .toast-info::after { background: #3b82f6; }

        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
