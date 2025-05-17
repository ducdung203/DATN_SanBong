import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const Dashboard = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statistics, setStatistics] = useState([
    { title: 'Tổng số sân', value: '-', icon: <SportsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />, bgColor: alpha(theme.palette.primary.main, 0.1) },
    { title: 'Lịch đặt hôm nay', value: '-', icon: <TodayIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />, bgColor: alpha(theme.palette.info.main, 0.1) },
    { title: 'Doanh thu hôm nay', value: '-', icon: <MoneyIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />, bgColor: alpha(theme.palette.success.main, 0.1) }
  ]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gọi API lấy dữ liệu dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:4000/api/dashboard/stats'),
          axios.get('http://localhost:4000/api/dashboard/today-bookings')
        ]);
        console.log('Thống kê:', statsRes);
        console.log('Lịch đặt hôm nay:', bookingsRes);
        const stats = statsRes.data;
        setStatistics([
          {
            title: 'Tổng số sân',
            value: stats.totalFields,
            icon: <SportsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />, bgColor: alpha(theme.palette.primary.main, 0.1)
          },
          {
            title: 'Lịch đặt hôm nay',
            value: stats.todayBookings,
            icon: <TodayIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />, bgColor: alpha(theme.palette.info.main, 0.1)
          },
          {
            title: 'Doanh thu hôm nay',
            value: stats.todayRevenue?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0đ',
            icon: <MoneyIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />, bgColor: alpha(theme.palette.success.main, 0.1)
          }
        ]);
        setTodayBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
        setError('Không thể tải dữ liệu dashboard!');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [theme.palette]);

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
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">Đang tải dữ liệu...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : todayBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có lịch đặt sân nào cho hôm nay
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                todayBookings.map((booking) => (
                  <TableRow 
                    key={booking._id || booking.id}
                    hover
                  >
                    <TableCell>
                      <Chip 
                        icon={<SportsIcon />} 
                        label={booking.fieldId?.name || 'N/A'} 
                        variant="outlined" 
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography>{booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : booking.time}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography>{booking.userId?.fullname || booking.name || 'N/A'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography>{booking.userId?.phone || booking.sdt || 'N/A'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MoneyIcon fontSize="small" color="success" />
                        <Typography fontWeight="medium" color="success.main">{booking.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || booking.totalAmount || '0đ'}</Typography>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;