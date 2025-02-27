"use client"

import type React from "react"
import { useState } from "react"
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import Aulas from "./Aulas"
import Secciones from "./Secciones"

interface Periodo {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  aulas: any[]
  secciones: any[]
}

const Periodos: React.FC = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [open, setOpen] = useState(false)
  const [newPeriodo, setNewPeriodo] = useState<Omit<Periodo, "id" | "aulas" | "secciones">>({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  })
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [selectedSeccion, setSelectedSeccion] = useState<any | null>(null)
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null)
  const [nombreError, setNombreError] = useState("")
  const [fechaInicioError, setFechaInicioError] = useState("")
  const [fechaFinError, setFechaFinError] = useState("")

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleOpen = () => {
    setEditingPeriodo(null)
    setNewPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    let isValid = true

    if (!newPeriodo.nombre) {
      setNombreError("El nombre es obligatorio")
      isValid = false
    } else {
      setNombreError("")
    }

    if (!newPeriodo.fechaInicio) {
      setFechaInicioError("La fecha de inicio es obligatoria")
      isValid = false
    } else {
      setFechaInicioError("")
    }

    if (!newPeriodo.fechaFin) {
      setFechaFinError("La fecha de fin es obligatoria")
      isValid = false
    } else {
      setFechaFinError("")
    }

    if (!isValid) return

    if (editingPeriodo) {
      setPeriodos(periodos.map((p) => (p.id === editingPeriodo.id ? { ...editingPeriodo, ...newPeriodo } : p)))
    } else {
      const periodoToAdd = {
        ...newPeriodo,
        id: Date.now(),
        aulas: [],
        secciones: [],
      }
      setPeriodos([...periodos, periodoToAdd])
    }
    setNewPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" })
    handleClose()
  }

  const handleEdit = (periodo: Periodo) => {
    setEditingPeriodo(periodo)
    setNewPeriodo({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
    })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    setPeriodos(periodos.filter((p) => p.id !== id))
    if (selectedPeriodo && selectedPeriodo.id === id) {
      setSelectedPeriodo(null)
    }
  }

  const handlePeriodoClick = (periodo: Periodo) => {
    setSelectedPeriodo(periodo)
    setTabValue(0)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const updatePeriodoData = (periodoId: number, entityType: keyof Periodo, newData: any[]) => {
    setPeriodos(periodos.map((periodo) => (periodo.id === periodoId ? { ...periodo, [entityType]: newData } : periodo)))
    if (selectedPeriodo && selectedPeriodo.id === periodoId) {
      setSelectedPeriodo({ ...selectedPeriodo, [entityType]: newData })
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Periodo
      </Button>
      {isMobile ? (
        <Grid container spacing={2}>
          {periodos.map((periodo) => (
            <Grid item xs={12} key={periodo.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{periodo.nombre}</Typography>
                  <Typography variant="body2">Inicio: {periodo.fechaInicio}</Typography>
                  <Typography variant="body2">Fin: {periodo.fechaFin}</Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Ver Detalles">
                    <IconButton size="small" onClick={() => handlePeriodoClick(periodo)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                 <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(periodo)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(periodo.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4, overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Fecha de Inicio</TableCell>
                <TableCell>Fecha de Fin</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periodos.map((periodo) => (
                <TableRow key={periodo.id}>
                  <TableCell>{periodo.nombre}</TableCell>
                  <TableCell>{periodo.fechaInicio}</TableCell>
                  <TableCell>{periodo.fechaFin}</TableCell>
                  <TableCell>
                    <Tooltip title="Ver Detalles">
                      <IconButton onClick={() => handlePeriodoClick(periodo)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(periodo)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(periodo.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedPeriodo && (
        <Box sx={{ width: "100%", mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Detalles del Periodo: {selectedPeriodo.nombre}
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="periodo tabs"
              variant={isMobile ? "fullWidth" : "standard"}
              orientation={isMobile ? "horizontal" : "horizontal"}
            >
              <Tab label="Aulas" />
              <Tab label="Secciones" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Aulas
                periodoId={selectedPeriodo.id}
                aulas={selectedPeriodo.aulas}
                updateAulas={(newAulas) => updatePeriodoData(selectedPeriodo.id, "aulas", newAulas)}
                isMobile={isMobile}
              />
            )}
            {tabValue === 1 && (
              <Secciones
                periodoId={selectedPeriodo.id}
                secciones={selectedPeriodo.secciones}
                updateSecciones={(newSecciones) => updatePeriodoData(selectedPeriodo.id, "secciones", newSecciones)}
                isMobile={isMobile}
              />
            )}
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingPeriodo ? "Editar Periodo" : "Agregar Nuevo Periodo"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                required
                value={newPeriodo.nombre}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, nombre: e.target.value })}
                error={!!nombreError}
                helperText={nombreError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Inicio"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newPeriodo.fechaInicio}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaInicio: e.target.value })}
                error={!!fechaInicioError}
                helperText={fechaInicioError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Fin"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newPeriodo.fechaFin}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaFin: e.target.value })}
                error={!!fechaFinError}
                helperText={fechaFinError}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Periodos

