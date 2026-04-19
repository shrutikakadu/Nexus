import { useState } from 'react';

export default function RejectModal({ isOpen, onClose, onConfirm, title = "Reject Clearance" }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError(true);
            return;
        }
        setError(false);
        onConfirm(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        setError(false);
        onClose();
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem' }}>{title}</h3>
                    <button style={closeBtnStyle} onClick={handleClose}>✕</button>
                </div>
                <div style={bodyStyle}>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text3)' }}>
                        Please provide a reason for this rejection. This will be visible to the student.
                    </p>
                    <textarea
                        autoFocus
                        placeholder="Enter rejection reason..."
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (e.target.value.trim()) setError(false);
                        }}
                        style={{
                            ...textareaStyle,
                            border: error ? '1.5px solid var(--red)' : '1.5px solid var(--border)'
                        }}
                    />
                    {error && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Reason is required.</div>}
                </div>
                <div style={footerStyle}>
                    <button style={cancelBtnStyle} onClick={handleClose}>Cancel</button>
                    <button style={confirmBtnStyle} onClick={handleConfirm}>Reject & Flag Issue</button>
                </div>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
};

const modalStyle = {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    fontFamily: 'var(--sans)'
};

const headerStyle = {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--bg)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const closeBtnStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    color: 'var(--text3)',
    cursor: 'pointer'
};

const bodyStyle = {
    padding: '1.5rem'
};

const textareaStyle = {
    width: '100%',
    minHeight: '100px',
    padding: '0.75rem',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box'
};

const footerStyle = {
    padding: '1rem 1.5rem',
    background: 'var(--bg)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem'
};

const cancelBtnStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'white',
    color: 'var(--text2)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.85rem'
};

const confirmBtnStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--red)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.85rem'
};
