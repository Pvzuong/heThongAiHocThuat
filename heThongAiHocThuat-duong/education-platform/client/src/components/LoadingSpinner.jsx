const LoadingSpinner = ({ fullPage = true }) => {
  if (fullPage) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: '12px',
      }}>
        <div className="spinner" />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải...</p>
      </div>
    );
  }

  return <div className="spinner" style={{ margin: '24px auto' }} />;
};

export default LoadingSpinner;
