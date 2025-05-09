import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, MenuItem, Box, Tooltip, Alert, Snackbar,
  Chip, Divider, Container, useTheme, Grid, Card, CardContent, 
  CardActions, InputAdornment
} from '@mui/material';
import { 
  Edit, Delete, AddCircle, SportsSoccer, 
  AccessTime, AttachMoney, Group, Check, Cancel,
  Search
} from '@mui/icons-material';

const pitchTypes = ['5 người', '7 người', '11 người'];
const statusOptions = ['Hoạt động', 'Bảo trì', 'Đóng cửa'];

// Hàm tạo màu sắc dựa trên loại sân
const getColorByType = (type) => {
  switch(type) {
    case '5 người': return 'success';
    case '7 người': return 'primary';
    case '11 người': return 'secondary';
    default: return 'default';
  }
};

// Hàm tạo màu sắc dựa trên trạng thái
const getColorByStatus = (status) => {
  switch(status) {
    case 'Hoạt động': return 'success';
    case 'Bảo trì': return 'warning';
    case 'Đóng cửa': return 'error';
    default: return 'default';
  }
};

export default function Field() {
  const theme = useTheme();
  const [pitches, setPitches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    hours: '',
    status: 'Hoạt động'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Hiển thị thông báo
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Lấy danh sách sân từ backend
  const fetchPitches = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/fields');
      setPitches(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sân:', err);
      showSnackbar('Lỗi khi lấy danh sách sân!', 'error');
    }
  };

  // Thêm hoặc chỉnh sửa sân
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingPitch) {
        // Chỉnh sửa sân
        const response = await axios.put(`http://localhost:4000/api/fields/${editingPitch._id}`, formData);
        setPitches(pitches.map(p => (p._id === editingPitch._id ? response.data.field : p)));
        showSnackbar('Cập nhật thông tin sân thành công!');
      } else {
        // Thêm sân mới
        const response = await axios.post('http://localhost:4000/api/fields', formData);
        setPitches([...pitches, response.data.field]);
        showSnackbar('Thêm sân mới thành công!');
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Lỗi khi lưu sân:', err);
      showSnackbar('Lỗi khi lưu sân!', 'error');
    }
  };

  // Xóa sân
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/fields/${pitchToDelete._id}`);
      setPitches(pitches.filter(p => p._id !== pitchToDelete._id));
      setConfirmDialogOpen(false);
      showSnackbar('Xóa sân thành công!', 'info');
    } catch (err) {
      console.error('Lỗi khi xóa sân:', err);
      showSnackbar('Lỗi khi xóa sân!', 'error');
    }
  };

  // Lấy danh sách sân khi component được mount
  useEffect(() => {
    fetchPitches();
  }, []);

  const handleOpenDialog = (pitch = null) => {
    setEditingPitch(pitch);
    setFormData(pitch || { name: '', type: '', price: '', hours: '', status: 'Hoạt động' });
    setFormErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFormData({ name: '', type: '', price: '', hours: '', status: 'Hoạt động' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'price' ? Number(value) : value });

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Tên sân không được để trống';
    }

    if (!formData.type) {
      errors.type = 'Vui lòng chọn loại sân';
    }

    if (!formData.price) {
      errors.price = 'Giá thuê không được để trống';
    } else if (formData.price <= 0) {
      errors.price = 'Giá thuê phải lớn hơn 0';
    }

    if (!formData.hours.trim()) {
      errors.hours = 'Thời gian hoạt động không được để trống';
    } else if (!/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(formData.hours)) {
      errors.hours = 'Định dạng thời gian không hợp lệ (VD: 6:00 - 22:00)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openConfirmDelete = (pitch) => {
    setPitchToDelete(pitch);
    setConfirmDialogOpen(true);
  };

  const filteredPitches = pitches.filter(pitch =>
    pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitch.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const renderTableView = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
        '& .MuiTableRow-root:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên sân</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại sân</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giá (VNĐ/giờ)</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thời gian hoạt động</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPitches.map(pitch => (
            <TableRow key={pitch.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SportsSoccer sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle1" fontWeight="medium">{pitch.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={pitch.type} 
                  size="small"
                  color={getColorByType(pitch.type)}
                  icon={<Group />}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium" color="error">
                  {formatPrice(pitch.price)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  {pitch.hours}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={pitch.status} 
                  size="small"
                  color={getColorByStatus(pitch.status)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Chỉnh sửa">
                  <IconButton 
                    onClick={() => handleOpenDialog(pitch)}
                    size="small"
                    sx={{ 
                      mr: 1,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <Edit fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton 
                    onClick={() => openConfirmDelete(pitch)}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.2),
                      }
                    }}
                  >
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {filteredPitches.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? 'Không tìm thấy sân nào phù hợp.' : 'Chưa có sân nào được thêm vào.'}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCardView = () => (
    <Grid container spacing={3}>
      {filteredPitches.map(pitch => (
        <Grid item xs={12} sm={6} md={4} key={pitch.id}>
          <Card elevation={3} sx={{ 
            borderRadius: 2, 
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" fontWeight="bold" color="primary">
                  {pitch.name}
                </Typography>
                <Chip 
                  label={pitch.status} 
                  size="small"
                  color={getColorByStatus(pitch.status)}
                  variant="outlined"
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Group sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Loại sân:
                </Typography>
                <Box sx={{ ml: 1 }}>
                  <Chip 
                    label={pitch.type} 
                    size="small"
                    color={getColorByType(pitch.type)}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <AttachMoney sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Giá thuê:
                </Typography>
                <Typography variant="body1" color="error.main" fontWeight="medium" sx={{ ml: 1 }}>
                  {formatPrice(pitch.price)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Thời gian:
                </Typography>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {pitch.hours}
                </Typography>
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<Edit />} 
                size="small" 
                onClick={() => handleOpenDialog(pitch)}
              >
                Sửa
              </Button>
              <Button 
                startIcon={<Delete />} 
                size="small" 
                color="error"
                onClick={() => openConfirmDelete(pitch)}
              >
                Xóa
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
      {filteredPitches.length === 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'Không tìm thấy sân nào phù hợp.' : 'Chưa có sân nào được thêm vào.'}
            </Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          mt: 3,
          mb: 3,
          background: `linear-gradient(to right bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            <SportsSoccer sx={{ mr: 1, verticalAlign: 'middle' }} /> 
            Quản lý sân bóng
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              borderRadius: 2,
              boxShadow: 2,
              px: 2,
              py: 1
            }}
          >
            Thêm sân mới
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Tìm kiếm sân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <Box>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={toggleViewMode}
              size="small"
              sx={{ mr: 1 }}
            >
              Danh sách
            </Button>
            <Button
              variant={viewMode === 'card' ? 'contained' : 'outlined'}
              onClick={toggleViewMode}
              size="small"
            >
              Thẻ
            </Button>
          </Box>
        </Box>
        
        {viewMode === 'table' ? renderTableView() : renderCardView()}

        {/* Dialog thêm/chỉnh sửa sân */}
        <Dialog 
          open={open} 
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            elevation: 8,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main, 
            color: 'white',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {editingPitch ? <Edit sx={{ mr: 1 }} /> : <AddCircle sx={{ mr: 1 }} />}
              <Typography variant="h6">
                {editingPitch ? 'Chỉnh sửa thông tin sân' : 'Thêm sân bóng mới'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 4 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Tên sân"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SportsSoccer color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              fullWidth
              margin="normal"
              label="Loại sân"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={!!formErrors.type}
              helperText={formErrors.type}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Group color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              {pitchTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Giá thuê (VNĐ/giờ)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={!!formErrors.price}
              helperText={formErrors.price}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Thời gian hoạt động (vd: 6:00 - 22:00)"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              error={!!formErrors.hours}
              helperText={formErrors.hours}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTime color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              fullWidth
              margin="normal"
              label="Trạng thái"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {statusOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={handleCloseDialog}
              startIcon={<Cancel />}
              variant="outlined"
              color="inherit"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              startIcon={<Check />}
              variant="contained"
              color="primary"
            >
              {editingPitch ? 'Lưu thay đổi' : 'Thêm sân'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xác nhận xóa */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: 2, p: 1 }
          }}
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
              Bạn có chắc chắn muốn xóa sân <strong>{pitchToDelete?.name}</strong>?
              <br />Hành động này không thể hoàn tác.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialogOpen(false)}
              color="inherit"
              variant="outlined"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              startIcon={<Delete />}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* Thông báo snackbar */}
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
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Thêm hàm alpha nếu không có sẵn trong theme
const alpha = (color, opacity) => {
  if (typeof color !== 'string') return color;
  return color + opacity.toString(16).padStart(2, '0');
};