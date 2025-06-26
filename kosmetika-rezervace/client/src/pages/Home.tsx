import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)', // výška okna mínus navbar
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: `linear-gradient(to bottom right, #f9f7f4, #ffffff)`,
        backgroundImage: `url(https://www.transparenttextures.com/patterns/paper-fibers.png)`,
        backgroundRepeat: 'repeat',
        px: 2,
        pt: 6, // vnitřní horní odsazení
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 32px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(6px)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontFamily: 'Playfair Display, serif', color: '#2f6c3a' }}
          >
            Vítejte v  Petra Jamborová 🌿
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: '1.1rem', color: '#555' }}
          >
            Dopřejte si chvíli pro sebe. Přihlaste se nebo si vytvořte účet a rezervujte si termín pohodlně online.
          </Typography>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              component={Link}
              to="/login"
              sx={{
                backgroundColor: '#2f6c3a',
                '&:hover': { backgroundColor: '#265a32' },
              }}
            >
              Přihlásit se
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/register"
              sx={{
                borderColor: '#c8aa3d',
                color: '#2f6c3a',
                '&:hover': {
                  borderColor: '#2f6c3a',
                  backgroundColor: '#f4f4f4',
                },
              }}
            >
              Registrovat se
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}