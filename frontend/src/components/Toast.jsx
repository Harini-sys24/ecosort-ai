import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let Icon = CheckCircle2;
        let iconColor = '#34d399';
        let borderColor = 'rgba(52, 211, 153, 0.4)';

        if (t.type === 'error') {
          Icon = AlertCircle;
          iconColor = '#fb7185';
          borderColor = 'rgba(244, 63, 94, 0.4)';
        } else if (t.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = '#fbbf24';
          borderColor = 'rgba(245, 158, 11, 0.4)';
        } else if (t.type === 'info') {
          Icon = Info;
          iconColor = '#38bdf8';
          borderColor = 'rgba(6, 182, 212, 0.4)';
        }

        return (
          <div
            key={t.id}
            className="toast"
            style={{ borderColor }}
          >
            <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.9rem' }}>{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
