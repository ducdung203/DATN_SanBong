import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Button, TextField, MenuItem, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Chip, InputAdornment, Card, CardContent, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Avatar, Tooltip, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  SportsSoccer as SportsSoccerIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  DateRange as DateRangeIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Tạo theme tùy chỉnh
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f7fa',
    },
    status: {
      good: '#2e7d32',
      repair: '#ed6c02',
      broken: '#d32f2f',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f7fa',
          '& .MuiTableCell-head': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(0, 0, 0, 0.01)',
          },
        },
      },
    },
  },
});

export default function SoccerEquipmentManagerMUI() {
  // Danh sách thiết bị mẫu
  const initialEquipment = [];

  // State
  const [equipment, setEquipment] = useState(initialEquipment);
  const [filteredEquipment, setFilteredEquipment] = useState(initialEquipment);
  const [currentItem, setCurrentItem] = useState({ _id: null, name: '', quantity: 0, status: 'Tốt', location: '', lastMaintenance: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch devices from backend
  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/devices');
      setEquipment(response.data);
      setFilteredEquipment(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách thiết bị:', err);
      setSnackbar({ open: true, message: 'Lỗi khi lấy danh sách thiết bị!', severity: 'error' });
    }
  };

  // Thêm mới hoặc cập nhật thiết bị
  const saveItem = async () => {
    if (!currentItem.name || !currentItem.location) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin!',
        severity: 'error'
      });
      return;
    }

    try {
      if (isEditing) {
        // Cập nhật thiết bị hiện có
        const response = await axios.put(`http://localhost:4000/api/devices/${currentItem._id}`, currentItem);
        setEquipment(equipment.map(item => (item._id === currentItem._id ? response.data.device : item)));
        setSnackbar({ open: true, message: 'Cập nhật thiết bị thành công!', severity: 'success' });
      } else {
        // Thêm thiết bị mới
        const response = await axios.post('http://localhost:4000/api/devices', currentItem);
        setEquipment([...equipment, response.data.device]);
        setSnackbar({ open: true, message: 'Thêm thiết bị mới thành công!', severity: 'success' });
      }
      setFilteredEquipment(equipment);
      setCurrentItem({ _id: null, name: '', quantity: 0, status: 'Tốt', location: '', lastMaintenance: '' });
      setIsEditing(false);
    } catch (err) {
      console.error('Lỗi khi lưu thiết bị:', err);
      setSnackbar({ open: true, message: 'Lỗi khi lưu thiết bị!', severity: 'error' });
    }
  };

  // Xóa thiết bị
  const confirmDelete = (_id) => {
    setDeleteId(_id);
    setOpenDialog(true);
  };

  const deleteItem = async () => {
    try {

      await axios.delete(`http://localhost:4000/api/devices/${deleteId}`);
      setEquipment(equipment.filter(item => item._id !== deleteId));
      setFilteredEquipment(filteredEquipment.filter(item => item._id !== deleteId));
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Xóa thiết bị thành công!', severity: 'success' });
    } catch (err) {
      console.error('Lỗi khi xóa thiết bị:', err);
      setSnackbar({ open: true, message: 'Lỗi khi xóa thiết bị!', severity: 'error' });
    }
  };

  // Chỉnh sửa thiết bị
  const editItem = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setCurrentItem({ id: null, name: '', quantity: 0, status: 'Tốt', location: '', lastMaintenance: '' });
    setIsEditing(false);
  };

  // Đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tìm kiếm và lọc
  useEffect(() => {
    let results = equipment;
    
    // Tìm kiếm theo tên
    if (searchTerm) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'Tất cả') {
      results = results.filter(item => item.status === statusFilter);
    }
    
    setFilteredEquipment(results);
  }, [searchTerm, statusFilter, equipment]);

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Lấy màu cho chip trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'Tốt': return 'success';
      case 'Cần sửa chữa': return 'warning';
      case 'Hỏng': return 'error';
      default: return 'default';
    }
  };

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Đếm thiết bị theo trạng thái
  const getStatusCounts = () => {
    const counts = {
      total: equipment.length,
      good: equipment.filter(item => item.status === 'Tốt').length,
      repair: equipment.filter(item => item.status === 'Cần sửa chữa').length,
      broken: equipment.filter(item => item.status === 'Hỏng').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundImage: 'linear-gradient(to right, #e6f2ff, #f0f7ff)',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 200, 
              height: 200, 
              backgroundColor: 'primary.light', 
              opacity: 0.05,
              borderRadius: '50%'
            }} 
          />
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 4, 
              position: 'relative'
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 52, 
                height: 52, 
                mr: 2 
              }}
            >
              <SportsSoccerIcon fontSize="large" />
            </Avatar>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.dark', 
                letterSpacing: 0.5
              }}
            >
              Quản Lý Trang Thiết Bị Sân Bóng
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Thống kê thiết bị */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Tổng số thiết bị
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {statusCounts.total}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Thiết bị tốt
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      size="small" 
                      color="success" 
                      label="" 
                      sx={{ mr: 1, width: 12, height: 12 }} 
                    />
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {statusCounts.good}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cần sửa chữa
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      size="small" 
                      color="warning" 
                      label="" 
                      sx={{ mr: 1, width: 12, height: 12 }} 
                    />
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {statusCounts.repair}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Thiết bị hỏng
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      size="small" 
                      color="error" 
                      label="" 
                      sx={{ mr: 1, width: 12, height: 12 }} 
                    />
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {statusCounts.broken}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Form thêm/chỉnh sửa thiết bị */}
          <Card sx={{ mb: 4, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {isEditing ? (
                  <EditIcon color="primary" sx={{ mr: 1 }} />
                ) : (
                  <AddIcon color="primary" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isEditing ? 'Chỉnh Sửa Thiết Bị' : 'Thêm Thiết Bị Mới'}
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Tên thiết bị"
                    variant="outlined"
                    fullWidth
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    placeholder="Nhập tên thiết bị"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SportsSoccerIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Số lượng"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 0})}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    label="Trạng thái"
                    variant="outlined"
                    fullWidth
                    value={currentItem.status}
                    onChange={(e) => setCurrentItem({...currentItem, status: e.target.value})}
                  >
                    <MenuItem value="Tốt">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" color="success" label="" sx={{ mr: 1, width: 10, height: 10 }} />
                        Tốt
                      </Box>
                    </MenuItem>
                    <MenuItem value="Cần sửa chữa">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" color="warning" label="" sx={{ mr: 1, width: 10, height: 10 }} />
                        Cần sửa chữa
                      </Box>
                    </MenuItem>
                    <MenuItem value="Hỏng">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" color="error" label="" sx={{ mr: 1, width: 10, height: 10 }} />
                        Hỏng
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Vị trí"
                    variant="outlined"
                    fullWidth
                    value={currentItem.location}
                    onChange={(e) => setCurrentItem({...currentItem, location: e.target.value})}
                    placeholder="Nhập vị trí"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PlaceIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Ngày bảo trì"
                    type="date"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={currentItem.lastMaintenance}
                    onChange={(e) => setCurrentItem({...currentItem, lastMaintenance: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {isEditing ? (
                      <>
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={saveItem}
                          sx={{ px: 3 }}
                        >
                          Cập nhật
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={cancelEdit}
                        >
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={saveItem}
                        sx={{ px: 3 }}
                      >
                        Thêm mới
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Tìm kiếm và lọc */}
          <Card sx={{ mb: 4, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm thiết bị..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Lọc theo trạng thái"
                    variant="outlined"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Tất cả">Tất cả trạng thái</MenuItem>
                    <MenuItem value="Tốt">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" color="success" label="" sx={{ mr: 1, width: 10, height: 10 }} />
                        Tốt
                      </Box>
                    </MenuItem>
                    <MenuItem value="Cần sửa chữa">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" color="warning" label="" sx={{ mr: 1, width: 10, height: 10 }} />
                        Cần sửa chữa
                      </Box>
                    </MenuItem>
                    <MenuItem value="Hỏng">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" color="error" label="" sx={{ mr: 1, width: 10, height: 10 }} />
                        Hỏng
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('Tất cả');
                    }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Bảng hiển thị thiết bị */}
          <Paper elevation={1} sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">STT</TableCell>
                    <TableCell width="25%">Tên thiết bị</TableCell>
                    <TableCell width="10%">Số lượng</TableCell>
                    <TableCell width="15%">Trạng thái</TableCell>
                    <TableCell width="15%">Vị trí</TableCell>
                    <TableCell width="15%">Ngày bảo trì</TableCell>
                    <TableCell width="15%" align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEquipment.map((item, index) => (
                    
                    <TableRow key={item._id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.light',
                              width: 32, 
                              height: 32,
                              mr: 1.5
                            }}
                          >
                            <SportsSoccerIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.quantity} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status} 
                          size="small"
                          color={getStatusColor(item.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PlaceIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: 16 }} />
                          {item.location}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DateRangeIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: 16 }} />
                          {formatDate(item.lastMaintenance)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => editItem(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => confirmDelete(item._id)}
                            
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEquipment.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="body1" color="textSecondary">
                            Không tìm thấy thiết bị nào
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Thử thay đổi bộ lọc hoặc thêm thiết bị mới
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="body2" color="textSecondary">
                Hiển thị <b>{filteredEquipment.length}</b> trong tổng số <b>{equipment.length}</b> thiết bị
              </Typography>
            </Box>
          </Paper>
        </Paper>
        
        {/* Dialog xác nhận xóa */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            elevation: 2,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DeleteIcon color="error" sx={{ mr: 1 }} />
              Xác nhận xóa
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn xóa thiết bị này? Hành động này không thể hoàn tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              Hủy
            </Button>
            <Button 
              onClick={deleteItem} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{ ml: 1 }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar thông báo */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}