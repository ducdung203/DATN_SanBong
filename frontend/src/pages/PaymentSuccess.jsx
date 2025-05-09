import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const navigate = useNavigate();

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
        
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{
            mt: 3,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Về trang chủ
        </Button>
      </Paper>
    </Container>
  );
}

export default PaymentSuccess;