import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Box, Grid, Card, CardContent, IconButton, Stack, Divider,
  Alert, Snackbar, Tooltip, Chip, CircularProgress
} from '@mui/material';
import {
  AddCircle, DeleteOutline, CalendarMonth, AccessTime, Person,
  SportsSoccer, Check, Edit, CurrencyExchange, Warning
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export default function AdminBooking() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bookings, setBookings] = useState([]);
  const [fields, setFields] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    fieldId: '',
    fieldType: '',
    startTime: '',
    endTime: '',
    totalAmount: 0,
    paymentStatus: 'unpaid'
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, booking: null });
  const [conflictDialog, setConflictDialog] = useState({ open: false, conflicts: [] });

  // Lấy danh sách sân
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get(`${API_URL}/fields`);
        setFields(response.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải danh sách sân!',
          severity: 'error'
        });
      }
    };
    fetchFields();
  }, []);

  // Hàm load dữ liệu
  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/bookings`);
      setBookings(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải danh sách đặt sân!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadBookings();
  }, []);

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleOpenDialog = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      fieldId: '',
      fieldType: '',
      startTime: '',
      endTime: '',
      totalAmount: 0,
      paymentStatus: 'unpaid'
    });
    setIsEditing(false);
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      customerName: '',
      phoneNumber: '',
      fieldId: '',
      fieldType: '',
      startTime: '',
      endTime: '',
      totalAmount: 0,
      paymentStatus: 'unpaid'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    console.log('handleChange:', name, value, newFormData);
    // Tính tổng tiền khi thay đổi sân hoặc thời gian
    if (name === 'fieldId' || name === 'startTime' || name === 'endTime') {
      if (newFormData.fieldId && newFormData.startTime && newFormData.endTime) {
        calculateTotalAmount(newFormData.fieldId, newFormData.startTime, newFormData.endTime);
      }
    }
  };

  const calculateTotalAmount = (fieldId, startTime, endTime) => {
    const selectedField = fields.find(f => f._id === fieldId);
    if (!selectedField || !startTime || !endTime) return;

    const start = new Date(`2022-01-01T${startTime}`);
    const end = new Date(`2022-01-01T${endTime}`);
    
    // Nếu giờ kết thúc < giờ bắt đầu, không tính
    if (end <= start) {
      setFormData(prev => ({ ...prev, totalAmount: 0 }));
      return;
    }
    
    // Tính số giờ thuê sân (làm tròn lên 0.5 giờ)
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const roundedHours = Math.ceil(diffHours * 2) / 2; // Làm tròn lên 0.5h
    
    const totalAmount = selectedField.price * roundedHours;
    setFormData(prev => ({ ...prev, totalAmount }));
  };

  const checkTimeConflict = async (bookingData) => {
    try {
      const response = await axios.post(`${API_URL}/bookings/check-conflict`, {
        ...bookingData,
        bookingId: isEditing ? editingId : null
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trùng lịch:', error);
      return { hasConflict: false };
    }
  };

  const handleSaveBooking = async () => {
    // Validation
    console.log('handleSaveBooking - formData:', formData);
    if (!formData.customerName || !formData.phoneNumber || !formData.fieldId || !formData.startTime || !formData.endTime) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin',
        severity: 'error'
      });
      return;
    }

    try {
      const selectedField = fields.find(f => f._id === formData.fieldId);
      
      // Tính lại tổng tiền để đảm bảo chính xác
      const start = new Date(`2022-01-01T${formData.startTime}`);
      const end = new Date(`2022-01-01T${formData.endTime}`);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      const roundedHours = Math.ceil(diffHours * 2) / 2;
      const totalAmount = selectedField.price * roundedHours;

      const bookingData = {
        fieldId: formData.fieldId,
        fieldType: selectedField.type,
        date: selectedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        totalAmount: totalAmount,
        paymentStatus: formData.paymentStatus,
        name: formData.customerName,
        sdt: formData.phoneNumber
      };
      console.log('Booking Data:', bookingData);

      // Kiểm tra trùng lịch
      const conflictCheck = await checkTimeConflict(bookingData);
      if (conflictCheck.hasConflict) {
        setConflictDialog({
          open: true,
          conflicts: conflictCheck.conflicts
        });
        return;
      }

      if (isEditing) {
        // Cập nhật booking hiện có
        await axios.put(`${API_URL}/bookings/${editingId}`, bookingData);
        setSnackbar({
          open: true,
          message: 'Cập nhật đặt sân thành công!',
          severity: 'success'
        });
      } else {
        // Tạo booking mới
        await axios.post(`${API_URL}/bookings`, bookingData);
        setSnackbar({
          open: true,
          message: 'Đặt sân thành công!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      loadBookings();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Lỗi khi xử lý đặt sân!',
        severity: 'error'
      });
    }
  };

  const handleEdit = (booking) => {
    setFormData({
      customerName: booking.userId?.fullname || booking.name || '',
      phoneNumber: booking.userId?.phone || booking.sdt || '',
      fieldId: booking.fieldId?._id || '',
      fieldType: booking.fieldId?.type || '',
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      totalAmount: booking.totalAmount || 0,
      paymentStatus: booking.paymentStatus || 'unpaid'
    });
    setIsEditing(true);
    setEditingId(booking._id);
    setOpenDialog(true);
  };

  const handleDeleteClick = (booking) => {
    setDeleteDialog({ open: true, booking });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/bookings/${deleteDialog.booking._id}`);
      setSnackbar({
        open: true,
        message: 'Xóa đặt sân thành công!',
        severity: 'success'
      });
      // Load lại dữ liệu sau khi xóa
      loadBookings();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Lỗi khi xóa đặt sân!',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, booking: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, booking: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const bookingsForSelectedDate = bookings.filter(b => b.date === selectedDate);
  
  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  // Tính thời gian thuê từ startTime và endTime
  const calculateDuration = (start, end) => {
    if (!start || !end) return '0h';
    
    const startTime = new Date(`2022-01-01T${start}`);
    const endTime = new Date(`2022-01-01T${end}`);
    
    if (endTime <= startTime) return '0h'; 
    
    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours - hours) * 60);
    
    if (minutes === 0) return `${hours}h`;
    return `${hours}h${minutes}m`;
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Quản Lý Đặt Sân
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CalendarMonth fontSize="large" />
                <Box>
                  <Typography variant="subtitle2">Ngày được chọn:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatDisplayDate(selectedDate)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="date"
              label="Chọn ngày"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              onClick={handleOpenDialog}
              size="large"
              sx={{ height: 56, whiteSpace: 'nowrap' }}
            >
              Đặt sân mới
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Card elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box bgcolor="primary.main" color="primary.contrastText" py={1.5} px={3}>
          <Typography variant="h6">
            Lịch đặt sân ngày: {formatDisplayDate(selectedDate)}
          </Typography>
        </Box>
        
        <TableContainer sx={{ maxHeight: 440 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sân</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsForSelectedDate.length > 0 ? (
                  bookingsForSelectedDate.map(b => (
                    <TableRow key={b._id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Person color="primary" />
                          <Box>
                            <Typography variant="body1">{b.userId?.fullname || b.name || 'N/A'}</Typography>
                            
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                          {b.userId?.phone || b.sdt || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<SportsSoccer />} 
                          label={b.fieldId?.name || 'N/A'} 
                          variant="outlined" 
                          color="primary"
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {b.fieldId?.type} - {b.fieldId?.price?.toLocaleString('vi-VN')}đ/giờ
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTime color="secondary" />
                          <Box>
                            <Typography>{`${b.startTime} - ${b.endTime}`}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({calculateDuration(b.startTime, b.endTime)})
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold" 
                          color="success.main"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <CurrencyExchange fontSize="small" sx={{ mr: 0.5 }} />
                          {b.totalAmount?.toLocaleString('vi-VN')}đ
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={b.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'} 
                          color={b.paymentStatus === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Sửa đặt sân">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEdit(b)}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa đặt sân">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick(b)}
                              size="small"
                            >
                              <DeleteOutline />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <SportsSoccer sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                        <Typography variant="subtitle1" color="text.secondary">
                          Không có lịch đặt sân nào cho ngày này
                        </Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddCircle />} 
                          sx={{ mt: 2 }}
                          onClick={handleOpenDialog}
                        >
                          Đặt sân ngay
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      {/* Dialog đặt sân */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {isEditing ? <Edit /> : <AddCircle />}
            <Typography>{isEditing ? 'Sửa đặt sân' : 'Đặt sân mới'}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tên khách hàng"
                name="customerName"
                fullWidth
                value={formData.customerName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Person color="action" sx={{ mr: 1 }} />
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số điện thoại"
                name="phoneNumber"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>+84</span>
                }}
                placeholder="Nhập số điện thoại"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Chọn sân"
                name="fieldId"
                fullWidth
                value={formData.fieldId}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <SportsSoccer color="action" sx={{ mr: 1 }} />
                }}
                required
              >
                {fields.map(field => (
                  <MenuItem key={field._id} value={field._id}>
                    {field.name} - {field.type} ({field.price.toLocaleString('vi-VN')}đ/giờ)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Giờ bắt đầu"
                name="startTime"
                type="time"
                fullWidth
                value={formData.startTime}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <AccessTime color="action" sx={{ mr: 1 }} />
                }}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Giờ kết thúc"
                name="endTime"
                type="time"
                fullWidth
                value={formData.endTime}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <AccessTime color="action" sx={{ mr: 1 }} />
                }}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Trạng thái thanh toán"
                name="paymentStatus"
                fullWidth
                value={formData.paymentStatus}
                onChange={handleChange}
                required
              >
                <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                <MenuItem value="paid">Đã thanh toán</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ bgcolor: 'success.light', p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CurrencyExchange color="success" />
                  <Typography variant="subtitle1" color="success.dark">
                    Tổng tiền: <strong>{formData.totalAmount?.toLocaleString('vi-VN')}đ</strong>
                  </Typography>
                  {formData.startTime && formData.endTime && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      Thời gian thuê: {calculateDuration(formData.startTime, formData.endTime)}
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            startIcon={<DeleteOutline />}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSaveBooking} 
            variant="contained"
            startIcon={<Check />}
          >
            {isEditing ? 'Cập nhật đặt sân' : 'Xác nhận đặt sân'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Warning />
            <Typography>Xác nhận xóa đặt sân</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {deleteDialog.booking && (
            <Stack spacing={2}>
              <Typography>
                Bạn có chắc chắn muốn xóa đặt sân này?
              </Typography>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    Khách hàng: {deleteDialog.booking.userId?.fullname || deleteDialog.booking.name}
                  </Typography>
                  <Typography variant="subtitle2">
                    Sân: {deleteDialog.booking.fieldId?.name}
                  </Typography>
                  <Typography variant="subtitle2">
                    Thời gian: {deleteDialog.booking.startTime} - {deleteDialog.booking.endTime}
                  </Typography>
                  <Typography variant="subtitle2">
                    Ngày: {formatDisplayDate(deleteDialog.booking.date)}
                  </Typography>
                </Stack>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteOutline />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thông báo trùng lịch */}
      <Dialog
        open={conflictDialog.open}
        onClose={() => setConflictDialog({ open: false, conflicts: [] })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Warning />
            <Typography>Lịch đặt sân bị trùng</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography gutterBottom>
            Không thể đặt sân vì đã có lịch đặt trùng thời gian:
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {conflictDialog.conflicts.map((conflict, index) => (
              <Card key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    Khách hàng: {conflict.customer}
                  </Typography>
                  <Typography variant="subtitle2">
                    Sân: {conflict.field}
                  </Typography>
                  <Typography variant="subtitle2">
                    Thời gian: {conflict.time}
                  </Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setConflictDialog({ open: false, conflicts: [] })}
            variant="contained"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thông báo */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}