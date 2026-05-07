import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import SearchBar from '../../components/SearchBar';
import { Alert } from '../../components/Alert';
import { studentAPI } from '../../services/api';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    grade: '',
    bus_id: '',
    route_id: '',
    parent_phone: '',
    address: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      if (response.data?.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setAlert({ type: 'error', message: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query) {
      try {
        setLoading(true);
        const response = await studentAPI.search(query);
        if (response.data?.success) {
          setStudents(response.data.data || []);
        }
      } catch (error) {
        console.error('Error searching students:', error);
      } finally {
        setLoading(false);
      }
    } else {
      fetchStudents();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentAPI.update(editingStudent.id, formData);
        setAlert({ type: 'success', message: 'Student updated successfully' });
      } else {
        await studentAPI.create(formData);
        setAlert({ type: 'success', message: 'Student added successfully' });
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        grade: '',
        bus_id: '',
        route_id: '',
        parent_phone: '',
        address: '',
      });
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      setAlert({ type: 'error', message: 'Failed to save student' });
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      grade: student.grade || '',
      bus_id: student.bus_id || '',
      route_id: student.route_id || '',
      parent_phone: student.parent_phone || '',
      address: student.address || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
      try {
        await studentAPI.delete(student.id);
        setAlert({ type: 'success', message: 'Student deleted successfully' });
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        setAlert({ type: 'error', message: 'Failed to delete student' });
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '16' },
    { 
      key: 'name', 
      label: 'Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-medium text-primary-600">
            {(row.first_name?.[0] || '') + (row.last_name?.[0] || '')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'grade', label: 'Grade' },
    { key: 'bus_id', label: 'Bus' },
    { key: 'route_id', label: 'Route' },
    { key: 'parent_phone', label: 'Parent Phone' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Active
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage student records and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setFormData({
              first_name: '',
              last_name: '',
              email: '',
              grade: '',
              bus_id: '',
              route_id: '',
              parent_phone: '',
              address: '',
            });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search students..."
          className="flex-1"
        />
        <button className="btn-secondary flex items-center gap-2">
          <FaFilter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Students Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        actions={{
          edit: handleEdit,
          delete: handleDelete,
        }}
        emptyMessage="No students found. Add a student to get started."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Grade</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="form-input"
                placeholder="e.g., Grade 5"
              />
            </div>
            <div>
              <label className="form-label">Bus ID</label>
              <input
                type="text"
                value={formData.bus_id}
                onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                className="form-input"
                placeholder="Bus #"
              />
            </div>
            <div>
              <label className="form-label">Route ID</label>
              <input
                type="text"
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                className="form-input"
                placeholder="Route #"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Parent Phone</label>
            <input
              type="tel"
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-input"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingStudent ? 'Update Student' : 'Add Student'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsPage;
