import React, { useState } from 'react'

const AssetForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
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
      <h2>Add New Asset</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Asset ID *</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div>

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
            <label>Cost *</label>
            <input
              type="number"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
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
              <option value="Deployed">Deployed</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assignee</label>
            <input
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            Create Asset
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssetForm