import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  useMediaQuery,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Search, 
  Clear, 
  Add, 
  Edit, 
  Delete, 
  CalendarToday,
  Person 
} from '@mui/icons-material';
import { leavesService } from './leavesService';
import './LeavesPy.css';

const LeavesPy = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    year: '',
    employee_id: ''
  });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallScreen = useMediaQuery('(max-width:480px)');

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeaves(leaves);
    } else {
      const filtered = leaves.filter(leave =>
        Object.values(leave).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredLeaves(filtered);
    }
  }, [leaves, searchTerm]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leavesService.getAllLeaves(filters);
      setLeaves(data || []);
      setFilteredLeaves(data || []);
    } catch (err) {
      console.error('Error in fetchLeaves:', err);
      setError(err.message || 'Failed to fetch leaves');
      setLeaves([]);
      setFilteredLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      year: '',
      employee_id: ''
    });
    setSearchTerm('');
  };

  const handleEdit = (leave) => {
    setSelectedLeave(leave);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedLeave(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (leaveId) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      try {
        await leavesService.deleteLeave(leaveId);
        fetchLeaves();
        alert('Leave record deleted successfully');
      } catch (err) {
        alert('Failed to delete leave record');
        console.error('Error:', err);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedLeave(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEditMode && selectedLeave) {
        await leavesService.updateLeave(selectedLeave.uid, formData);
        alert('Leave updated successfully');
      } else {
        await leavesService.createLeave(formData);
        alert('Leave created successfully');
      }
      fetchLeaves();
      handleDialogClose();
    } catch (err) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} leave`);
      console.error('Error:', err);
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { 
        field: 'EmployeeID', 
        headerName: 'Employee ID', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell'
      },
      { 
        field: 'LeaveTypeName', 
        headerName: 'Leave Type', 
        width: 150,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell'
      },
      { 
        field: 'StartDate', 
        headerName: 'Start Date', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        valueFormatter: (params) => new Date(params.value).toLocaleDateString()
      },
      { 
        field: 'EndDate', 
        headerName: 'End Date', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        valueFormatter: (params) => new Date(params.value).toLocaleDateString()
      },
      { 
        field: 'TotalDays', 
        headerName: 'Days', 
        width: 80,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        type: 'number'
      },
      { 
        field: 'Status', 
        headerName: 'Status', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        renderCell: (params) => (
          <Chip 
            label={params.value} 
            size="small"
            className={`status-chip status-${params.value?.toLowerCase()}`}
          />
        )
      },
      { 
        field: 'AppliedDate', 
        headerName: 'Applied On', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
      },
      { 
        field: 'actions', 
        headerName: 'Actions', 
        width: 150,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        renderCell: (params) => (
          <div className="action-buttons">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              className="edit-btn"
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.uid)}
              className="delete-btn"
            >
              <Delete />
            </IconButton>
          </div>
        )
      },
    ];

    return baseColumns.filter(column => !column.hide);
  }, [isMobile, isSmallScreen]);

  const rows = useMemo(() => {
    if (!Array.isArray(filteredLeaves)) return [];
    return filteredLeaves.map((leave, index) => ({
      id: leave.uid || `leave-${index}`,
      ...leave
    }));
  }, [filteredLeaves]);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <Typography>Loading leaves...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
        <button className="refresh-button" onClick={fetchLeaves}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="leaves-container">
      <div className="leaves-header">
        <Typography variant="h4" className="leaves-title">
          Employee Leaves Management
        </Typography>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchLeaves}>
            Refresh
          </button>
          <button className="create-button" onClick={handleCreate}>
            <Add /> New Leave
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-container">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search leaves..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end" size="small">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="search-input"
        />

        <div className="filter-controls">
          <FormControl size="small" className="filter-select">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Year"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="filter-input"
            placeholder="2024"
          />

          <TextField
            size="small"
            label="Employee ID"
            value={filters.employee_id}
            onChange={(e) => handleFilterChange('employee_id', e.target.value)}
            className="filter-input"
            placeholder="EMP001"
          />

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {searchTerm && (
          <div className="search-results-info">
            Found {filteredLeaves.length} of {leaves.length} leave records
          </div>
        )}
      </div>

      {/* Leaves Grid */}
      <div className="grid-container">
        <div className="data-grid-wrapper">
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="client"
            pageSizeOptions={[5, 10, 20, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-virtualScroller': {
                minHeight: '200px',
              },
            }}
          />
        </div>
      </div>

      <div className="grid-footer">
        Showing {filteredLeaves.length} of {leaves.length} leave records
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </div>

      {/* Leave Dialog */}
      <LeaveDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        leave={selectedLeave}
        isEdit={isEditMode}
      />
    </div>
  );
};

// Leave Dialog Component
const LeaveDialog = ({ open, onClose, onSubmit, leave, isEdit }) => {
  const [formData, setFormData] = useState({
    EmployeeID: '',
    LeaveTypeName: '',
    StartDate: '',
    EndDate: '',
    TotalDays: '',
    Status: 'Pending',
    AppliedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (leave) {
      setFormData({
        EmployeeID: leave.EmployeeID || '',
        LeaveTypeName: leave.LeaveTypeName || '',
        StartDate: leave.StartDate || '',
        EndDate: leave.EndDate || '',
        TotalDays: leave.TotalDays || '',
        Status: leave.Status || 'Pending',
        AppliedDate: leave.AppliedDate || new Date().toISOString().split('T')[0]
      });
    }
  }, [leave]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Leave Record' : 'Create New Leave Record'}
      </DialogTitle>
      <DialogContent>
        <div className="dialog-form">
          <TextField
            fullWidth
            label="Employee ID"
            value={formData.EmployeeID}
            onChange={(e) => handleInputChange('EmployeeID', e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Leave Type"
            value={formData.LeaveTypeName}
            onChange={(e) => handleInputChange('LeaveTypeName', e.target.value)}
            margin="normal"
            required
          />
          
          <div className="form-row">
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.StartDate}
              onChange={(e) => handleInputChange('StartDate', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.EndDate}
              onChange={(e) => handleInputChange('EndDate', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
          </div>
          
          <TextField
            fullWidth
            label="Total Days"
            type="number"
            value={formData.TotalDays}
            onChange={(e) => handleInputChange('TotalDays', e.target.value)}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.Status}
              label="Status"
              onChange={(e) => handleInputChange('Status', e.target.value)}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeavesPy;