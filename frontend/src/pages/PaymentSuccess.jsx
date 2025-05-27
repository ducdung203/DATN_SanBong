import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Home as HomeIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      // Lấy thông tin đặt sân
      axios.get(`http://localhost:4000/api/bookings/${bookingId}`)
        .then(response => {
          setBooking(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Lỗi khi lấy thông tin đặt sân:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Thanh toán thành công!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Cảm ơn bạn đã đặt sân. Chúng tôi đã ghi nhận thông tin đặt sân của bạn.
        </Typography>

        {booking && (
          <Box sx={{ mt: 3, mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Thông tin đặt sân:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Sân:</strong> {booking.fieldId?.name}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Ngày:</strong> {booking.date}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Thời gian:</strong> {booking.startTime} - {booking.endTime}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Số tiền:</strong> {booking.totalAmount?.toLocaleString('vi-VN')}đ
            </Typography>
            <Typography variant="body2">
              <strong>Mã giao dịch VNPAY:</strong> {booking.vnpayTransactionId}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate('/booking-history')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Xem lịch sử đặt sân
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PaymentSuccess;