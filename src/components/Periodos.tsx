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
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import Asignaturas from "./Asignaturas"
import Profesores from "./Profesores"
import Aulas from "./Aulas"
import Secciones from "./Secciones"
import Carreras from "./Carreras"

interface Periodo {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  asignaturas: any[]
  profesores: any[]
  aulas: any[]
  secciones: any[]
  carreras: any[]
}

const Periodos: React.FC = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [open, setOpen] = useState(false)
  const [newPeriodo, setNewPeriodo] = useState<
    Omit<Periodo, "id" | "asignaturas" | "profesores" | "aulas" | "secciones" | "carreras">
  >({ nombre: "", fechaInicio: "", fechaFin: "" })
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null)
  const [tabValue, setTabValue] = useState(0)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSave = () => {
    const periodoToAdd = {
      ...newPeriodo,
      id: Date.now(),
      asignaturas: [],
      profesores: [],
      aulas: [],
      secciones: [],
      carreras: [],
    }
    setPeriodos([...periodos, periodoToAdd])
    setNewPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" })
    handleClose()
    setSelectedPeriodo(periodoToAdd)
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
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Periodo
      </Button>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
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
                  <Button onClick={() => handlePeriodoClick(periodo)} variant="outlined" color="primary">
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedPeriodo && (
        <Box sx={{ width: "100%" }}>
          <Typography variant="h5" gutterBottom>
            Detalles del Periodo: {selectedPeriodo.nombre}
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="periodo tabs">
              <Tab label="Asignaturas" />
              <Tab label="Profesores" />
              <Tab label="Aulas" />
              <Tab label="Secciones" />
              <Tab label="Carreras" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Asignaturas
                periodoId={selectedPeriodo.id}
                asignaturas={selectedPeriodo.asignaturas}
                updateAsignaturas={(newAsignaturas) =>
                  updatePeriodoData(selectedPeriodo.id, "asignaturas", newAsignaturas)
                }
              />
            )}
            {tabValue === 1 && (
              <Profesores
                periodoId={selectedPeriodo.id}
                profesores={selectedPeriodo.profesores}
                updateProfesores={(newProfesores) => updatePeriodoData(selectedPeriodo.id, "profesores", newProfesores)}
                asignaturas={selectedPeriodo.asignaturas}
              />
            )}
            {tabValue === 2 && (
              <Aulas
                periodoId={selectedPeriodo.id}
                aulas={selectedPeriodo.aulas}
                updateAulas={(newAulas) => updatePeriodoData(selectedPeriodo.id, "aulas", newAulas)}
              />
            )}
            {tabValue === 3 && (
              <Secciones
                periodoId={selectedPeriodo.id}
                secciones={selectedPeriodo.secciones}
                updateSecciones={(newSecciones) => updatePeriodoData(selectedPeriodo.id, "secciones", newSecciones)}
              />
            )}
            {tabValue === 4 && (
              <Carreras
                periodoId={selectedPeriodo.id}
                carreras={selectedPeriodo.carreras}
                updateCarreras={(newCarreras) => updatePeriodoData(selectedPeriodo.id, "carreras", newCarreras)}
              />
            )}
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nuevo Periodo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={newPeriodo.nombre}
            onChange={(e) => setNewPeriodo({ ...newPeriodo, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Fecha de Inicio"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newPeriodo.fechaInicio}
            onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaInicio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Fecha de Fin"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newPeriodo.fechaFin}
            onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaFin: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Periodos

