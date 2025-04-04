"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material"
import { motion } from "framer-motion"
import { LockOutlined } from "@mui/icons-material"
import axiosInstance from "../axios/axiosInstance"
import Swal from "sweetalert2"

// Estilos reutilizables
const containerStyles = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: (theme: any) => theme.palette.grey[100],
}

const paperStyles = {
  padding: 4,
  width: "100%",
  maxWidth: 400,
}

const boxStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}

// Función para manejar el inicio de sesión
const handleLogin = async (
  username: string,
  password: string,
  navigate: (path: string, options?: { replace: boolean }) => void
) => {
  const data = { username, password }
  const ruta = username.toLowerCase() === "admin" ? "/auth/login/admin" : "/auth/login"

  try {
    const response = await axiosInstance.post(ruta, data)

    // Guardar token y rol en localStorage
    localStorage.setItem("token", response.data.access_token)
    localStorage.setItem("role", response.data.role)

    Swal.fire({
      title: "¡Bien!",
      text: "Has iniciado sesión correctamente.",
      icon: "success",
    })

    // Redirigir según el rol
    const role = response.data.role
    navigate(role === "ADMIN" ? "/user-management" : "/", { replace: true })


  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Ocurrió un error al intentar iniciar sesión."
    Swal.fire({
      title: "¡Error!",
      text: errorMessage,
      icon: "error",
    })
    console.error("Error:", error)
  }
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    handleLogin(username, password, navigate)
  }

  return (
    <Container
      component={motion.main}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      maxWidth={false}
      sx={containerStyles}
    >
      <Paper elevation={6} sx={paperStyles}>
        <Box sx={boxStyles}>
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