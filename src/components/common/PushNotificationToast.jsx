import React, { useEffect, useState, useCallback } from 'react';

/**
 * Toast pour afficher les notifications push en temps réel - Version Tailwind CSS
 */
export const PushNotificationToast = ({ notification, onClose, autoHideDuration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsExiting(false);

      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, [notification, autoHideDuration, handleClose]);

  if (!notification || !isVisible) return null;

  return (
    <div
      onClick={handleClose}
      className={`
        fixed top-5 right-5 z-[10000] cursor-pointer max-w-md
        md:max-w-lg lg:max-w-xl
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
    >
      <div className="
        bg-gradient-to-r from-primary to-primary-dark text-white
        p-4 md:p-5 rounded-xl shadow-strong
        flex items-start gap-3 md:gap-4
        backdrop-blur-sm border border-white border-opacity-20
      ">
        <div className="text-2xl flex-shrink-0">🔔</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base md:text-lg mb-1">
            {notification.title}
          </div>
          <div className="text-sm md:text-base opacity-95 leading-relaxed">
            {notification.body}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="
            bg-white bg-opacity-20 hover:bg-opacity-30
            w-6 h-6 rounded-full flex items-center justify-center
            flex-shrink-0 transition-colors text-sm
          "
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PushNotificationToast;
