"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useState, useMemo, createContext } from "react"
import { AnimatePresence } from "framer-motion"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import './App.css'

export const ColorModeContext = createContext({ toggleColorMode: () => {} })

function App() {

  const [mode, setMode] = useState<"light" | "dark">("light")

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
      },
    }),
    [],
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
    [mode],
  )


  return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AnimatePresence mode="wait">
              <Routes>
                <Route
                  path="/login"
                  element={<Login/>}
                />
                <Route
                  path="/*"
                  element={
                    localStorage.getItem('token') ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
              </Routes>
            </AnimatePresence>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
  )
}

export default App

