import React from 'react'

const Dashboard = ({ assets, onNavigate }) => {
  const totalAssets = assets.length
  const deployedAssets = assets.filter(asset => asset.status === 'Deployed').length
  const availableAssets = assets.filter(asset => asset.status === 'Available').length
  const underRepairAssets = assets.filter(asset => asset.status === 'Under Repair').length

  return (
    <div>
      <div className="alert-success">
        <strong>Success:</strong> You have successfully logged in.
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Assets</h3>
          <div className="stat-number">{totalAssets}</div>
          <a href="#" className="more-info" onClick={(e) => { e.preventDefault(); onNavigate('assets'); }}>
            More info →
          </a>
        </div>

        <div className="stat-card">
          <h3>Deployed Assets</h3>
          <div className="stat-number">{deployedAssets}</div>
          <a href="#" className="more-info" onClick={(e) => { e.preventDefault(); onNavigate('assets'); }}>
            More info →
          </a>
        </div>

        <div className="stat-card">
          <h3>Available Assets</h3>
          <div className="stat-number">{availableAssets}</div>
          <a href="#" className="more-info" onClick={(e) => { e.preventDefault(); onNavigate('assets'); }}>
            More info →
          </a>
        </div>

        <div className="stat-card">
          <h3>Under Repair</h3>
          <div className="stat-number">{underRepairAssets}</div>
          <a href="#" className="more-info" onClick={(e) => { e.preventDefault(); onNavigate('assets'); }}>
            More info →
          </a>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Dashboard</h2>
        <p style={{ marginBottom: '20px', color: '#6c757d' }}>
          This is your dashboard. There are many like it, but this one is yours.
        </p>

        {totalAssets === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <p style={{ marginBottom: '20px' }}>
              It looks like you haven't added anything yet, so we don't have anything awesome to display. 
              Get started by adding some assets now!
            </p>
            <div className="quick-actions">
              <button 
                className="btn btn-success" 
                onClick={() => onNavigate('create')}
              >
                New Asset
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>You have {totalAssets} assets in your inventory.</p>
            <div className="quick-actions">
              <button 
                className="btn btn-success" 
                onClick={() => onNavigate('create')}
              >
                New Asset
              </button>
              <button 
                className="btn" 
                onClick={() => onNavigate('assets')}
              >
                View All Assets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard