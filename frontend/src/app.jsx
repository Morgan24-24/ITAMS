import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axiosInstance from './api/axios'
import Dashboard from './components/Dashboard'
import AssetList from './components/AssetList'
import AssetForm from './components/AssetForm'
import Maintenance from './components/Maintenance'
import SoftwareLicenses from './components/SoftwareLicenses'
import Sidebar from './components/Sidebar'
import Login from "./pages/login"
import Signup from "./pages/Signup"
import Department from './pages/Departments'


// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [assets, setAssets] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Fetch current user info
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/users/me') 
      setUser(response.data)
    } catch (err) {
      console.error('Error fetching user:', err)
    }
  }

  const fetchAssets = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axiosInstance.get('/assets')
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
      const response = await axiosInstance.get('/maintenance')
      setMaintenance(response.data)
    } catch (err) {
      console.error('Error fetching maintenance:', err)
    }
  }

  const fetchLicenses = async () => {
    try {
      const response = await axiosInstance.get('/licenses')
      setLicenses(response.data)
    } catch (err) {
      console.error('Error fetching licenses:', err)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchAssets()
    fetchMaintenance()
    fetchLicenses()
  }, [])

  const handleCreateAsset = async (assetData) => {
    try {
      setError('')
      await axiosInstance.post('/assets', assetData)
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
        await axiosInstance.delete(`/assets/${assetId}`)
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
      await axiosInstance.post('/maintenance', maintenanceData)
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
      await axiosInstance.post('/licenses', licenseData)
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
        await axiosInstance.delete(`/licenses/${licenseId}`)
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
        await axiosInstance.delete(`/maintenance/${maintenanceId}`)
        await fetchMaintenance()
        alert('Maintenance record deleted successfully!')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete maintenance record')
      }
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
  }

  return (
  <div className="app-container">
    {/* Sidebar */}
    <Sidebar 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      onLogout={handleLogout}
    />

    {/* Main Content */}
    <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {currentView === 'dashboard' && (
        <>
          {/* Header only for Dashboard */}
          <div className="header">
            <h1>AssetHub</h1>
            <div className="user-info">
              <span>Welcome, {user?.email || 'User'}</span>
            </div>
          </div>
          
          <Dashboard 
            assets={assets}
            maintenance={maintenance}
            licenses={licenses}
            onNavigate={setCurrentView}
          />
        </>
      )}

      {currentView === 'assets' && (
        <AssetList 
          assets={assets}
          loading={loading}
          onDelete={handleDeleteAsset}
          onRefresh={fetchAssets}
          onNewAssetClick={() => setCurrentView('create')}
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

      {currentView === 'departments' && (
        <Department />
      )}
    </div>
  </div>
)
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App