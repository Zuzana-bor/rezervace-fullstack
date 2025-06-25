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
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
              Rezervace
            </Link>
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={() => setOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <List sx={{ width: 200 }}>
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
                  color="inherit"
                  component={Link}
                  to={link.to}
                  onClick={link.onClick}
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
