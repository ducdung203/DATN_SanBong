import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { Error as ErrorIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Thanh toán thất bại!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Thử lại
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

export default PaymentFailed;