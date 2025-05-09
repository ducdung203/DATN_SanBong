import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Tooltip, Alert, Snackbar,
  Avatar, Chip, Divider, Container, useTheme
} from '@mui/material';
import { 
  Edit, Delete, PersonAdd, Check, Cancel, 
  Email as EmailIcon, AccountCircle, Lock, Phone
} from '@mui/icons-material';

// Hàm tạo avatar từ tên người dùng
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Cập nhật hàm stringAvatar để xử lý trường hợp name không tồn tại
const stringAvatar = (name = 'Người dùng') => {
  const nameParts = name.split(' ');
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`,
  };
};

export default function Account() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ fullname: '', email: '', password: '', phone: '', role: 'user' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Lấy danh sách người dùng từ backend
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách người dùng:', err);
      showSnackbar('Lỗi khi lấy danh sách người dùng!', 'error');
    }
  }, []); // Đảm bảo fetchUsers không thay đổi giữa các lần render

  // Thêm hoặc chỉnh sửa người dùng
  const handleSave = async () => {
    if (!validateForm()) return;
    console.log('Dữ liệu gửi đi:', formData); // Log dữ liệu gửi đi


    try {
      if (editingUser) {
        // Chỉnh sửa người dùng
        const response = await axios.put(`http://localhost:4000/api/users/${editingUser._id}`, formData);
        setUsers(users.map(u => (u._id === editingUser._id ? response.data.user : u)));
        showSnackbar('Cập nhật tài khoản thành công!');
      } else {
        // Thêm người dùng mới
        const response = await axios.post('http://localhost:4000/api/users', formData);
        setUsers([...users, response.data.user]);
        showSnackbar('Thêm tài khoản mới thành công!');
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Lỗi khi lưu tài khoản:', err);
      showSnackbar('Lỗi khi lưu tài khoản!', 'error');
    }
  };

  // Xóa người dùng
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setConfirmDialogOpen(false);
      showSnackbar('Xóa tài khoản thành công!', 'info');
    } catch (err) {
      console.error('Lỗi khi xóa tài khoản:', err);
      showSnackbar('Lỗi khi xóa tài khoản!', 'error');
    }
  };

  // Lấy danh sách người dùng khi component được mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Sử dụng fetchUsers ổn định làm phụ thuộc

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    setFormData(user || { fullname: '', email: '', password: '', phone: '', role: 'user' });
    setFormErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFormData({ fullname: '', email: '', password: '', phone: '', role: 'user' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when field is edited
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null
      });
    }
  };

  // Cập nhật hàm validateForm để xử lý lỗi trim()
  const validateForm = () => {
    const errors = {};

    if (!formData.fullname?.trim()) {
      errors.name = 'Tên không được để trống';
    }


    if (!formData.password?.trim()) {
      errors.password = 'Mật khẩu không được để trống';
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openConfirmDelete = (user) => {
    setUserToDelete(user);
    setConfirmDialogOpen(true);
  };


  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          mt: 3,
          background: `linear-gradient(to right bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Quản lý tài khoản
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              borderRadius: 2,
              boxShadow: 2,
              px: 2,
              py: 1
            }}
          >
            Thêm tài khoản
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người dùng</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vai trò</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar {...stringAvatar(user.fullname || 'Người dùng')} sx={{ mr: 2 }} />
                      <Typography variant="subtitle1">{user.fullname || 'Người dùng'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small"
                      color={user.role === 'Admin' ? 'primary' : 'default'}
                      variant={user.role === 'Admin' ? 'filled' : 'outlined'}
                      icon={<AccountCircle />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        onClick={() => handleOpenDialog(user)}
                        size="small"
                        sx={{ 
                          mr: 1,
                          backgroundColor: theme.palette.primary.lighter,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light,
                          }
                        }}
                      >
                        <Edit fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton 
                        onClick={() => openConfirmDelete(user)}
                        size="small"
                        sx={{ 
                          backgroundColor: theme.palette.error.lighter,
                          '&:hover': {
                            backgroundColor: theme.palette.error.light,
                          }
                        }}
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có người dùng nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog thêm/chỉnh sửa người dùng */}
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
              {editingUser ? <Edit sx={{ mr: 1 }} /> : <PersonAdd sx={{ mr: 1 }} />}
              <Typography variant="h6">
                {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 4 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Họ và tên"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              error={!!formErrors.fullname}
              helperText={formErrors.fullname}
              InputProps={{
                startAdornment: <AccountCircle color="action" sx={{ mr: 1 }} />
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: <Lock color="action" sx={{ mr: 1 }} />
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              InputProps={{
                startAdornment: <Phone color="action" sx={{ mr: 1 }} />
              }}
            />
            <TextField
              select
              fullWidth
              margin="normal"
              label="Vai trò"
              name="role"
              value={formData.role}
              onChange={handleChange}
              SelectProps={{
                native: true,
              }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
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
              {editingUser ? 'Lưu thay đổi' : 'Thêm người dùng'}
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
              Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete?.name}</strong>?
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