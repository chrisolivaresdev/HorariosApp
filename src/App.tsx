import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"

const theme = createTheme({
  palette: {
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
})

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </ThemeProvider>
  )
}

export default App

