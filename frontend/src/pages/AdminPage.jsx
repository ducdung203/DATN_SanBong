import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Paper, 
  Toolbar, 
  Typography, 
  InputBase, 
  Avatar, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Button,
  Divider,
  Fade,
  styled,
  alpha
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import InventoryIcon from '@mui/icons-material/Inventory';

import Account from '../components/admin/account.jsx'; // Import component for account management
import Field from '../components/admin/field.jsx'; // Import component for field management
import AdminBooking from '../components/admin/booking.jsx';
import Dashboard from '../components/admin/dashboard.jsx';
import Device from '../components/admin/device.jsx'; // Import component for reports

// Drawer width (giảm xuống để giúp phần content rộng hơn)
const drawerWidth = 240;
const collapsedDrawerWidth = 60; // Giảm kích thước drawer khi đóng

// Styled search bar
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  border: '1px solid #e0e0e0',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#757575',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fadeIn, setFadeIn] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token
    window.location.reload(); // Tải lại trang
  };

  const changeTab = (tabId) => {
    setFadeIn(false);
    setTimeout(() => {
      setActiveTab(tabId);
      setFadeIn(true);
    }, 300);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <HomeIcon /> },
    { id: 'booking', label: 'Đặt sân', icon: <CalendarMonthIcon /> },
    { id: 'field', label: 'Sân bóng', icon: <SportsSoccerIcon /> },
    { id: 'device', label: 'Thiết bị', icon: <InventoryIcon /> },
    { id: 'account', label: 'Tài khoản', icon: <ManageAccountsIcon /> },
  ];

 
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard/>;
      case 'booking':
        return <AdminBooking/>;
      case 'field':
        return <Field/>;
      case 'device':
        return <Device/>;
      case 'account':
        return <Account/>
      default:
        return <Dashboard/>;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1,
          width: '100%'
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleMenu}
            edge="start"
            sx={{ mr: 1 }}
          >
            {isMenuOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
          >
            Quản Lý Sân Bóng
          </Typography>
          
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Xin chào,
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                Admin
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: isMenuOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMenuOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            bgcolor: '#1a237e', // Deep blue color
            color: 'white'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => changeTab(item.id)}
                  sx={{
                    padding: isMenuOpen ? '8px 16px' : '8px 14px',
                    borderRadius: isMenuOpen ? '0 20px 20px 0' : '50%',
                    ml: isMenuOpen ? 0 : '4px',
                    mr: isMenuOpen ? 0 : '4px',
                    justifyContent: isMenuOpen ? 'initial' : 'center',
                    bgcolor: activeTab === item.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: isMenuOpen ? 40 : 24 }}>
                    {item.icon}
                  </ListItemIcon>
                  {isMenuOpen && <ListItemText primary={item.label} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', my: 2 }} />
          
          <ListItem disablePadding sx={{ position: 'absolute', bottom: 16, width: '100%' }}>
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                padding: isMenuOpen ? '8px 16px' : '8px 14px',
                borderRadius: isMenuOpen ? '0 20px 20px 0' : '50%',
                ml: isMenuOpen ? 0 : '4px',
                mr: isMenuOpen ? 0 : '4px',
                justifyContent: isMenuOpen ? 'initial' : 'center',
                color: '#f44336',
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.12)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#f44336', minWidth: isMenuOpen ? 40 : 24 }}>
                <LogoutIcon />
              </ListItemIcon>
              {isMenuOpen && <ListItemText primary="Đăng xuất" />}
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>
      
      {/* Main content */} 
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2 }, // Giảm padding để có thêm không gian
          bgcolor: '#f5f5f5',
          overflow: 'auto',
          width: isMenuOpen 
            ? `calc(100% - ${drawerWidth}px)` 
            : `calc(100% - ${collapsedDrawerWidth}px)`,
          ml: isMenuOpen ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
          transition: 'margin-left 0.3s ease, width 0.3s ease',
          mt: 8 // Space for AppBar
        }}
      >
        <Fade in={fadeIn} timeout={300}>
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            {renderContent()}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default AdminPage;