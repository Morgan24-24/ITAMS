import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import AssetList from './components/AssetList'
import AssetForm from './components/AssetForm'
import Maintenance from './components/Maintenance'
import SoftwareLicenses from './components/SoftwareLicenses'

const API_BASE = 'http://127.0.0.1:8000'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [assets, setAssets] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAssets = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE}/assets`)
      setAssets(response.data)
    } catch (err) {
      setError('Failed to fetch assets')
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get(`${API_BASE}/maintenance`)
      setMaintenance(response.data)
    } catch (err) {
      console.error('Error fetching maintenance:', err)
    }
  }

  const fetchLicenses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/licenses`)
      setLicenses(response.data)
    } catch (err) {
      console.error('Error fetching licenses:', err)
    }
  }

  useEffect(() => {
    fetchAssets()
    fetchMaintenance()
    fetchLicenses()
  }, [])

  const handleCreateAsset = async (assetData) => {
    try {
      setError('')
      await axios.post(`${API_BASE}/assets`, assetData)
      await fetchAssets()
      setCurrentView('dashboard')
      alert('Asset created successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create asset')
    }
  }

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        setError('')
        await axios.delete(`${API_BASE}/assets/${assetId}`)
        await fetchAssets()
        alert('Asset deleted successfully!')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete asset')
      }
    }
  }

  const handleAddMaintenance = async (maintenanceData) => {
    try {
      setError('')
      await axios.post(`${API_BASE}/maintenance`, maintenanceData)
      await fetchMaintenance()
      await fetchAssets()
      alert('Maintenance record added successfully!')
      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add maintenance record')
      return false
    }
  }

  const handleAddLicense = async (licenseData) => {
    try {
      setError('')
      await axios.post(`${API_BASE}/licenses`, licenseData)
      await fetchLicenses()
      alert('Software license added successfully!')
      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add license')
      return false
    }
  }

  const handleDeleteLicense = async (licenseId) => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      try {
        setError('')
        await axios.delete(`${API_BASE}/licenses/${licenseId}`)
        await fetchLicenses()
        alert('License deleted successfully!')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete license')
      }
    }
  }
  const handleDeleteMaintenance = async (maintenanceId) => {  
  if (window.confirm('Are you sure you want to delete this maintenance record?')) {
    try {
      setError('')
      await axios.delete(`${API_BASE}/maintenance/${maintenanceId}`)
      await fetchMaintenance()
      alert('Maintenance record deleted successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete maintenance record')
    }
  }
  }
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>ITAMS</h2>
        </div>
        <div className="sidebar-menu">
          <a 
            className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <i>📊</i>
            <span className="menu-text">Dashboard</span>
          </a>
          <a 
            className={`menu-item ${currentView === 'assets' ? 'active' : ''}`}
            onClick={() => setCurrentView('assets')}
          >
            <i>💻</i>
            <span className="menu-text">Assets</span>
          </a>
          <a 
            className={`menu-item ${currentView === 'maintenance' ? 'active' : ''}`}
            onClick={() => setCurrentView('maintenance')}
          >
            <i>🔧</i>
            <span className="menu-text">Maintenance</span>
          </a>
          <a 
            className={`menu-item ${currentView === 'licenses' ? 'active' : ''}`}
            onClick={() => setCurrentView('licenses')}
          >
            <i>📄</i>
            <span className="menu-text">Licenses</span>
          </a>
          <a 
            className={`menu-item ${currentView === 'create' ? 'active' : ''}`}
            onClick={() => setCurrentView('create')}
          >
            <i>➕</i>
            <span className="menu-text">New Asset</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>IT Asset Management System</h1>
          <div className="user-info">
            <span>Welcome, Admin</span>
            <div className="badge badge-success">Online</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard 
            assets={assets}
            maintenance={maintenance}
            licenses={licenses}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'assets' && (
          <AssetList 
            assets={assets}
            loading={loading}
            onDelete={handleDeleteAsset}
            onRefresh={fetchAssets}
          />
        )}

        {currentView === 'maintenance' && (
          <Maintenance 
            assets={assets}
            maintenance={maintenance}
            onAddMaintenance={handleAddMaintenance}
            onDeleteMaintenance={handleDeleteMaintenance} 
            onRefresh={() => {
              fetchMaintenance()
              fetchAssets()
              
            }}
          />
        )}

        {currentView === 'licenses' && (
          <SoftwareLicenses 
            licenses={licenses}
            onAddLicense={handleAddLicense}
            onDeleteLicense={handleDeleteLicense}
            onRefresh={fetchLicenses}
          />
        )}

        {currentView === 'create' && (
          <AssetForm 
            onSubmit={handleCreateAsset}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
      </div>
    </div>
  )
}

export default App