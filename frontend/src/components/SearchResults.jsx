import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon, 
  LocationOn as LocationOnIcon,
  SportsSoccer as SportsSoccerIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import PaymentForm from './PaymentForm'; // Import component PaymentForm

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, extraData } = location.state || {};
  const { date, startTime, endTime, fieldType } = formData || {};
  const { userId, note } = extraData || {};
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [customerInfo, setCustomerInfo] = useState([]);


  useEffect(() => {
    console.log("userId",userId)
    // Kiểm tra nếu không có dữ liệu tìm kiếm
    if (!date || !startTime || !endTime || !fieldType) {
      setError('Thiếu thông tin tìm kiếm. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    // Gửi yêu cầu tìm kiếm đến backend
    setLoading(true);
    axios
      .post('http://localhost:4000/api/fields/search-fields', { date, startTime, endTime, fieldType })
      .then((response) => {
        const modifiedData = response.data.map(field => ({
          ...field,
          date: date, // thêm thuộc tính "date" vào mỗi field
        }));
        console.log("aaaa",modifiedData)
        setFields(modifiedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tìm kiếm sân:', err);
        setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
        setLoading(false);
      });
  }, [date, startTime, endTime, fieldType]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleFavorite = (fieldId) => {
    if (favorites.includes(fieldId)) {
      setFavorites(favorites.filter(id => id !== fieldId));
    } else {
      setFavorites([...favorites, fieldId]);
    }
  };

  const handleBooking = (field) => {
    setSelectedField(field);
    setPaymentDialogOpen(true);
    setCustomerInfo(field); 
  };

  const handlePaymentComplete = (paymentData) => {
    // Tạo đối tượng đặt sân với thông tin sân và thanh toán
    const bookingData = {
      fieldId: selectedField._id,
      date,
      startTime,
      endTime,
      paymentInfo: paymentData
    };
    
    // Thông thường bạn sẽ gửi dữ liệu này đến backend
    console.log('Dữ liệu đặt sân:', bookingData);
    
    // Đóng dialog và hiển thị xác nhận
    setPaymentDialogOpen(false);
    
    // Điều hướng đến trang xác nhận hoặc hiển thị thông báo thành công
    navigate('/booking-confirmation', { 
      state: { 
        booking: bookingData,
        field: selectedField
      } 
    });
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };

  // Tính thời gian đặt sân và tổng giá tiền
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    // Tính khoảng thời gian theo giờ (làm tròn đến 0.5 giờ)
    return Math.round((endTimeMinutes - startTimeMinutes) / 30) / 2;
  };

  const duration = calculateDuration();

  // Hiển thị loading
  if (loading) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center', py: 10 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tìm kiếm sân trống...</Typography>
      </Container>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
            Quay lại trang tìm kiếm
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Kết quả tìm kiếm
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`${date} • ${startTime} - ${endTime}`} 
                sx={{ bgcolor: 'white', color: 'primary.main' }} 
              />
              <Chip 
                icon={<SportsSoccerIcon />} 
                label={fieldType} 
                sx={{ bgcolor: 'white', color: 'primary.main' }} 
              />
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Quay lại
          </Button>
        </Box>
      </Paper>

      {fields.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SportsSoccerIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Không tìm thấy sân trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng thử lại với thời gian hoặc loại sân khác
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
          >
            Tìm kiếm lại
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid item xs={12} sm={6} md={4} key={field._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {field.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(field._id)}
                    >
                      {favorites.includes(field._id) ? 
                        <FavoriteIcon color="error" /> : 
                        <FavoriteBorderIcon />
                      }
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {field.location || 'Quận Cầu Giấy, Hà Nội'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SportsSoccerIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {field.type}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {field.hours || '08:00 - 22:00'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {field.price?.toLocaleString() || '300,000'} VNĐ/giờ
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      onClick={() => handleBooking(field)}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Đặt sân ngay
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Dialog Thanh Toán */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={handleClosePaymentDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box component="div" sx={{ typography: 'h6' }}>Thanh toán đặt sân</Box>
            <IconButton onClick={handleClosePaymentDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedField && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedField.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {date} • {startTime} - {endTime} ({duration} giờ)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SportsSoccerIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedField.type}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedField.location || 'Quận Cầu Giấy, Hà Nội'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      Tổng tiền: {((selectedField.price || 300000) * duration).toLocaleString()} VNĐ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}
          
          <PaymentForm 
            onSubmit={handlePaymentComplete} 
            customerInfo={customerInfo} // Truyền thông tin khách hàng vào PaymentForm
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default SearchResults;