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
  Checkbox,
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  FormControlLabel,
  TablePagination,
  InputAdornment,
  FormHelperText,
  IconButton,
  Tooltip,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"

interface availabilityDia {
  dayOfWeek: string
  start_time: string
  end_time: string
}

interface Profesor {
  id: number
  firstname: string
  lastname: string
  identification: string
  entry_date: string
  subjectIds: number[]
  availability: availabilityDia[]
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

// Generar rangos de horas (igual que en GeneradorHorario)
const horas = []
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


const Profesores: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [subjectIds, setsubjectIds] = useState([])
  const [filteredProfesores, setFilteredProfesores] = useState<Profesor[]>([])
  const [open, setOpen] = useState(false)
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null)
  const [newProfesor, setNewProfesor] = useState<Omit<Profesor, "id">>({
    firstname: "",
    lastname: "",
    identification: "",
    entry_date: "",
    subjectIds: [],
    availability: [],
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    getSubjects()
  }, [])

  useEffect(() => {
    getTeachers()
  }, [])

  useEffect(() => {
    const filtered = profesores.filter((profesor) =>
      `${profesor.firstname} ${profesor.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProfesores(filtered)
    setPage(0)
  }, [searchTerm, profesores])

  const handleOpen = () => {
    setEditingProfesor(null)
    setNewProfesor({
      firstname: "",
      lastname: "",
      identification: "",
      entry_date: "",
      subjectIds: [],
      availability: [],
    })
    setErrors({})
    setOpen(true)
  }

  const getTeachers = () => {
    axiosInstance
      .get("teachers")
      .then((response) => {
        setProfesores(response.data)
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

  const handleClose = () => {
    setOpen(false)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!newProfesor.firstname) newErrors.firstname = "El nombre es requerido"
    if (!newProfesor.lastname) newErrors.lastname = "El apellido es requerido"
    if (!newProfesor.identification) newErrors.identification = "El número de identificación es requerido"
    if (!newProfesor.entry_date) newErrors.entry_date = "La fecha de ingreso es requerida"
    if (newProfesor.subjectIds.length === 0) newErrors.subjectIds = "Debe seleccionar al menos una asignatura"
    if (newProfesor.availability.length === 0)
      newErrors.availability = "Debe seleccionar al menos un día de disponibilidad"

    newProfesor.availability.forEach((d) => {
      if (!d.start_time || !d.end_time) {
        newErrors[`availability_${d.dayOfWeek}`] = "Debe seleccionar hora de inicio y fin"
      } else if (d.end_time <= d.start_time) {
        newErrors[`availability_${d.dayOfWeek}`] = "La hora de fin debe ser mayor que la hora de inicio"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    const profesorToAdd = {
      ...newProfesor,
    }
    if (validateForm()) {
      if (editingProfesor) {
        axiosInstance
          .patch(`teachers/${editingProfesor.id}`, profesorToAdd)
          .then((response) => {
            Swal.fire({
              title: "¡Bien!",
              text: "Profesor actualizado correctamente.",
              icon: "success",
            })
            getTeachers()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al actualizar la sección.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      } else {
        axiosInstance
          .post("teachers", newProfesor)
          .then((response) => {
            Swal.fire({
              title: "¡Bien!",
              text: "Profesor creado correctamente.",
              icon: "success",
            })
            getTeachers()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al crear la sección.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      }
      handleClose()
    }
  }

  const getSubjects = () => {
    axiosInstance
      .get("subjects")
      .then((response) => {
        setsubjectIds(response.data)
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

  const handleEdit = (profesor: Profesor) => {
    setEditingProfesor(profesor)
    setNewProfesor({ ...profesor })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este profesor?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance
          .delete(`teachers/${id}`)
          .then((response) => {
            Swal.fire("¡Eliminada!", "La profesor ha sido eliminada.", "success")
            // getSecciones()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al eliminar el profesor.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      }
    })
  }

  const handleHoraChange = (dayOfWeek: string, tipo: "start_time" | "end_time", valor: string) => {
    setNewProfesor((prev) => ({
      ...prev,
      availability: prev.availability.map((d) => {
        if (d.dayOfWeek === dayOfWeek) {
          const [hours, minutes] = valor.split(":").map(Number)
          const date = new Date()
          date.setHours(hours, minutes, 0, 0)
          const isoString = date.toISOString()

          if (tipo === "start_time") {
            return { ...d, [tipo]: isoString, end_time: "" }
          } else {
            return { ...d, [tipo]: isoString }
          }
        }
        return d
      }),
    }))
    setErrors((prev) => ({ ...prev, [`availability_${dayOfWeek}`]: "" }))
  }

  const handlesubjectIdsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewProfesor((prev) => ({
      ...prev,
      subjectIds: event.target.value as number[],
    }))
    setErrors((prev) => ({ ...prev, subjectIds: "" }))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleavailabilityChange = (dayOfWeek: string, checked: boolean) => {
    setNewProfesor((prev) => {
      let updatedAvailability = [...prev.availability]
      if (checked) {
        updatedAvailability.push({ dayOfWeek, start_time: "", end_time: "" })
      } else {
        updatedAvailability = updatedAvailability.filter((d) => d.dayOfWeek !== dayOfWeek)
      }
      return { ...prev, availability: updatedAvailability }
    })
    setErrors((prev) => ({ ...prev, availability: "" }))
  }




  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Agregar Profesor
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
          {filteredProfesores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((profesor) => (
            <Grid item xs={12} key={profesor.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{`${profesor.firstname} ${profesor.lastname}`}</Typography>
                  <Typography variant="body2">ID: {profesor.identification}</Typography>
                  <Typography variant="body2">Ingreso: {profesor.entry_date}</Typography>
                  <Typography variant="body2">
                    subjectIds: {profesor.subjectIds.map((a) => `Asignatura ${a}`).join(", ")}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEdit(profesor)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleDelete(profesor.id)}>
                      <DeleteIcon />
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
                <TableCell>Nombre</TableCell>
                <TableCell>Número de Identificación</TableCell>
                <TableCell>Fecha de Ingreso</TableCell>
                <TableCell>Asignaturas</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProfesores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((profesor) => (
                <TableRow key={profesor.id}>
                  <TableCell>{`${profesor.firstname} ${profesor.lastname}`}</TableCell>
                  <TableCell>{profesor.identification}</TableCell>
                  <TableCell>{new Date(profesor.entry_date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</TableCell>
                  <TableCell>
                    {profesor.subjects.map((asignatura) => (
                      <Chip
                        key={asignatura.id}
                        label={subjectIds?.find((asig) => asig.id === asignatura.id)?.name}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(profesor)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(profesor.id)}>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredProfesores.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingProfesor ? "Editar Profesor" : "Agregar Nuevo Profesor"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                value={newProfesor.firstname}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, firstname: e.target.value })
                  setErrors((prev) => ({ ...prev, firstname: "" }))
                }}
                error={!!errors.firstname}
                helperText={errors.firstname}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Apellido"
                type="text"
                fullWidth
                value={newProfesor.lastname}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, lastname: e.target.value })
                  setErrors((prev) => ({ ...prev, lastname: "" }))
                }}
                error={!!errors.lastname}
                helperText={errors.lastname}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Número de Identificación"
                type="text"
                fullWidth
                value={newProfesor.identification}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, identification: e.target.value })
                  setErrors((prev) => ({ ...prev, identification: "" }))
                }}
                error={!!errors.identification}
                helperText={errors.identification}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Ingreso"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newProfesor.entry_date}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, entry_date: e.target.value })
                  setErrors((prev) => ({ ...prev, entry_date: "" }))
                }}
                error={!!errors.entry_date}
                helperText={errors.entry_date}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" error={!!errors.subjectIds}>
                <InputLabel id="subjectIds-label">subjectIds</InputLabel>
                <Select
                  labelId="subjectIds-label"
                  multiple
                  value={newProfesor.subjectIds}
                  onChange={handlesubjectIdsChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip key={value} label={subjectIds.find((asignatura) => asignatura.id === value).name} />
                      ))}
                    </Box>
                  )}
                >
                  {subjectIds.map((asignatura) => (
                    <MenuItem key={asignatura.id} value={asignatura.id}>
                      {asignatura.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.subjectIds && <FormHelperText>{errors.subjectIds}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Disponibilidad
          </Typography>
          {errors.availability && <FormHelperText error>{errors.availability}</FormHelperText>}
          <Grid container spacing={2}>
            {diasSemana.map((dayOfWeek) => (
              <Grid item xs={12} sm={6} md={4} key={dayOfWeek}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newProfesor.availability.some((d) => d.dayOfWeek === dayOfWeek)}
                        onChange={(e) => handleavailabilityChange(dayOfWeek, e.target.checked)}
                      />
                    }
                    label={dayOfWeek}
                  />
                  {newProfesor.availability.some((d) => d.dayOfWeek === dayOfWeek) && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <FormControl fullWidth error={!!errors[`availability_${dayOfWeek}`]}>
                        <InputLabel>Hora de inicio</InputLabel>
                        <Select
                          value={
                            newProfesor.availability.find((d) => d.dayOfWeek === dayOfWeek)?.start_time
                              ? new Date(
                                  newProfesor.availability.find((d) => d.dayOfWeek === dayOfWeek)!.start_time,
                                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
                              : ""
                          }
                          onChange={(e) => handleHoraChange(dayOfWeek, "start_time", e.target.value as string)}
                        >
                          {horas.map((hora) => (
                            <MenuItem key={hora} value={hora}>
                              {hora}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth error={!!errors[`availability_${dayOfWeek}`]}>
                        <InputLabel>Hora de fin</InputLabel>
                        <Select
                          value={
                            newProfesor.availability.find((d) => d.dayOfWeek === dayOfWeek)?.end_time
                              ? new Date(
                                  newProfesor.availability.find((d) => d.dayOfWeek === dayOfWeek)!.end_time,
                                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
                              : ""
                          }
                          onChange={(e) => handleHoraChange(dayOfWeek, "end_time", e.target.value as string)}
                        >
                          {horas
                            .filter((hora) => {
                              const startTime = newProfesor.availability.find(
                                (d) => d.dayOfWeek === dayOfWeek,
                              )?.start_time
                              return startTime
                                ? hora >
                                    new Date(startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })
                                : true
                            })
                            .map((hora) => (
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
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Profesores

