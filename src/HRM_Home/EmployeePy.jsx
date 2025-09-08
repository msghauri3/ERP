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
  IconButton
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { employeeService } from './EmployeeService';
import './EmployeePy.css';

const EmployeePy = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  // Media queries for responsive design
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallScreen = useMediaQuery('(max-width:480px)');

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        Object.values(employee).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredEmployees(filtered);
    }
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (err) {
      console.error('Error in fetchEmployees:', err);
      setError(err.message || 'Failed to fetch employees');
      setEmployees([]);
      setFilteredEmployees([]);
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

  // Responsive columns configuration
  const columns = useMemo(() => {
    const baseColumns = [
      { 
        field: 'EmployeeID', 
        headerName: 'ID', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell'
      },
      { 
        field: 'EmployeeName', 
        headerName: 'Name', 
        width: 180,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell'
      },
      { 
        field: 'Department', 
        headerName: 'Department', 
        width: 140,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        hide: isSmallScreen
      },
      { 
        field: 'Designation', 
        headerName: 'Designation', 
        width: 160,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        hide: isMobile
      },
      { 
        field: 'MobileNo', 
        headerName: 'Mobile', 
        width: 120,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell'
      },
      { 
        field: 'EmployeeStatus', 
        headerName: 'Status', 
        width: 100,
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        renderCell: (params) => (
          <span className={`status-badge status-${params.value?.toLowerCase() || 'unknown'}`}>
            {params.value}
          </span>
        )
      },
      { 
        field: 'BasicSalary', 
        headerName: 'Salary', 
        width: 100,
        type: 'number',
        headerClassName: 'grid-header',
        cellClassName: 'grid-cell',
        valueFormatter: (params) => `$${params.value?.toLocaleString() || '0'}`,
        hide: isSmallScreen
      },
    ];

    return baseColumns.filter(column => !column.hide);
  }, [isMobile, isSmallScreen]);

  const rows = useMemo(() => {
    if (!Array.isArray(filteredEmployees)) return [];
    return filteredEmployees.map((employee, index) => ({
      id: employee.uid || employee.EmployeeID || `emp-${index}`,
      ...employee
    }));
  }, [filteredEmployees]);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <Typography>Loading employees...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
        <button className="refresh-button" onClick={fetchEmployees}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employee-container">
      <div className="employee-header">
        <Typography variant="h4" className="employee-title">
          Employee Management
        </Typography>
        <button className="refresh-button" onClick={fetchEmployees}>
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search employees..."
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
                <IconButton
                  aria-label="clear search"
                  onClick={clearSearch}
                  edge="end"
                  size="small"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="search-input"
        />
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredEmployees.length} of {employees.length} employees
          </div>
        )}
      </div>

      <div className="grid-container">
        <div className="data-grid-wrapper">
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="client"
            pageSizeOptions={[5, 10, 20]}
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
        Showing {filteredEmployees.length} of {employees.length} employees
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </div>
    </div>
  );
};

export default EmployeePy;