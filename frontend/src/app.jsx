import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import AssetList from './components/AssetList'
import AssetForm from './components/AssetForm'

const API_BASE = 'http://127.0.0.1:8000'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [assets, setAssets] = useState([])
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

  useEffect(() => {
    fetchAssets()
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

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>IT Asset Management System</h1>
        </div>
      </header>

      <div className="container">
        <nav style={{ marginBottom: '20px' }}>
          <button 
            className="btn" 
            onClick={() => setCurrentView('dashboard')}
            style={{ marginRight: '10px' }}
          >
            Dashboard
          </button>
          <button 
            className="btn" 
            onClick={() => setCurrentView('assets')}
            style={{ marginRight: '10px' }}
          >
            View Assets
          </button>
          <button 
            className="btn btn-success" 
            onClick={() => setCurrentView('create')}
          >
            New Asset
          </button>
        </nav>

        {error && <div className="error">{error}</div>}

        {currentView === 'dashboard' && (
          <Dashboard 
            assets={assets}
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