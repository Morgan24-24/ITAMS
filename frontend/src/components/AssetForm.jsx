import React, { useState, useEffect } from 'react'
import axiosInstance from '../api/axios'

const AssetForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // id removed - will be auto-generated
    type: '',
    brand: '',
    model: '',
    serial: '',
    purchase_date: '',
    cost: '',
    warranty_status: '',
    status: '',
    assignee: '',
    department: '',      
    location: ''         
  })

  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('/departments')
        setDepartments(response.data)
      } catch (err) {
        console.error('Failed to fetch departments:', err)
      } finally {
        setLoadingDepts(false)
      }
    }
    fetchDepartments()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Convert cost to float
    const submitData = {
      ...formData,
      cost: parseFloat(formData.cost)
    }
    
    onSubmit(submitData)
  }

  return (
    <div>
      <div className="header">
        <h1>Add New Asset</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Printer">Printer</option>
                  <option value="Server">Server</option>
                  <option value="Network">Network Device</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Dell, HP, Lenovo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Latitude 5420"
                  required
                />
              </div>

              <div className="form-group">
                <label>Serial Number *</label>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  placeholder="e.g., SN123456789"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Date *</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cost (₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Warranty Status *</label>
                <select
                  name="warranty_status"
                  value={formData.warranty_status}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="No Warranty">No Warranty</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Available">Available</option>
                  <option value="Active">Active</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {loadingDepts ? (
                    <option disabled>Loading departments...</option>
                  ) : departments.length === 0 ? (
                    <option disabled>No departments available</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  )}
                </select>
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                  Asset ID will be auto-generated based on department (e.g., {formData.department && departments.find(d => d.name === formData.department)?.code || 'DEPT'}-001)
                </small>
              </div>

              <div className="form-group">
                <label>Assignee</label>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  placeholder="Person assigned to (optional)"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Physical location (optional)"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Create Asset
              </button>
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AssetForm