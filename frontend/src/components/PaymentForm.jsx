import React, { use, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Grid,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SportsSoccer as SportsSoccerIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  MonetizationOn as MonetizationOnIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

function PaymentForm({ onSubmit, customerInfo }) {
  const location = useLocation();
  const navigate = useNavigate();
  console.log("customerInfo",customerInfo._id)

  const { formData, extraData } = location.state || {};
  const { date, startTime, endTime, fieldType } = formData || {};
  const { userId, note } = extraData || {};
  const locationState = location.state || {};  // Đảm bảo state có giá trị hợp lệ
  console.log("locationState",locationState);
  console.log("userId",userId)

  // States
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const totalAmount = customerInfo.price * calculateHours(startTime, endTime);
  const hours = calculateHours(startTime, endTime);

  // Tính số giờ giữa startTime và endTime
  function calculateHours(start, end) {
    if (!start || !end) return 1;
    
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Nếu endTime < startTime, giả định đó là ngày hôm sau
    const diffMinutes = endMinutes >= startMinutes 
      ? endMinutes - startMinutes 
      : (24 * 60 - startMinutes) + endMinutes;
    
    return Math.round((diffMinutes / 60) * 2) / 2; // Làm tròn đến 0.5 giờ
  }

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Đầu tiên tạo booking
      const bookingResponse = await axios.post('http://localhost:4000/api/bookings', {
        fieldId: customerInfo._id, // ID của sân bóng
        userId, // ID của người dùng đang đăng nhập
        date,
        startTime,
        endTime,
        totalAmount,
        fieldType,
        paymentMethod,
      });

      console.log("bookingResponse",bookingResponse.data.booking._id)
      const bookingId = bookingResponse.data.booking._id;

      if (paymentMethod === 'vnpay') {
        // Gọi API tạo URL thanh toán VNPAY
        const paymentResponse = await axios.post('http://localhost:4000/api/payment/create_payment_url', {
          bookingId,
          amount: totalAmount,
        });

        // Chuyển hướng đến trang thanh toán VNPAY
        if (paymentResponse.data.code === '00') {
          window.location.href = paymentResponse.data.data;
        } else {
          setError('Có lỗi xảy ra khi tạo URL thanh toán!');
        }
      } else {
        // Thanh toán tại sân - hiển thị thông báo thành công
        setActiveStep(1);
        setSuccessDialogOpen(true);
      }
    } catch (err) {
      console.error('Lỗi khi đặt sân:', err);
      setError('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    // Quay về trang chủ
    navigate('/');
  };

  // Nếu không có thông tin cần thiết
  if (!customerInfo._id || !customerInfo.date || !startTime || !endTime) {
    console.log("customerInfo",customerInfo._id)
    console.log("customerInfo",customerInfo.date)
    console.log("customerInfo",startTime)
    console.log("customerInfo",endTime)
    console.error('Thiếu thông tin đặt sân:', customerInfo._id); 
    return (
      <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
        <Alert severity="error">
          Thiếu thông tin đặt sân. Vui lòng quay lại trang tìm kiếm.
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/search-results')}
          >
            Quay lại trang tìm kiếm
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
      {/* Header với tiêu đề và nút quay lại */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={handleGoBack}
          sx={{ mr: 2, bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Xác nhận đặt sân
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        <Step>
          <StepLabel>Chọn hình thức thanh toán</StepLabel>
        </Step>
        <Step>
          <StepLabel>Hoàn tất đặt sân</StepLabel>
        </Step>
      </Stepper>

      {/* Thông tin sân bóng */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {customerInfo.name || 'Sân bóng đá mini'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Quận Cầu Giấy, Hà Nội
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {startTime} - {endTime} ({date})
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SportsSoccerIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {fieldType}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {customerInfo.price.toLocaleString()}VNĐ
            </Typography>
            <Typography variant="body2">
              {customerInfo.price.toLocaleString()} VNĐ/giờ × {hours} giờ
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Form chọn phương thức thanh toán */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Chọn hình thức thanh toán
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <RadioGroup
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: paymentMethod === 'cash' ? 'primary.main' : 'grey.300',
              bgcolor: paymentMethod === 'cash' ? 'primary.50' : 'transparent'
            }}
          >
            <FormControlLabel 
              value="cash" 
              control={<Radio color="primary" />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon color="success" sx={{ mr: 1 }} />
                  <Typography fontWeight="medium">Thanh toán tại sân</Typography>
                </Box>
              }
            />
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: paymentMethod === 'vnpay' ? 'primary.main' : 'grey.300',
              bgcolor: paymentMethod === 'vnpay' ? 'primary.50' : 'transparent'
            }}
          >
            <FormControlLabel 
              value="vnpay" 
              control={<Radio color="primary" />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardIcon color="info" sx={{ mr: 1 }} />
                  <Typography fontWeight="medium">Thanh toán qua VNPAY</Typography>
                </Box>
              }
            />
          </Paper>
        </RadioGroup>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tổng thanh toán
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {totalAmount.toLocaleString()} VNĐ
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AttachMoneyIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </Button>
        </Box>
      </Paper>

      {/* Dialog xác nhận đặt sân thành công */}
      <Dialog 
        open={successDialogOpen} 
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Box component="div" sx={{ typography: 'h5', fontWeight: 'bold' }}>
            Đặt sân thành công!
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" align="center" paragraph>
            Bạn đã đặt sân thành công. Vui lòng đến sân trước 15 phút để hoàn tất thanh toán.
          </Typography>
          
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Thông tin đặt sân:
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Sân:</strong> {customerInfo.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Thời gian:</strong> {date}, {startTime} - {endTime}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Số tiền:</strong> {totalAmount.toLocaleString()} VNĐ
            </Typography>
            <Typography variant="body1">
              <strong>Phương thức thanh toán:</strong> {paymentMethod === 'cash' ? 'Thanh toán tại sân' : 'VNPAY'}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleCloseSuccessDialog}
            sx={{ 
              px: 4, 
              py: 1, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Về trang chủ
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PaymentForm