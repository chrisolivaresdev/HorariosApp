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
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Menu as MenuIcon, Home, Book, Person, School } from "@mui/icons-material"
import { motion } from "framer-motion"
import { Routes, Route, useNavigate } from "react-router-dom"
import Periodos from "./Periodos"
import Asignaturas from "./Asignaturas"
import Profesores from "./Profesores"
import Carreras from "./Carreras"

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const menuItems = [
    { text: "Periodos", icon: <Home />, path: "/" },
    { text: "Asignaturas", icon: <Book />, path: "/asignaturas" },
    { text: "Profesores", icon: <Person />, path: "/profesores" },
    { text: "Carreras", icon: <School />, path: "/carreras" },
  ]

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Horarios
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
        sx={{
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar /> {/* This pushes the list below the AppBar */}
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
        <Toolbar /> {/* This pushes the content below the AppBar */}
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Periodos />} />
            <Route path="/asignaturas" element={<Asignaturas />} />
            <Route path="/profesores" element={<Profesores />} />
            <Route path="/carreras" element={<Carreras />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

export default Dashboard

