"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  TablePagination,
  InputAdornment,
  Box,
  FormHelperText,
  Tooltip,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Schedule as ScheduleIcon  , Search as SearchIcon } from "@mui/icons-material"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"
import HorarioAula from "./HorarioAula"

interface availabilityDia {
  id?: string // Make id optional
  dayOfWeek: string
  start_time: string
  end_time: string
}

interface Aula {
  id: string
  name: string
  type: string
  max_capacity: number
  current_capacity: number
  availabilities: availabilityDia[]
}

interface AulasProps {
  periodId: number
  aulas: Aula[]
  setAula: React.Dispatch<any>
  isMobile: boolean
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

// Generar rangos de horas (igual que en GeneradorHorario)
const horas:any = []
let hora = 7
let minutos = 0
while (hora < 19 || (hora === 19 && minutos === 0)) {
  horas.push(`${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`)
  minutos += 45
  if (minutos >= 60) {
    hora++
    minutos = minutos - 60
  }
}

const Aulas: React.FC<AulasProps> = ({ periodId, aulas, setAula, isMobile }) => {
  const [open, setOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [newAula, setNewAula] = useState<Omit<Aula, "id">>({
    name: "",
    type: "",
    max_capacity: 0,
    current_capacity: 0,
    availabilities: [],
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAulas, setFilteredAulas] = useState<Aula[]>(aulas)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    console.log(aulas)
    const filtered = aulas?.filter((aula) => aula.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredAulas(filtered)
    setPage(0)
  }, [searchTerm, aulas])

  const extractTimeFromISO = (isoString: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    const hours = date.getUTCHours().toString().padStart(2, "0")
    const minutes = date.getUTCMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const [openHorario, setOpenHorario] = useState(false)
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null)

  const handleViewHorario = (aula: Aula) => {
    setSelectedAula(aula)
    setOpenHorario(true)
  }

  const handleCloseHorario = () => {
    setOpenHorario(false)
    setSelectedAula(null)
  }
  
  const getClassrooms = () => {
    axiosInstance
      .get(`classrooms/find-by-period/${periodId}`)
      .then((response) => {
        const transformedData = response.data.map((aula: Aula) => ({
          ...aula,
          availabilities: aula.availabilities.map((avail) => ({
            ...avail,
            start_time: extractTimeFromISO(avail.start_time),
            end_time: extractTimeFromISO(avail.end_time),
          })),
        }))
        setAula(transformedData)
        console.log(transformedData)
      })
      .catch((error) => {
        console.log(error)
        Swal.fire({
          title: "¡Error!",
          text: "A ocurrido un error en el get.",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  useEffect(() => {
    getClassrooms()
  }, [periodId])

  const handleOpen = () => {
    setEditingAula(null)
    setNewAula({ name: "", type: "", max_capacity: 0, current_capacity: 0, availabilities: [] })
    setErrors({})
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return
    }

    setOpen(false)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    if (!newAula.name) newErrors.name = "El nombre del aula es requerido"
    if (!newAula.type) newErrors.type = "El tipo de aula es requerido"
    if (!newAula.max_capacity || newAula.max_capacity <= 0) {
      newErrors.max_capacity = "La capacidad máxima debe ser mayor que 0"
    }
    if (newAula.current_capacity < 0) {
      newErrors.current_capacity = "La capacidad actual no puede ser negativa"
    }
    if (newAula.availabilities.length === 0) {
      newErrors.availabilities = "Debe seleccionar al menos un día de disponibilidad"
    }
    newAula.availabilities.forEach((d) => {
      if (!d.start_time || !d.end_time) {
        newErrors[`availability_${d.dayOfWeek}`] = "Debe seleccionar hora de inicio y fin"
      } else if (d.end_time <= d.start_time) {
        newErrors[`availability_${d.dayOfWeek}`] = "La hora de fin debe ser mayor que la hora de inicio"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatToISO = (timeString: string) => {
    const currentDate = new Date()
    const [hours, minutes] = timeString.split(":")
    currentDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0)
    return currentDate.toISOString()
  }

  const handleSave = () => {
    const availabilities = newAula.availabilities.map((obj) => ({
      id: obj.id, // Include the id here
      dayOfWeek: obj.dayOfWeek,
      start_time: formatToISO(obj.start_time),
      end_time: formatToISO(obj.end_time),
    }))
  
    const aulaToAdd = {
      name: newAula.name,
      type: newAula.type,
      max_capacity: newAula.max_capacity,
      current_capacity: newAula.current_capacity,
      availabilities: availabilities,
    }
  
    if (validateForm()) {
      if (editingAula) {
        axiosInstance
          .patch(`classrooms/${editingAula.id}`, aulaToAdd)
          .then(() => {
            Swal.fire({
              title: "¡Bien!",
              text: "Aula actualizado correctamente.",
              icon: "success",
            })
            getClassrooms()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al actualizar el aula.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      } else {
        const aulaToAddWithPeriod = { ...aulaToAdd, periodId }
        axiosInstance
          .post("classrooms", aulaToAddWithPeriod)
          .then(() => {
            Swal.fire({
              title: "¡Bien!",
              text: "Aula creada correctamente.",
              icon: "success",
            })
            getClassrooms()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al crear el aula.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      }
      handleClose("","")
    }
  }

  const handleEdit = (aula: Aula) => {
    setEditingAula(aula)
    setNewAula({ ...aula })
    setErrors({})
    setOpen(true)
  }

  const handleDelete = (id: any) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar esta aula?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminalo",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance
          .delete(`/classrooms/${id}`)
          .then(() => {
            Swal.fire("Eliminado!", "El aula ha sido eliminado.", "success")
            getClassrooms()
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
    })
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    console.log(event)
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleHoraChange = (dayOfWeek: string, tipo: "start_time" | "end_time", valor: string) => {
    setNewAula((prev) => ({
      ...prev,
      availabilities: prev.availabilities.map((d) => {
        if (d.dayOfWeek === dayOfWeek) {
          if (tipo === "start_time") {
            return { ...d, [tipo]: valor, end_time: "" }
          } else {
            return { ...d, [tipo]: valor }
          }
        }
        return d
      }),
    }))
    setErrors((prev) => ({ ...prev, [`availability_${dayOfWeek}`]: "" }))
  }

  const handleAvailabilityChange = (dayOfWeek: string, checked: boolean) => {
    setNewAula((prev) => {
      let updatedAvailability = [...prev.availabilities]
      if (checked) {
        updatedAvailability.push({ dayOfWeek, start_time: "", end_time: "" })
      } else {
        updatedAvailability = updatedAvailability.filter((d) => d.dayOfWeek !== dayOfWeek)
      }
      return { ...prev, availabilities: updatedAvailability }
    })
    setErrors((prev) => ({ ...prev, availabilities: "" }))
  }

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Agregar Aula
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {isMobile ? (
        <Grid container spacing={2}>
          {filteredAulas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((aula) => (
            <Grid item xs={12} key={aula.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{aula.name}</Typography>
                  <Typography variant="body2">Tipo: {aula.type}</Typography>
                  <Typography variant="body2">Capacidad Actual: {aula.current_capacity}</Typography>
                  <Typography variant="body2">Capacidad Máxima: {aula.max_capacity}</Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEdit(aula)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleDelete(aula.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver Horario">
                    <IconButton onClick={() => handleViewHorario(aula)}>
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre del Aula</TableCell>
                <TableCell>Tipo de Aula</TableCell>
                <TableCell>Capacidad Actual</TableCell>
                <TableCell>Capacidad Máxima</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAulas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((aula) => (
                <TableRow key={aula.id}>
                  <TableCell>{aula.name}</TableCell>
                  <TableCell>{aula.type}</TableCell>
                  <TableCell>{aula.current_capacity}</TableCell>
                  <TableCell>{aula.max_capacity}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(aula)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(aula.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver Horario">
                    <IconButton onClick={() => handleViewHorario(aula)}>
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAulas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingAula ? "Editar Aula" : "Agregar Nueva Aula"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Aula"
            type="text"
            fullWidth
            value={newAula.name}
            onChange={(e) => {
              setNewAula({ ...newAula, name: e.target.value })
              setErrors({ ...errors, name: "" })
            }}
            error={!!errors.name}
            helperText={errors.name}
          />
          <FormControl fullWidth margin="dense" error={!!errors.type}>
            <InputLabel>Tipo de Aula</InputLabel>
            <Select
              value={newAula.type}
              onChange={(e) => {
                setNewAula({ ...newAula, type: e.target.value as string })
                setErrors({ ...errors, type: "" })
              }}
            >
              <MenuItem value="Teórica">Teórica</MenuItem>
              <MenuItem value="Laboratorio">Laboratorio</MenuItem>
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
          <TextField
            margin="dense"
            label="Capacidad Actual"
            type="number"
            fullWidth
            value={newAula.current_capacity}
            onChange={(e) => {
              setNewAula({ ...newAula, current_capacity: Number(e.target.value) })
              setErrors({ ...errors, current_capacity: "" })
            }}
            error={!!errors.current_capacity}
            helperText={errors.current_capacity}
          />
           <TextField
            margin="dense"
            label="Capacidad Máxima"
            type="number"
            fullWidth
            value={newAula.max_capacity}
            onChange={(e) => {
              setNewAula({ ...newAula, max_capacity: Number(e.target.value) })
              setErrors({ ...errors, max_capacity: "" })
            }}
            error={!!errors.max_capacity}
            helperText={errors.max_capacity}
          />
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Disponibilidad
          </Typography>
          {errors.availabilities && <FormHelperText error>{errors.availabilities}</FormHelperText>}
          <Grid container spacing={2}>
            {diasSemana.map((dayOfWeek) => (
              <Grid item xs={12} sm={6} md={4} key={dayOfWeek}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newAula.availabilities.some((d) => d.dayOfWeek === dayOfWeek)}
                        onChange={(e) => handleAvailabilityChange(dayOfWeek, e.target.checked)}
                      />
                    }
                    label={dayOfWeek}
                  />
                  {newAula.availabilities.some((d) => d.dayOfWeek === dayOfWeek) && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <FormControl fullWidth error={!!errors[`availability_${dayOfWeek}`]}>
                        <InputLabel>Hora de inicio</InputLabel>
                        <Select
                          value={newAula.availabilities.find((d) => d.dayOfWeek === dayOfWeek)?.start_time || ""}
                          onChange={(e) => handleHoraChange(dayOfWeek, "start_time", e.target.value as string)}
                        >
                          {horas.map((hora:any) => (
                            <MenuItem key={hora} value={hora}>
                              {hora}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth error={!!errors[`availability_${dayOfWeek}`]}>
                        <InputLabel>Hora de fin</InputLabel>
                        <Select
                          value={newAula.availabilities.find((d) => d.dayOfWeek === dayOfWeek)?.end_time || ""}
                          onChange={(e) => handleHoraChange(dayOfWeek, "end_time", e.target.value as string)}
                        >
                          {horas
                            .filter((hora:any) => {
                              const startTime = newAula.availabilities.find((d) => d.dayOfWeek === dayOfWeek)?.start_time
                              return startTime ? hora > startTime : true
                            })
                            .map((hora:any) => (
                              <MenuItem key={hora} value={hora}>
                                {hora}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                  {errors[`availability_${dayOfWeek}`] && (
                    <FormHelperText error>{errors[`availability_${dayOfWeek}`]}</FormHelperText>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {handleClose("","")} }>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openHorario} onClose={handleCloseHorario} fullWidth maxWidth="md">
        <DialogTitle>Horario del Aula</DialogTitle>
        <DialogContent>
          {selectedAula && <HorarioAula aula={selectedAula} periodId={periodId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHorario}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Aulas