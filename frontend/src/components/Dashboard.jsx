import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Dashboard = ({ assets, maintenance, licenses, onNavigate }) => {
  const [summary, setSummary] = useState(null)
  const API_BASE = 'http://127.0.0.1:8000'

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_BASE}/report/summary`)
        setSummary(response.data)
      } catch (err) {
        console.error('Error fetching summary:', err)
      }
    }
    fetchSummary()
  }, [assets, maintenance])

  const totalAssets = assets.length
  const deployedAssets = assets.filter(asset => asset.status === "Active").length
  const availableAssets = assets.filter(asset => asset.status === "Available").length
  const underRepairAssets = assets.filter(asset => asset.status === "Under Maintenance").length
  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter(license => license.status === 'Active').length

  return (
    <div>
      {/* Success Alert */}
      <div className="alert alert-success">
        <strong>Success:</strong> You have successfully logged in.
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Total Assets</h3>
              <div className="stat-number">{totalAssets}</div>
              <div className="stat-trend">All devices</div>
            </div>
            <div className="stat-icon">💻</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Active Assets</h3>
              <div className="stat-number">{deployedAssets}</div>
              <div className="stat-trend">In use</div>
            </div>
            <div className="stat-icon">✅</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Available Assets</h3>
              <div className="stat-number">{availableAssets}</div>
              <div className="stat-trend">Ready to deploy</div>
            </div>
            <div className="stat-icon">📦</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Under Maintenance</h3>
              <div className="stat-number">{underRepairAssets}</div>
              <div className="stat-trend">Being serviced</div>
            </div>
            <div className="stat-icon">🔧</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Software Licenses</h3>
              <div className="stat-number">{totalLicenses}</div>
              <div className="stat-trend">Total licenses</div>
            </div>
            <div className="stat-icon">📄</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Active Licenses</h3>
              <div className="stat-number">{activeLicenses}</div>
              <div className="stat-trend">Currently active</div>
            </div>
            <div className="stat-icon">🟢</div>
          </div>
        </div>
      </div>

      {/* Cost Stats */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <h3>Total Asset Cost</h3>
                <div className="stat-number">${summary.total_asset_cost?.toFixed(2) || '0.00'}</div>
                <div className="stat-trend">Total investment</div>
              </div>
              <div className="stat-icon">💰</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-content">
                <h3>Maintenance Cost</h3>
                <div className="stat-number">${summary.total_maintenance_cost?.toFixed(2) || '0.00'}</div>
                <div className="stat-trend">Service expenses</div>
              </div>
              <div className="stat-icon">🔧</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Asset Overview</h3>
            <button 
              className="btn btn-outline"
              onClick={() => onNavigate('assets')}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {totalAssets === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                <p style={{ marginBottom: '20px' }}>
                  It looks like you haven't added anything yet, so we don't have anything awesome to display. 
                  Get started by adding some assets, maintenance records, or licenses now!
                </p>
                <div className="quick-actions">
                  <button 
                    className="btn btn-success" 
                    onClick={() => onNavigate('create')}
                  >
                    <span>➕</span> New Asset
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onNavigate('maintenance')}
                  >
                    <span>🔧</span> Add Maintenance
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onNavigate('licenses')}
                  >
                    <span>📄</span> Add License
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>You have <strong>{totalAssets}</strong> assets and <strong>{totalLicenses}</strong> software licenses in your inventory.</p>
                <div className="quick-actions">
                  <button 
                    className="btn btn-success" 
                    onClick={() => onNavigate('create')}
                  >
                    <span>➕</span> New Asset
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onNavigate('assets')}
                  >
                    <span>📋</span> View All Assets
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onNavigate('maintenance')}
                  >
                    <span>🔧</span> Maintenance
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onNavigate('licenses')}
                  >
                    <span>📄</span> Licenses
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Quick Stats</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Devices:</span>
                <strong>{totalAssets}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Licenses:</span>
                <strong>{activeLicenses}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Maintenance Records:</span>
                <strong>{maintenance.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Available Assets:</span>
                <strong>{availableAssets}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard