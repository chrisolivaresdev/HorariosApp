import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
} from "@mui/material"
import { Menu as MenuIcon, Home } from "@mui/icons-material"
import { motion } from "framer-motion"
import Periodos from "./Periodos"

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const menuItems = [{ text: "Periodos", icon: <Home />, path: "/" }]

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Horarios Universitarios
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={toggleDrawer}
              sx={{
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component={motion.main}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5 }}
        sx={{ flexGrow: 1, p: 3, mt: 8 }}
      >
        <Container maxWidth="lg">
          <Periodos />
        </Container>
      </Box>
    </Box>
  )
}

export default Dashboard

