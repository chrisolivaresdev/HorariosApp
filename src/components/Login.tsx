"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material"
import { motion } from "framer-motion"
import { LockOutlined } from "@mui/icons-material"
import axiosInstance from "../axios/axiosInstance"
import Swal from "sweetalert2"


const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const data={
      username,
      password
    } 
    let ruta:string

    if(username.toLowerCase() === "admin") {
      ruta = '/auth/login/admin'
    }else {
      ruta = '/auth/login'
    }

    axiosInstance.post(ruta, data)
  .then(response => {
    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('role', response.data.role)

    if(localStorage.getItem('role') === 'ADMIN'){
      navigate("/user-management")
    }else {
      navigate("/")
    }
    Swal.fire({
      title: 'Bien!',
      text: 'has iniciado sesion corectamente.',
      icon: 'success',
    });

  })
  .catch(error => {
    Swal.fire({
      title: '¡Error!',
      text: 'Credenciales invalidas.',
      icon: 'error',
    });
    console.error('Error:', error);
  });
 
  }

  return (
    <Container
      component={motion.main}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      maxWidth={false}
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Paper elevation={6} sx={{ padding: 4, width: "100%", maxWidth: 400 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LockOutlined sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Iniciar sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Iniciar sesión
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login

