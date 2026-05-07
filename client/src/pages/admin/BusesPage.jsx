import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { busAPI } from '../../services/api';
import { Alert } from '../../components/Alert';
import Modal from '../../components/Modal';

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    registration_number: '',
    capacity: '',
    model: '',
    year: '',
    driver_id: '',
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await busAPI.getAll();
      if (response.data?.success) {
        setBuses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setAlert({ type: 'error', message: 'Failed to load buses' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await busAPI.update(editingBus.id, formData);
        setAlert({ type: 'success', message: 'Bus updated successfully' });
      } else {
        await busAPI.create(formData);
        setAlert({ type: 'success', message: 'Bus added successfully' });
      }
      setIsModalOpen(false);
      setEditingBus(null);
      fetchBuses();
    } catch (error) {
      console.error('Error saving bus:', error);
      setAlert({ type: 'error', message: 'Failed to save bus' });
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number || '',
      registration_number: bus.registration_number || '',
      capacity: bus.capacity || '',
      model: bus.model || '',
      year: bus.year || '',
      driver_id: bus.driver_id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (bus) => {
    if (window.confirm(`Delete bus ${bus.bus_number}?`)) {
      try {
        await busAPI.delete(bus.id);
        setAlert({ type: 'success', message: 'Bus deleted successfully' });
        fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        setAlert({ type: 'error', message: 'Failed to delete bus' });
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'bus_number', label: 'Bus Number' },
    { key: 'registration_number', label: 'Registration' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Buses</h1>
          <p className="page-subtitle">Manage bus fleet and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingBus(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Bus
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <DataTable
        columns={columns}
        data={buses}
        loading={loading}
        actions={{ edit: handleEdit, delete: handleDelete }}
        emptyMessage="No buses found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBus ? 'Edit Bus' : 'Add Bus'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Bus Number</label>
              <input
                type="text"
                value={formData.bus_number}
                onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Registration</label>
              <input
                type="text"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingBus ? 'Update' : 'Add'} Bus
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BusesPage;
