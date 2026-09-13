import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#323232',
        color: '#ffffff',
        padding: '10px 24px',
        borderRadius: 4,
        boxShadow: '0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14)',
        zIndex: 2000,
        fontSize: 14,
        pointerEvents: 'none',
        animation: 'fadeIn 150ms ease'
      }}
    >
      {message}
    </div>
  );
};
