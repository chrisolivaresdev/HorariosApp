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
  SelectChangeEvent,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Schedule as ScheduleIcon, Search as SearchIcon } from "@mui/icons-material"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"
import HorarioProfesor from "./HorarioProfesor"

interface availabilityDia {
  id?: number; // Hacer que el campo id sea opcional
  dayOfWeek: string;
  start_time: string;
  end_time: string;
}
interface Profesor {
  id: number
  firstname: string
  lastname: string
  identification: string
  entry_date: string
  subjects: number[]
  availabilities: availabilityDia[]
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

// Generar rangos de horas (igual que en GeneradorHorario)
const horas: any = []
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

// Helper function to extract time from ISO string
const extractTimeFromISO = (isoString: any) => {
  if (!isoString) return ""
  try {
    // Create a date object from the ISO string
    const date = new Date(isoString)
    // Format hours and minutes with leading zeros
    const hours = date.getUTCHours().toString().padStart(2, "0")
    const minutes = date.getUTCMinutes().toString().padStart(2, "0")
    // Return in format "HH:MM"
    return `${hours}:${minutes}`
  } catch (e) {
    console.error("Error parsing ISO date:", e, "for string:", isoString)
    return ""
  }
}

const Profesores: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [subjects, setsubjectIds] = useState([])
  const [filteredProfesores, setFilteredProfesores] = useState<Profesor[]>([])
  const [open, setOpen] = useState(false)
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null)
  const [newProfesor, setNewProfesor] = useState<Omit<Profesor, "id">>({
    firstname: "",
    lastname: "",
    identification: "",
    entry_date: "",
    subjects: [],
    availabilities: [],
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [periodos, setPeriodos] = useState([]); // Estado para los periodos
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null); // Estado para el periodo seleccionado
  const [openHorario, setOpenHorario] = useState(false); // Estado para el diálogo del horario
  const [selectedProfesor, setSelectedProfesor] = useState<Profesor | null>(null); // Estado para el profesor seleccionado

  useEffect(() => {
    getSubjects();
    getPeriodos(); // Obtener los periodos al cargar el componente
  }, []);

  const getPeriodos = () => {
    axiosInstance
      .get("periods")
      .then((response) => {
        setPeriodos(response.data);
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: "Ha ocurrido un error al cargar los periodos.",
          icon: "error",
        });
        console.error("Error:", error);
      });
  };

  const handleViewHorario = (profesor: Profesor) => {
    setSelectedProfesor(profesor);
    setOpenHorario(true);
  };

  const handleCloseHorario = () => {
    setOpenHorario(false);
    setSelectedProfesor(null);
    setSelectedPeriodo(null);
  };

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
      subjects: [],
      availabilities: [],
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

    if (!newProfesor.firstname) newErrors.firstname = "El nombre es requerido"
    if (!newProfesor.lastname) newErrors.lastname = "El apellido es requerido"
    if (!newProfesor.identification) newErrors.identification = "El número de identificación es requerido"
    if (!newProfesor.entry_date) newErrors.entry_date = "La fecha de ingreso es requerida"
    if (newProfesor.subjects.length === 0) newErrors.subjects = "Debe seleccionar al menos una asignatura"
    if (newProfesor.availabilities.length === 0)
      newErrors.availabilities = "Debe seleccionar al menos un día de disponibilidad"

    newProfesor.availabilities.forEach((d) => {
      if (!d.start_time || !d.end_time) {
        newErrors[`availability_${d.dayOfWeek}`] = "Debe seleccionar hora de inicio y fin"
      } else if (d.end_time <= d.start_time) {
        newErrors[`availability_${d.dayOfWeek}`] = "La hora de fin debe ser mayor que la hora de inicio"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatToISO = (timeString: any) => {
    const currentDate = new Date()
    const [hours, minutes] = timeString.split(":")
    currentDate.setUTCHours(hours, minutes, 0, 0)
    console.log(currentDate.toISOString())
    return currentDate.toISOString()
  }

  const handleSave = () => {
    const availabilities = newProfesor.availabilities.map((obj) => ({
      id: obj.id, // Incluir el ID si existe
      dayOfWeek: obj.dayOfWeek,
      start_time: formatToISO(obj.start_time),
      end_time: formatToISO(obj.end_time),
    }));
  
    const profesorToAdd = {
      firstname: newProfesor.firstname,
      lastname: newProfesor.lastname,
      identification: newProfesor.identification,
      entry_date: newProfesor.entry_date,
      subjects: newProfesor.subjects,
      availabilities: availabilities,
    };
  
    if (validateForm()) {
      if (editingProfesor) {
        axiosInstance
          .patch(`teachers/${editingProfesor.id}`, profesorToAdd)
          .then(() => {
            Swal.fire({
              title: "¡Bien!",
              text: "Profesor actualizado correctamente.",
              icon: "success",
            });
            getTeachers();
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al actualizar el profesor.",
              icon: "error",
            });
            console.error("Error:", error);
          });
      } else {
        axiosInstance
          .post("teachers", profesorToAdd)
          .then(() => {
            Swal.fire({
              title: "¡Bien!",
              text: "Profesor creado correctamente.",
              icon: "success",
            });
            getTeachers();
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al crear el profesor.",
              icon: "error",
            });
            console.error("Error:", error);
          });
      }
      handleClose("", "");
    }
  };

  const getSubjects = () => {
    axiosInstance
      .get("subjects")
      .then((response: any) => {
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
    setEditingProfesor(profesor);
    console.log("Profesor a editar:", profesor);
  
    // Transform the subjects array to match what the Select component expects
    const subjectIds = Array.isArray(profesor.subjects)
      ? profesor.subjects.map((subject: any) =>
          typeof subject === "object" && subject.subjectId ? subject.subjectId : subject,
        )
      : [];
  
    // Transform availabilities to extract just the time part from ISO strings
    const transformedAvailabilities = profesor.availabilities.map((avail) => {
      const startTime = extractTimeFromISO(avail.start_time);
      const endTime = extractTimeFromISO(avail.end_time);
      console.log(`Día: ${avail.dayOfWeek}, Original start_time: ${avail.start_time}, Extraído: ${startTime}`);
      console.log(`Día: ${avail.dayOfWeek}, Original end_time: ${avail.end_time}, Extraído: ${endTime}`);
  
      return {
        id: avail.id, // Incluir el ID
        dayOfWeek: avail.dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      };
    });
  
    setNewProfesor({
      ...profesor,
      entry_date: new Date(profesor.entry_date).toISOString().split("T")[0],
      subjects: subjectIds,
      availabilities: transformedAvailabilities,
    });
    setOpen(true);
  };

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
          .then(() => {
            Swal.fire("¡Eliminada!", "El profesor ha sido eliminad.", "success")
            getTeachers()
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
      availabilities: prev.availabilities.map((d) => {
        if (d.dayOfWeek === dayOfWeek) {
          return { ...d, [tipo]: valor };
        }
        return d;
      }),
    }));
    setErrors((prev) => ({ ...prev, [`availability_${dayOfWeek}`]: "" }));
  };

  const handlesubjectIdsChange = (event: SelectChangeEvent<number[]>) => {
    setNewProfesor((prev) => ({
      ...prev,
      subjects: event.target.value as number[],
    }))
    setErrors((prev) => ({ ...prev, subjects: "" }))
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    console.log(event)
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleavailabilityChange = (dayOfWeek: string, checked: boolean) => {
    setNewProfesor((prev) => {
      let updatedAvailability = [...prev.availabilities];
      if (checked) {
        updatedAvailability.push({ id: undefined, dayOfWeek, start_time: "", end_time: "" });
      } else {
        updatedAvailability = updatedAvailability.filter((d) => d.dayOfWeek !== dayOfWeek);
      }
      return { ...prev, availabilities: updatedAvailability };
    });
    setErrors((prev) => ({ ...prev, availabilities: "" }));
  };

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
                    Asignaturas:{" "}
                    {profesor.subjects
                      .map((a: any) => {
                        const subjectId = typeof a === "object" && a !== null && "subjectId" in a ? a.subjectId : a
                        const subject: any = subjects.find((s: any) => s.id === subjectId)
                        return subject ? subject.name : `Asignatura ${subjectId}`
                      })
                      .join(", ")}
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
                  <Tooltip title="Ver Horario">
                    <IconButton onClick={() => handleViewHorario(profesor)}>
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
                  <TableCell>
                    {new Date(profesor.entry_date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {profesor.subjects.map((asignatura: any) => {
                      // Extract the subject ID correctly whether it's an object or direct ID
                      const subjectId =
                        typeof asignatura === "object" && asignatura.subjectId ? asignatura.subjectId : asignatura
                      // Find the corresponding subject from the subjects array
                      const subject: any = subjects.find((s: any) => s.id === subjectId)
                      return (
                        <Chip
                          key={subjectId}
                          label={subject ? subject.name : `Asignatura ${subjectId}`}
                          sx={{ m: 0.5 }}
                        />
                      )
                    })}
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
                    <Tooltip title="Ver Horario">
                    <IconButton onClick={() => handleViewHorario(profesor)}>
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
                value={newProfesor.entry_date ? new Date(newProfesor.entry_date).toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, entry_date: e.target.value })
                  setErrors((prev) => ({ ...prev, entry_date: "" }))
                }}
                error={!!errors.entry_date}
                helperText={errors.entry_date}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" error={!!errors.subjects}>
                <InputLabel id="subjects-label">Asignaturas</InputLabel>
                <Select
                  labelId="subjects-label"
                  multiple
                  value={newProfesor.subjects}
                  onChange={handlesubjectIdsChange}
                  renderValue={() => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {newProfesor.subjects.map((asignatura: any) => {
                        // Extract the subject ID correctly whether it's an object or direct ID
                        const subjectId =
                          typeof asignatura === "object" && asignatura.subjectId ? asignatura.subjectId : asignatura
                        // Find the corresponding subject from the subjects array
                        const subject: any = subjects.find((s: any) => s.id === subjectId)
                        return (
                          <Chip
                            key={subjectId}
                            label={subject ? subject.name : `Asignatura ${subjectId}`}
                            sx={{ m: 0.5 }}
                          />
                        )
                      })}
                    </Box>
                  )}
                >
                  {subjects.map((asignatura: any) => (
                    <MenuItem key={asignatura.id} value={asignatura.id}>
                      {asignatura.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.subjects && <FormHelperText>{errors.subjects}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
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
                        checked={newProfesor.availabilities.some((d) => d.dayOfWeek === dayOfWeek)}
                        onChange={(e) => handleavailabilityChange(dayOfWeek, e.target.checked)}
                      />
                    }
                    label={dayOfWeek}
                  />
                  {newProfesor.availabilities.some((d) => d.dayOfWeek === dayOfWeek) && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <FormControl fullWidth error={!!errors[`availability_${dayOfWeek}`]}>
                        <InputLabel>Hora de inicio</InputLabel>
                        <Select
                          value={newProfesor.availabilities.find((d) => d.dayOfWeek === dayOfWeek)?.start_time || ""}
                          onChange={(e) => handleHoraChange(dayOfWeek, "start_time", e.target.value as string)}
                        >
                          {horas.map((hora: any) => (
                            <MenuItem key={hora} value={hora}>
                              {hora}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth error={!!errors[`availability_${dayOfWeek}`]}>
                        <InputLabel>Hora de fin</InputLabel>
                        <Select
                          value={newProfesor.availabilities.find((d) => d.dayOfWeek === dayOfWeek)?.end_time || ""}
                          onChange={(e) => handleHoraChange(dayOfWeek, "end_time", e.target.value as string)}
                        >
                          {horas
                            .filter((hora: any) => {
                              const startTime = newProfesor.availabilities.find(
                                (d) => d.dayOfWeek === dayOfWeek,
                              )?.start_time
                              return startTime ? hora > startTime : true
                            })
                            .map((hora: any) => (
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
          <Button onClick={()=>handleClose("","")}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openHorario} onClose={handleCloseHorario} fullWidth maxWidth="md">
        <DialogTitle>Horario del Profesor</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="periodo-label">Periodo</InputLabel>
            <Select
              labelId="periodo-label"
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value as number)}
            >
              {periodos.map((periodo:any) => (
                <MenuItem key={periodo.id} value={periodo.id}>
                  {periodo.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedProfesor && selectedPeriodo && (
            <HorarioProfesor profesor={selectedProfesor} periodoId={selectedPeriodo} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHorario}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Profesores

