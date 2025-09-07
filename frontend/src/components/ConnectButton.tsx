export default function ConnectButton() {
  return (
    <w3m-button 
      balance="hide" 
      label="Connect Wallet"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: '8px',
        padding: '0.875rem 1.75rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 12px rgba(0, 68, 124, 0.2)',
        fontFamily: 'Microsoft Sans Serif, Arial, sans-serif'
      }}
      hoverStyles={{
        backgroundColor: 'var(--primary-dark)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0, 68, 124, 0.3)'
      }}
    />
  );
}