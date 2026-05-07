import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { routeAPI } from '../../services/api';
import { Alert } from '../../components/Alert';
import Modal from '../../components/Modal';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_name: '',
    route_code: '',
    start_point: '',
    end_point: '',
    estimated_duration: '',
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routeAPI.getAll();
      if (response.data?.success) {
        setRoutes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setAlert({ type: 'error', message: 'Failed to load routes' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await routeAPI.update(editingRoute.id, formData);
        setAlert({ type: 'success', message: 'Route updated successfully' });
      } else {
        await routeAPI.create(formData);
        setAlert({ type: 'success', message: 'Route added successfully' });
      }
      setIsModalOpen(false);
      setEditingRoute(null);
      fetchRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      setAlert({ type: 'error', message: 'Failed to save route' });
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      route_name: route.route_name || '',
      route_code: route.route_code || '',
      start_point: route.start_point || '',
      end_point: route.end_point || '',
      estimated_duration: route.estimated_duration || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (route) => {
    if (window.confirm(`Delete route ${route.route_name}?`)) {
      try {
        await routeAPI.delete(route.id);
        setAlert({ type: 'success', message: 'Route deleted successfully' });
        fetchRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
        setAlert({ type: 'error', message: 'Failed to delete route' });
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'route_name', label: 'Route Name' },
    { key: 'route_code', label: 'Code' },
    { key: 'start_point', label: 'Start Point' },
    { key: 'end_point', label: 'End Point' },
    { key: 'estimated_duration', label: 'Duration (min)' },
    {
      key: 'stops',
      label: 'Stops',
      render: (value, row) => row.stops_count || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Routes</h1>
          <p className="page-subtitle">Manage bus routes and stops</p>
        </div>
        <button
          onClick={() => {
            setEditingRoute(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Route
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <DataTable
        columns={columns}
        data={routes}
        loading={loading}
        actions={{ edit: handleEdit, delete: handleDelete }}
        emptyMessage="No routes found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? 'Edit Route' : 'Add Route'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Route Name</label>
              <input
                type="text"
                value={formData.route_name}
                onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Route Code</label>
              <input
                type="text"
                value={formData.route_code}
                onChange={(e) => setFormData({ ...formData, route_code: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Point</label>
              <input
                type="text"
                value={formData.start_point}
                onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">End Point</label>
              <input
                type="text"
                value={formData.end_point}
                onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>
          <div>
            <label className="form-label">Estimated Duration (minutes)</label>
            <input
              type="number"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingRoute ? 'Update' : 'Add'} Route
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

export default RoutesPage;
