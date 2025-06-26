import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemText,
  useMediaQuery,
  ListItemButton,
  ListItem,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = !user
    ? [
        { text: 'Přihlášení', to: '/login' },
        { text: 'Registrace', to: '/register' },
      ]
    : [
        { text: 'Profil', to: '/profile' },
        { text: 'Odhlásit se', to: '/login', onClick: handleLogout },
      ];

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#2f6c3a',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              color: '#fff',
              fontSize: '1.5rem',
            }}
          >
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Kosmetika Petra
            </Link>
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={() => setOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                  sx: {
                    width: 220,
                    backgroundColor: '#f9f7f4',
                    p: 2,
                  },
                }}
              >
                <List>
                  {links.map((link) => (
                    <ListItem disablePadding key={link.text}>
                      <ListItemButton
                        component={Link}
                        to={link.to}
                        onClick={() => {
                          setOpen(false);
                          if (link.onClick) link.onClick();
                        }}
                      >
                        <ListItemText primary={link.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            </>
          ) : (
            <Box>
              {links.map((link) => (
                <Button
                  key={link.text}
                  component={Link}
                  to={link.to}
                  onClick={link.onClick}
                  sx={{
                    color: '#fff',
                    border: '1px solid transparent',
                    mx: 1,
                    '&:hover': {
                      borderColor: '#c8aa3d',
                      backgroundColor: '#285a33',
                    },
                  }}
                >
                  {link.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;