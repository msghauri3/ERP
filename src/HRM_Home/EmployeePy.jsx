import React, { useState, useEffect } from 'react';
import { employeeService } from './EmployeeService';
import './EmployeePy.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    EmployeeID: '',
    EmployeeName: '',
    CNIC: '',
    FatherName: '',
    DOB: '',
    MobileNo: '',
    Department: '',
    Designation: '',
    DateOfJoining: '',
    EmployeeStatus: '',
    BasicSalary: '',
    ApplyTax: ''
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees. Please check if the API server is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      EmployeeID: employee.EmployeeID,
      EmployeeName: employee.EmployeeName || '',
      CNIC: employee.CNIC || '',
      FatherName: employee.FatherName || '',
      DOB: employee.DOB || '',
      MobileNo: employee.MobileNo || '',
      Department: employee.Department || '',
      Designation: employee.Designation || '',
      DateOfJoining: employee.DateOfJoining || '',
      EmployeeStatus: employee.EmployeeStatus || '',
      BasicSalary: employee.BasicSalary || '',
      ApplyTax: employee.ApplyTax || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.deleteEmployee(employeeId);
        fetchEmployees(); // Refresh the list
        alert('Employee deleted successfully');
      } catch (err) {
        alert('Failed to delete employee');
        console.error('Error:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEmployee) {
        // Update existing employee
        await employeeService.updateEmployee(selectedEmployee.EmployeeID, formData);
        setIsEditModalOpen(false);
        alert('Employee updated successfully');
      } else {
        // Create new employee
        await employeeService.createEmployee(formData);
        setIsCreateModalOpen(false);
        alert('Employee created successfully');
      }
      fetchEmployees(); // Refresh the list
      resetForm();
    } catch (err) {
      alert(`Failed to ${selectedEmployee ? 'update' : 'create'} employee`);
      console.error('Error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      EmployeeID: '',
      EmployeeName: '',
      CNIC: '',
      FatherName: '',
      DOB: '',
      MobileNo: '',
      Department: '',
      Designation: '',
      DateOfJoining: '',
      EmployeeStatus: '',
      BasicSalary: '',
      ApplyTax: ''
    });
    setSelectedEmployee(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  if (loading) return <div className="loading">Loading employees...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-container">
      <div className="header">
        <h1>Employee Management</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          Add New Employee
        </button>
      </div>

      <div className="employee-grid">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>CNIC</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Mobile No</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.uid}>
                <td>{employee.EmployeeID}</td>
                <td>{employee.EmployeeName}</td>
                <td>{employee.CNIC}</td>
                <td>{employee.Department}</td>
                <td>{employee.Designation}</td>
                <td>{employee.MobileNo}</td>
                <td>
                  <span className={`status ${employee.EmployeeStatus?.toLowerCase()}`}>
                    {employee.EmployeeStatus}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(employee)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(employee.EmployeeID)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Employee</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID:</label>
                  <input
                    type="text"
                    name="EmployeeID"
                    value={formData.EmployeeID}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="EmployeeName"
                    value={formData.EmployeeName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>CNIC:</label>
                  <input
                    type="text"
                    name="CNIC"
                    value={formData.CNIC}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Father's Name:</label>
                  <input
                    type="text"
                    name="FatherName"
                    value={formData.FatherName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile No:</label>
                  <input
                    type="text"
                    name="MobileNo"
                    value={formData.MobileNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Department:</label>
                  <input
                    type="text"
                    name="Department"
                    value={formData.Department}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Designation:</label>
                  <input
                    type="text"
                    name="Designation"
                    value={formData.Designation}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Basic Salary:</label>
                  <input
                    type="number"
                    name="BasicSalary"
                    value={formData.BasicSalary}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Employee</h2>
            <form onSubmit={handleSubmit}>
              {/* Similar form fields as edit modal */}
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID:</label>
                  <input
                    type="text"
                    name="EmployeeID"
                    value={formData.EmployeeID}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="EmployeeName"
                    value={formData.EmployeeName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              {/* Add other form fields similar to edit modal */}
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create</button>
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;