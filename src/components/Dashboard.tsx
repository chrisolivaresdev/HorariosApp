"use client"

import { useState, useContext } from "react"
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
  useTheme,
  Button,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Home,
  Book,
  Person,
  Brightness4,
  Brightness7,
  ExitToApp,
  SupervisorAccount,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import { Routes, Route, useNavigate } from "react-router-dom"
import Periodos from "./Periodos"
import Asignaturas from "./Asignaturas"
import Profesores from "./Profesores"
import Carreras from "./Carreras"
import UserManagement from "./UserManagement"
import { ColorModeContext } from "../App"
import Secciones from "./Secciones"



const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const theme = useTheme()
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const colorMode = useContext(ColorModeContext)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  let menuItems = [
  ]
  if (localStorage.getItem('role') === "ADMIN") {
    menuItems = [{ text: "User Management", icon: <SupervisorAccount />, path: "/user-management" }]
  }else {
    menuItems = [
      { text: "Periodos", icon: <Home />, path: "/" },
      { text: "Asignaturas", icon: <Book />, path: "/asignaturas" },
      { text: "Profesores", icon: <Person />, path: "/profesores" },
      { text: "Secciones", icon: <Person />, path: "/secciones" },
    ]
  }

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
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path)
                toggleDrawer()
              }}
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
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            {localStorage.getItem('role') === "ADMIN" && <Route path="/user-management" element={<UserManagement />} />}
            {localStorage.getItem('role') === "USER" &&
              <>
                <Route path="/" element={<Periodos />} />
                <Route path="/asignaturas" element={<Asignaturas />} />
                <Route path="/profesores" element={<Profesores />} />
                <Route path="/carreras" element={<Carreras />} />
                <Route path="/secciones" element={<Secciones />} />
             </>
            }
            
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

export default Dashboard

