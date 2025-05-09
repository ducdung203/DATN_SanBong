import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Chip,
  Stack, Divider, Avatar, Tooltip, useTheme, alpha, Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SportsSoccer as SportsIcon,
  Assessment as AssessmentIcon,
  Today as TodayIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Dữ liệu mẫu cho sân bóng
const fields = [
  { 
    id: 1, 
    name: 'Sân A', 
    type: 'Sân 5 người', 
    price: '300.000đ/giờ', 
    status: 'available',
    image: '/api/placeholder/60/60'
  },
  { 
    id: 2, 
    name: 'Sân B', 
    type: 'Sân 7 người', 
    price: '450.000đ/giờ', 
    status: 'booked',
    image: '/api/placeholder/60/60'
  },
  { 
    id: 3, 
    name: 'Sân C', 
    type: 'Sân 11 người', 
    price: '800.000đ/giờ', 
    status: 'maintenance',
    image: '/api/placeholder/60/60'
  },
  { 
    id: 4, 
    name: 'Sân D', 
    type: 'Sân 5 người', 
    price: '300.000đ/giờ', 
    status: 'available',
    image: '/api/placeholder/60/60'
  },
  { 
    id: 5, 
    name: 'Sân E', 
    type: 'Sân 7 người', 
    price: '450.000đ/giờ', 
    status: 'available',
    image: '/api/placeholder/60/60'
  }
];

// Dữ liệu mẫu cho lịch đặt sân hôm nay
const todayBookings = [
  { 
    id: 1, 
    field: 'Sân A', 
    time: '08:00 - 09:30', 
    customer: 'Nguyễn Văn A', 
    phone: '0901234567',
    totalAmount: '450.000đ',
    paymentStatus: 'paid' // đã thanh toán
  },
  { 
    id: 2, 
    field: 'Sân B', 
    time: '15:00 - 16:30', 
    customer: 'Trần Văn B', 
    phone: '0912345678',
    totalAmount: '675.000đ',
    paymentStatus: 'pending' // chưa thanh toán
  },
  { 
    id: 3, 
    field: 'Sân D', 
    time: '19:00 - 20:30', 
    customer: 'Lê Văn C', 
    phone: '0923456789',
    totalAmount: '450.000đ',
    paymentStatus: 'paid' // đã thanh toán
  }
];

const Dashboard = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Thống kê
  const statistics = [
    {
      title: "Tổng số sân",
      value: "5",
      icon: <SportsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      title: "Lịch đặt hôm nay",
      value: "3",
      icon: <TodayIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
    {
      title: "Doanh thu hôm nay",
      value: "2.350.000đ",
      icon: <MoneyIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      bgColor: alpha(theme.palette.success.main, 0.1),
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          mb: 4,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Tổng quan sân bóng
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý thông tin sân bóng và lịch đặt sân
          </Typography>

          {/* Hiển thị thời gian hiện tại */}
          <Card 
            sx={{ 
              mt: 2, 
              display: 'inline-flex',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              px: 2, 
              py: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}>
              <ScheduleIcon color="primary" sx={{ mr: 1 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {currentTime.toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statistics.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: stat.bgColor
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight="medium">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Lịch đặt sân hôm nay */}
      <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            py: 2, 
            px: 3, 
            bgcolor: 'info.main', 
            color: 'info.contrastText',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <TodayIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            Lịch đặt sân hôm nay
          </Typography>
        </Box>
        <Divider />
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sân</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái thanh toán</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todayBookings.map((booking) => (
                <TableRow 
                  key={booking.id}
                  hover
                >
                  <TableCell>
                    <Chip 
                      icon={<SportsIcon />} 
                      label={booking.field} 
                      variant="outlined" 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography>{booking.time}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography>{booking.customer}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography>{booking.phone}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MoneyIcon fontSize="small" color="success" />
                      <Typography fontWeight="medium" color="success.main">{booking.totalAmount}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {booking.paymentStatus === 'paid' ? (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Đã thanh toán" 
                        color="success" 
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    ) : (
                      <Chip 
                        icon={<TimeIcon />} 
                        label="Chưa thanh toán" 
                        color="warning" 
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" color="primary" sx={{ boxShadow: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" sx={{ boxShadow: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {todayBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có lịch đặt sân nào cho hôm nay
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;