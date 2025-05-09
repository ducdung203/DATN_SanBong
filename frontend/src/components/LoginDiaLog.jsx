import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Slide,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function LoginDialog({ open, onClose, onLoginSuccess }) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [registerError, setRegisterError] = useState('');

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue);
    setLoginError('');
    setRegisterError('');
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Hàm xử lý đăng nhập
  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setLoginError('');
    try {
      const res = await axios.post('http://localhost:4000/api/users/login', { email, password });
      const { token, role, fullname } = res.data;
      localStorage.setItem('token', token);
      onLoginSuccess( fullname , role, token);
      onClose();
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Đăng nhập thất bại!');
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!registerData.fullName || !registerData.email || !registerData.phone || !registerData.password) {
      setRegisterError('Vui lòng nhập đầy đủ thông tin đăng ký');
      return;
    }
  
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Mật khẩu xác nhận không khớp');
      return;
    }
  
    try {
      // Gọi API đăng ký
      await axios.post('http://localhost:4000/api/users/register', {
        email: registerData.email,
        password: registerData.password,
        role: 'user', // Mặc định là người dùng,
        fullname: registerData.fullName, // Gửi họ và tên
        phone: registerData.phone, // Gửi số điện thoại
        
      });
  
      // Hiển thị thông báo thành công
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
  
      // Chuyển sang tab đăng nhập
      setTabValue(0);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Đăng ký thất bại!');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="div" sx={{ typography: 'h5', fontWeight: 'bold', color: theme.palette.primary.main }}>
            {tabValue === 0 ? 'Đăng Nhập' : 'Đăng Ký'}
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Đăng Nhập" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label="Đăng Ký" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
          <TextField
            fullWidth
            margin="normal"
            label="Email hoặc Tên đăng nhập"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              Quên mật khẩu?
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              }
            }}
          >
            Đăng Nhập
          </Button>
          <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography sx={{ mx: 2 }}>Hoặc đăng nhập với</Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" startIcon={<FacebookIcon />} sx={{ color: '#1877F2', borderColor: '#1877F2' }}>
              Facebook
            </Button>
            <Button variant="outlined" startIcon={<GoogleIcon />} sx={{ color: '#DB4437', borderColor: '#DB4437' }}>
              Google
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {registerError && <Alert severity="error" sx={{ mb: 2 }}>{registerError}</Alert>}
          <TextField
            fullWidth
            margin="normal"
            label="Họ và tên"
            name="fullName"
            value={registerData.fullName}
            onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Số điện thoại"
            name="phone"
            value={registerData.phone}
            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Xác nhận mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Button fullWidth variant="contained" onClick={handleRegister} sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}>
            Đăng Ký
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
              Điều khoản dịch vụ
            </Typography>{' '}
            và{' '}
            <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
              Chính sách bảo mật
            </Typography>.
          </Typography>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
