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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import Aulas from "./Aulas"
import Secciones from "./Secciones"

interface Periodo {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  carrera: string
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
    carrera: "",
  })
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [carreras, setCarreras] = useState<string[]>([
    "Ingeniería Informática",
    "Ingeniería Civil",
    "Administración de Empresas",
    "Psicología",
    "Medicina",
  ])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSave = () => {
    const periodoToAdd = {
      ...newPeriodo,
      id: Date.now(),
      aulas: [],
      secciones: [],
    }
    setPeriodos([...periodos, periodoToAdd])
    setNewPeriodo({ nombre: "", fechaInicio: "", fechaFin: "", carrera: "" })
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
                  <Typography variant="body2">Carrera: {periodo.carrera}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handlePeriodoClick(periodo)}>
                    Ver Detalles
                  </Button>
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
                <TableCell>Carrera</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periodos.map((periodo) => (
                <TableRow key={periodo.id}>
                  <TableCell>{periodo.nombre}</TableCell>
                  <TableCell>{periodo.fechaInicio}</TableCell>
                  <TableCell>{periodo.fechaFin}</TableCell>
                  <TableCell>{periodo.carrera}</TableCell>
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
        <DialogTitle>Agregar Nuevo Periodo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                value={newPeriodo.nombre}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Inicio"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newPeriodo.fechaInicio}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaInicio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Fin"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newPeriodo.fechaFin}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaFin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Carrera</InputLabel>
                <Select
                  value={newPeriodo.carrera}
                  onChange={(e) => setNewPeriodo({ ...newPeriodo, carrera: e.target.value as string })}
                >
                  {carreras.map((carrera) => (
                    <MenuItem key={carrera} value={carrera}>
                      {carrera}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

