// components/ui/Modal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div className="account-main" style={{ 
        width: '100%', maxWidth, margin: 0, position: 'relative', 
        maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          {title && <h2 className="checkout-section-title" style={{ margin: 0 }}>{title}</h2>}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};