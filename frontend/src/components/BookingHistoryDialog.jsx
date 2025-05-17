import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Paper, Grid, Chip, CircularProgress
} from '@mui/material';

const BookingHistoryDialog = ({ open, loading, bookings, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Lịch sử đặt sân của bạn</DialogTitle>
    <DialogContent dividers>
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
          Bạn chưa có lịch sử đặt sân nào.
        </Typography>
      ) : (
        <Box>
          {bookings.map((b, idx) => (
            <Paper key={b._id || idx} sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="primary">Sân:</Typography>
                  <Typography fontWeight="bold">{b.fieldId?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Ngày:</Typography>
                  <Typography>{b.date}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Giờ:</Typography>
                  <Typography>{b.startTime} - {b.endTime}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Loại sân:</Typography>
                  <Typography>{b.fieldId?.type || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Thành tiền:</Typography>
                  <Typography color="success.main" fontWeight="bold">{b.totalAmount?.toLocaleString('vi-VN')}đ</Typography>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">Thanh toán:</Typography>
                  <Chip label={b.paymentMethod === 'vnpay' ? 'VNPAY' : 'Tại sân'} color={b.paymentMethod === 'vnpay' ? 'info' : 'default'} size="small" />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">Đóng</Button>
    </DialogActions>
  </Dialog>
);

export default BookingHistoryDialog;
