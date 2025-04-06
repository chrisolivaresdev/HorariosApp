"use client"

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useState, useMemo, createContext, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import "./App.css"

// Contexto para el modo de color
export const ColorModeContext = createContext({ toggleColorMode: () => {} })

// Constantes para las rutas
const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
}

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => !!localStorage.getItem("token")

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to={ROUTES.LOGIN} replace />
}

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light")

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
      },
    }),
    []
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: {
                  main: "#1976d2",
                  light: "#42a5f5",
                  dark: "#1565c0",
                },
                secondary: {
                  main: "#dc004e",
                  light: "#ff4081",
                  dark: "#c51162",
                },
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
              }
            : {
                primary: {
                  main: "#90caf9",
                  light: "#e3f2fd",
                  dark: "#42a5f5",
                },
                secondary: {
                  main: "#f48fb1",
                  light: "#f8bbd0",
                  dark: "#c2185b",
                },
                background: {
                  default: "#303030",
                  paper: "#424242",
                },
              }),
        },
        typography: {
          fontFamily: "Roboto, Arial, sans-serif",
          h1: {
            fontSize: "2.5rem",
            fontWeight: 500,
          },
          h2: {
            fontSize: "2rem",
            fontWeight: 500,
          },
          h3: {
            fontSize: "1.75rem",
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 8,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .05)",
              },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <RedirectHandler />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Ruta pública */}
              <Route path={ROUTES.LOGIN} element={<Login />} />

              {/* Ruta protegida */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

// Componente para manejar redirecciones basadas en eventos
const RedirectHandler = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleUnauthorized = () => {
      Swal.fire({
        title: "Sesión vencida",
        text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      }).then(() => {
        navigate(ROUTES.LOGIN) // Redirige al login después de cerrar el Swal
      })
    }

    window.addEventListener("unauthorized", handleUnauthorized)

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized)
    }
  }, [navigate])

  return null // Este componente no renderiza nada
}

export default App