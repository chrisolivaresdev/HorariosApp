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
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import Aulas from "./Aulas"
import Secciones from "./Secciones"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"

interface Periodo {
  id: number
  name: string
  start_date: string
  end_date: string
  aulas: any[]
  secciones: any[]
}

const Periodos: React.FC = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [open, setOpen] = useState(false)
  const [newPeriodo, setNewPeriodo] = useState<Omit<Periodo, "id" | "aulas" | "secciones">>({
    name: "",
    start_date: "",
    end_date: "",
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

  const getPeriods = () => {
    axiosInstance.get("periods")
      .then(response => {
        setPeriodos(response.data)
      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    getPeriods()
  }, [])

  const handleOpen = () => {
    setEditingPeriodo(null)
    setNewPeriodo({ name: "", start_date: "", end_date: "" })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

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
    let  period = {
      name : newPeriodo?.name,
      start_date: new Date(newPeriodo.start_date),
      end_date: new Date(newPeriodo.end_date)
    }
    if (editingPeriodo) {
     
      axiosInstance.patch(`/periods/${editingPeriodo.id}`, period)
      .then(response => {
        Swal.fire({
          title: 'Bien!',
          text: 'Periodo editado correctamente!.',
          icon: 'success',
        });
        getPeriods()
      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
    } else {
      axiosInstance.post('/periods', period)
      .then(response => {
        Swal.fire({
          title: 'Bien!',
          text: 'Periodo creado correctamente!.',
          icon: 'success',
        });
        getPeriods()

      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
    }
    handleClose()
  }

  const handleEdit = (periodo: Periodo) => {
    console.log(periodo)
    setEditingPeriodo(periodo)
    setNewPeriodo({
      name: periodo.name,
      start_date: periodo.start_date,
      end_date: periodo.end_date,
    })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro de eliminar este periodo?',
      text: '¡No podrás deshacer esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminalo'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/periods/${id}`)
        .then(response => {
          Swal.fire(
            'Eliminado!',
            'El periodo ha sido eliminado.',
            'success'
          );
          getPeriods()
        })
        .catch(error => {
          Swal.fire({
            title: '¡Error!',
            text: 'A ocurrido un error.',
            icon: 'error',
          });
          console.error('Error:', error);
        });
        
      }
    });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

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
                  <Typography variant="body2">Inicio: {periodo.start_date}</Typography>
                  <Typography variant="body2">Fin: {periodo.end_date}</Typography>
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
                value={newPeriodo.start_date}
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
                value={newPeriodo.end_date}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, end_date: e.target.value })}
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

