import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom right, #fce4ec, #f3e5f5)`,
        backgroundImage: `url(https://www.transparenttextures.com/patterns/soft-wallpaper.png)`,
        backgroundRepeat: 'repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Vítejte v salonu krásy 💅
          </Typography>
          <Typography variant="body1" gutterBottom>
            Dopřejte si chvíli pro sebe. Přihlaste se nebo si vytvořte účet a rezervujte si termín pohodlně online.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" component={Link} to="/login">
              Přihlásit se
            </Button>
            <Button variant="outlined" component={Link} to="/register">
              Registrovat se
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}