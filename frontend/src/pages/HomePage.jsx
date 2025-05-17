import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  TextField, MenuItem, Select, FormControl, InputLabel,
  useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Paper, Grid, Card, CardContent, CardMedia,
  Divider, Chip, Avatar, Badge, Tooltip, Snackbar
} from '@mui/material';

// Material icons
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import ContactsIcon from '@mui/icons-material/Contacts';
import HistoryIcon from '@mui/icons-material/History';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Alert } from '@mui/material';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import LoginDialog from '../components/LoginDiaLog';
import AdminPage from './AdminPage';
import BookingHistoryDialog from '../components/BookingHistoryDialog';


function HomePage() {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    fieldType: '',
  });

  const [userInfo, setUserInfo] = useState(null);



  const [openDialog, setOpenDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleSearch = () => {
    const { date, startTime, endTime, fieldType } = formData;

    if (!currentUser) {
      setOpenDialog(true); // Hiển thị form đăng nhập nếu chưa đăng nhập
      return;
    }

    if (!date || !startTime || !endTime || !fieldType) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin tìm kiếm!',
        severity: 'error',
      });
      return;
    }

    console.log('Tìm kiếm sân với dữ liệu:', formData);
    console.log("userId",userInfo._id)
    navigate('/search-results', {
      state: {
        formData,
        extraData: { userId: userInfo._id, note: 'Id người dùng' },
      },
    }); // Chuyển hướng đến trang kết quả
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const [role, setRole] = useState(null); // Lưu vai trò người dùng

  const [currentUser, setCurrentUser] = useState(null); // Lưu thông tin người dùng
   
  const [anchorEl, setAnchorEl] = useState(null); // Quản lý trạng thái menu
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Lưu vị trí của phần tử được bấm
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Đóng menu
  };

  const handleLogout = () => {
    setCurrentUser(null); // Xóa thông tin người dùng
    setRole(null); // Xóa vai trò
    localStorage.removeItem('token'); // Xóa token khỏi localStorage
    handleMenuClose(); // Đóng menu
  };

  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    axios
      .get('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const { user, role } = response.data;
        console.log('Thông tin người dùng:', user);
        setCurrentUser(user.fullname); // Lưu thông tin người dùng
        setUserInfo(user);
        console.log('id người dùng:', user._id);
        setRole(role); // Lưu vai trò
      })
      .catch((err) => {
        console.error('Xác thực token thất bại:', err);
        localStorage.removeItem('token'); // Xóa token nếu không hợp lệ
      })
      .finally(() => {
        setLoading(false); // Kết thúc tải dữ liệu
      });
  } else {
    setLoading(false); // Không có token, kết thúc tải dữ liệu
  }
}, []);

const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
const [bookingHistory, setBookingHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);

const handleOpenHistoryDialog = async () => {
  if (!userInfo?._id) {
    setSnackbar({
      open: true,
      message: 'Bạn cần đăng nhập để xem lịch sử đặt sân!',
      severity: 'warning',
    });
    return;
  }
  setHistoryDialogOpen(true);
  setHistoryLoading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://localhost:4000/api/bookings/user/${userInfo._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookingHistory(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    setBookingHistory([]);
    setSnackbar({
      open: true,
      message: 'Không thể tải lịch sử đặt sân!',
      severity: 'error',
    });
  } finally {
    setHistoryLoading(false);
  }
};

