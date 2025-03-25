"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material"
import Aulas from "./Aulas"
import GeneradorHorario from "./GeneradorHorario"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"

interface Periodo {
  id: number
  name: string
  start_date: string
  end_date: string
  classrooms: any[]
}

interface Seccion {
  id: number
  name: string
  total_students: number
  journey: string
  quarter: string
}

const Periodos: React.FC = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [open, setOpen] = useState(false)
  const [newPeriodo, setNewPeriodo] = useState<Omit<Periodo, "id" | "aulas" | "secciones">>({
    name: "",
    start_date: "",
    end_date: "",
    classrooms: [],
  })
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null)
  const [aula, setAula] = useState<any>([])
  const [tabValue, setTabValue] = useState(0)
  const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null)
  const [nombreError, setNombreError] = useState("")
  const [fechaInicioError, setFechaInicioError] = useState("")
  const [fechaFinError, setFechaFinError] = useState("")
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null)
  const [openScheduleGenerator, setOpenScheduleGenerator] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const getPeriods = () => {
    axiosInstance
      .get("periods")
      .then((response) => {
        setPeriodos(response.data)
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: "A ocurrido un error.",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  const getSecciones = () => {
    axiosInstance
      .get("sections")
      .then((response) => {
        setSecciones(response.data)
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: "Ha ocurrido un error al cargar las secciones.",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  useEffect(() => {
    getPeriods()
    getSecciones()
  }, [])

  const handleOpen = () => {
    setEditingPeriodo(null)
    setNewPeriodo({ name: "", start_date: "", end_date: "", classrooms: [] })
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return; 
    }
    setOpen(false)
  }

  const handleSave = () => {
    let isValid = true

    if (!newPeriodo.name) {
      setNombreError("El nombre es obligatorio")
      isValid = false
    } else {
      setNombreError("")
    }

    if (!newPeriodo.start_date) {
      setFechaInicioError("La fecha de inicio es obligatoria")
      isValid = false
    } else {
      setFechaInicioError("")
    }

    if (!newPeriodo.end_date) {
      setFechaFinError("La fecha de fin es obligatoria")
      isValid = false
    } else {
      setFechaFinError("")
    }

    if (!isValid) return
    const period = {
      name: newPeriodo?.name,
      start_date: new Date(newPeriodo.start_date),
      end_date: new Date(newPeriodo.end_date),
    }
    if (editingPeriodo) {
      axiosInstance
        .patch(`/periods/${editingPeriodo.id}`, period)
        .then(() => {
          Swal.fire({
            title: "Bien!",
            text: "Periodo editado correctamente!.",
            icon: "success",
          })
          getPeriods()
        })
        .catch((error) => {
          Swal.fire({
            title: "¡Error!",
            text: "A ocurrido un error.",
            icon: "error",
          })
          console.error("Error:", error)
        })
    } else {
      axiosInstance
        .post("/periods", period)
        .then(() => {
          Swal.fire({
            title: "Bien!",
            text: "Periodo creado correctamente!.",
            icon: "success",
          })
          getPeriods()
        })
        .catch((error) => {
          Swal.fire({
            title: "¡Error!",
            text: "A ocurrido un error.",
            icon: "error",
          })
          console.error("Error:", error)
        })
    }
    handleClose("","")
  }

  const handleEdit = (periodo: Periodo) => {
    console.log(periodo)
    setEditingPeriodo(periodo)
    setNewPeriodo({
      name: periodo.name,
      start_date: new Date(periodo.start_date).toISOString().split("T")[0],
      end_date: new Date(periodo.end_date).toISOString().split("T")[0],
      classrooms: periodo.classrooms,
    })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este periodo?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminalo",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance
          .delete(`/periods/${id}`)
          .then(() => {
            Swal.fire("Eliminado!", "El periodo ha sido eliminado.", "success")
            // Ocultar los detalles del periodo eliminado
            setSelectedPeriodo(null)
            // Volver a llamar a getPeriods para actualizar la tabla
            getPeriods()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      }
    })
  }

  const handlePeriodoClick = (periodo: Periodo) => {
    setSelectedPeriodo(periodo)
    setAula(periodo.classrooms)
    setTabValue(0)
    setSelectedSeccion(null)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event)
    setTabValue(newValue)
  }

  const handleSeccionChange = (event:any) => {
    const seccionId = event.target.value
    const seccion = secciones.find((s) => s.id === seccionId) || null
    setSelectedSeccion(seccion)
  }

  const formatDate = (dateString:any) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const handleOpenScheduleGenerator = (seccion: Seccion) => {
    setSelectedSeccion(seccion)
    setOpenScheduleGenerator(true)
  }

  const handleCloseScheduleGenerator = () => {
    setOpenScheduleGenerator(false)
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
                  <Typography variant="h6">{periodo.name}</Typography>
                  <Typography variant="body2">Inicio: {formatDate(periodo.start_date)}</Typography>
                  <Typography variant="body2">Fin: {formatDate(periodo.end_date)}</Typography>
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
                  <TableCell>{periodo.name}</TableCell>
                  <TableCell>{formatDate(periodo.start_date)}</TableCell>
                  <TableCell>{formatDate(periodo.end_date)}</TableCell>
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
            Detalles del Periodo: {selectedPeriodo.name}
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="periodo tabs"
              variant={isMobile ? "fullWidth" : "standard"}
              orientation={isMobile ? "horizontal" : "horizontal"}
            >
              <Tab label="Aulas" icon={<VisibilityIcon />} iconPosition="start" />
              <Tab label="Generar Horario" icon={<ScheduleIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Aulas periodId={selectedPeriodo.id} aulas={aula} setAula={setAula} isMobile={isMobile} />
            )}
            {tabValue === 1 && (
              <Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="seccion-select-label">Seleccionar Sección</InputLabel>
                      <Select
                        labelId="seccion-select-label"
                        id="seccion-select"
                        value={selectedSeccion?.id || ""}
                        label="Seleccionar Sección"
                        onChange={handleSeccionChange}
                      >
                        {secciones.map((seccion) => (
                          <MenuItem key={seccion.id} value={seccion.id}>
                            {seccion.name} - Trayecto {seccion.journey === "0" ? "Inicial" : seccion.journey} -
                            Trimestre {seccion.quarter} - estudiantes {seccion.total_students}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ScheduleIcon />}
                      disabled={!selectedSeccion}
                      onClick={() => selectedSeccion && handleOpenScheduleGenerator(selectedSeccion)}
                      sx={{ mt: { xs: 2, md: 0 } }}
                    >
                      Generar Horario
                    </Button>
                  </Grid>
                </Grid>

                {!selectedSeccion && (
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
                    Seleccione una sección para generar el horario
                  </Typography>
                )}
              </Box>
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
                value={newPeriodo.name}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, name: e.target.value })}
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
                value={newPeriodo.start_date ? new Date(newPeriodo.start_date).toISOString().split("T")[0] : ""}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, start_date: e.target.value })}
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
                value={newPeriodo.end_date ? new Date(newPeriodo.end_date).toISOString().split("T")[0] : ""}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, end_date: e.target.value })}
                error={!!fechaFinError}
                helperText={fechaFinError}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> handleClose("","")}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
      {/* Schedule Generator Modal */}
      <Dialog
        open={openScheduleGenerator}
        onClose={handleCloseScheduleGenerator}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            height: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Generador de Horario - {selectedSeccion?.name}</Typography>
            <Button onClick={handleCloseScheduleGenerator} color="primary">
              Cerrar
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              "& .MuiTableCell-root": {
                padding: "4px 8px",
                fontSize: "0.8rem",
              },
              "& .MuiTableContainer-root": {
                maxWidth: "800px",
                margin: "0 auto",
              },
              "& .clase-content": {
                padding: "4px",
              },
              "& .MuiTypography-subtitle1": {
                fontSize: "0.9rem",
              },
              "& .MuiTypography-body1": {
                fontSize: "0.8rem",
              },
            }}
          >
            {selectedSeccion && (
              <GeneradorHorario
                periodId={selectedPeriodo?.id}
                seccionId={selectedSeccion.id}
                selectedSeccion={{
                  nombreSeccion: selectedSeccion.name,
                  trayecto: selectedSeccion.journey,
                  trimestre: selectedSeccion.quarter,
                  studentCount: selectedSeccion.total_students,
                }}
                handleCloseScheduleGenerator={handleCloseScheduleGenerator}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Periodos