const handleCloseHistoryDialog = () => {
  setHistoryDialogOpen(false);
};


  const handleLoginSuccess = (user, userRole, token) => {
    setRole(userRole);
    setCurrentUser(user); // Lưu thông tin người dùng sau khi đăng nhập
    
    localStorage.setItem('token', token); // Lưu token vào localStorage
  };

   // Đóng snackbar
   const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  if (role === 'admin') {
    return <AdminPage />;
  }
  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading khi đang tải dữ liệu
  }
  return (
    <Box sx={{
    overflowY: 'hidden',
    width: '100%',
    height: '100%',
    '& > *': {
    overflow: 'hidden', // Áp dụng cho các phần tử con
  },
    }} >
      {/* Header */}
      <AppBar position="fixed" sx={{ 
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        
      }}>
        <Toolbar>
          {isMobile && (
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              onClick={toggleMobileMenu}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SportsSoccerIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Sân Bóng Thành Thái
            </Typography>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color="inherit" startIcon={<HomeIcon />}>Trang Chủ</Button>
              <Button color="inherit" startIcon={<HistoryIcon />} onClick={handleOpenHistoryDialog}>Sân Đã Đặt</Button>
              <Tooltip title="Thông báo">
                <IconButton color="inherit">
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {currentUser ? (
            <>
            
            <Typography
              variant="contained"
              onClick={handleMenuOpen} // Mở menu khi bấm vào
              sx={{
                ml: 2,
                fontWeight: 'bold',
                color: '#success', // Chữ trắng
                backgroundColor: '#4caf50', // Xanh lá cây Material UI (tông chính)
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                }
              }}
            >
          
              Xin chào, {currentUser}
            </Typography>
              {/* Menu hiển thị khi bấm vào */}
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 2,
                    boxShadow: '0px 5px 15px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    '&:hover': { 
                      bgcolor: 'rgba(239, 83, 80, 0.08)' 
                    }
                  }}
                >
                  <ExitToAppIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1.5,
                      color: 'error.main'
                    }} 
                  />
                  <Typography 
                    variant="body1"
                    sx={{ fontWeight: 'medium' }}
                  >
                    Đăng xuất
                  </Typography>
                </MenuItem>
              </Menu>
            </>
) : (
  <Button 
    variant="contained" 
    color="success" 
    sx={{ 
      ml: 2,
      borderRadius: '20px',
      textTransform: 'none',
      fontWeight: 'bold',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      '&:hover': {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      }
    }}
    onClick={handleOpenDialog}
  >
    Đăng Nhập
  </Button>
)}
          
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
      >
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleMobileMenu}>
          <List>
            <ListItem sx={{ backgroundColor: theme.palette.primary.main, color: 'white', py: 2 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <SportsSoccerIcon />
              </ListItemIcon>
              <ListItemText primary="Sân Bóng Thành Thái" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Trang Chủ" />
            </ListItem>
            <ListItem button>
              <ListItemIcon><ContactsIcon /></ListItemIcon>
              <ListItemText primary="Liên Hệ" />
            </ListItem>
            <ListItem button onClick={handleOpenHistoryDialog}>
              <ListItemIcon><HistoryIcon /></ListItemIcon>
              <ListItemText primary="Sân đã đặt" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Thông Báo" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Toolbar offset */}
      <Toolbar />

      {/* Hero Banner */}
      <Box sx={{ 
        backgroundColor: '#f5f5f5',
        pt: 4, 
        pb: 6,
        background: 'linear-gradient(to bottom, #e3f2fd, #ffffff)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  color: theme.palette.primary.main,
                  mb: 2
                }}>
                  Đặt Sân Bóng Online
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  Hệ thống đặt sân bóng trực tuyến hiện đại, nhanh chóng và tiện lợi. 
                  Dễ dàng tìm kiếm và đặt sân theo thời gian mong muốn.
                </Typography>
                
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                borderRadius: 3, 
                overflow: 'hidden', 
                height: { xs: '300px', md: '400px' },
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
              }}>
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop
                  autoplay={{ delay: 4000 }}
                  pagination={{ clickable: true }}
                  navigation
                  style={{ width: '100%', height: '100%' }}
                >
                  <SwiperSlide>
                    <img
                      src="https://tinphatsports.vn/wp-content/uploads/2023/10/kich-thuoc-san-bong-da-chuan-fifa.jpg"
                      alt="Football Field"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://source.unsplash.com/featured/?soccer"
                      alt="Soccer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      src="https://source.unsplash.com/featured/?sports-field"
                      alt="Sports Field"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </SwiperSlide>
                </Swiper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Dialog Đăng Nhập/Đăng Ký */}
      <LoginDialog open={openDialog} onClose={handleCloseDialog} onLoginSuccess={handleLoginSuccess} />

      {/* Tìm kiếm sân */}
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        <Box sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #e3f2fd, #ffffff)',
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2), 0px -8px 20px rgba(0, 0, 0, 0.2)', // thay cho elevation
        }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            mb: 3
          }}>
            <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Tìm và Đặt Sân Ngay
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <TextField
              name="date"
              label="Ngày đặt sân"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                flex: 1, 
                minWidth: '200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
             <TextField
              name="startTime"
              label="Giờ bắt đầu"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: 300 // Hiển thị giờ và phút (5 phút interval)
              }}
              inputFormat="HH:mm"
              sx={{ 
                flex: 1, 
                minWidth: '150px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              name="endTime"
              label="Giờ kết thúc"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: 300 // Hiển thị giờ và phút (5 phút interval)
              }}
              inputFormat="HH:mm"
              sx={{ 
                flex: 1, 
                minWidth: '150px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl sx={{ flex: 1, minWidth: '200px' }}>
              <InputLabel>Loại sân</InputLabel>
              <Select
                name="fieldType"
                value={formData.fieldType}
                onChange={handleChange}
                label="Loại sân"
                sx={{ 
                  borderRadius: 2,
                }}
              >
                <MenuItem value="5 người">Sân 5 người</MenuItem>
                <MenuItem value="7 người">Sân 7 người</MenuItem>
                <MenuItem value="11 người">Sân 11 người</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color="success" 
              size="large"
              onClick={handleSearch}
              endIcon={<SearchIcon />}
              sx={{ 
                borderRadius: '30px',
                px: 4,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0px 4px 8px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0px 6px 12px rgba(76, 175, 80, 0.5)',
                }
              }}
            >
              Tìm Sân Trống
            </Button>
          </Box>
        </Box>
      </Container>
      {/* Lợi ích */}
      <Box sx={{ 
        mt: 20,
        backgroundColor: '#f5f5f5',
        py: 6,
        background: 'linear-gradient(to bottom, #ffffff, #e3f2fd)'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            mb: 5
          }}>
            Tại Sao Chọn Chúng Tôi?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                textAlign: 'center',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Box sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AccessTimeIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Đặt Sân Nhanh Chóng
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tiết kiệm thời gian với hệ thống đặt sân trực tuyến
                  dễ dàng và nhanh chóng chỉ trong vài phút.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                textAlign: 'center',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Box sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <SportsSoccerIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Chất Lượng Sân Bóng
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Hệ thống sân bóng chất lượng cao, được bảo trì thường xuyên
                  đảm bảo trải nghiệm chơi bóng tuyệt vời.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                textAlign: 'center',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Box sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <PhoneIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Hỗ Trợ 24/7
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Đội ngũ nhân viên hỗ trợ tận tình, sẵn sàng giải đáp
                  mọi thắc mắc của bạn bất cứ lúc nào.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        backgroundColor: '#1a237e',
        color: '#fff', 
        pt: 6,
        pb: 4
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SportsSoccerIcon sx={{ fontSize: 32, mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Sân Bóng Thành Thái
                  </Typography>
                </Box>
                <Typography sx={{ mb: 2 }}>
                  Hệ thống đặt sân bóng trực tuyến nhanh chóng - tiện lợi - uy tín
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <WhatsAppIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Liên Hệ
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  128 Thành Thái, Phường 12, Quận 10, TP.HCM
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                   0988 888 888
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  sanbongthanhhai@gmail.com
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Giờ Hoạt Động
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Thứ Hai - Thứ Sáu</Typography>
                <Typography variant="body2">8:00 - 22:00</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Thứ Bảy - Chủ Nhật</Typography>
                <Typography variant="body2">7:00 - 23:00</Typography>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  sx={{ 
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Đặt Sân Ngay
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              © {new Date().getFullYear()} Sân Bóng Thành Thái. Tất cả các quyền được bảo lưu.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Snackbar */}
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

      {/* */}
      <BookingHistoryDialog
        open={historyDialogOpen}
        loading={historyLoading}
        bookings={bookingHistory}
        onClose={handleCloseHistoryDialog}
      />
    </Box>
  );
}

export default HomePage;