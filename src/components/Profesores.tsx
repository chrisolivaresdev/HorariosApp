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

interface DisponibilidadDia {
  dia: string
  horaInicio: string
  horaFin: string
}

interface Profesor {
  id: number
  primerNombre: string
  apellido: string
  numeroIdentificacion: string
  fechaIngreso: string
  asignaturas: number[]
  disponibilidad: DisponibilidadDia[]
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
  const [filteredProfesores, setFilteredProfesores] = useState<Profesor[]>([])
  const [open, setOpen] = useState(false)
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null)
  const [newProfesor, setNewProfesor] = useState<Omit<Profesor, "id">>({
    primerNombre: "",
    apellido: "",
    numeroIdentificacion: "",
    fechaIngreso: "",
    asignaturas: [],
    disponibilidad: [],
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    const filtered = profesores.filter((profesor) =>
      `${profesor.primerNombre} ${profesor.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProfesores(filtered)
    setPage(0)
  }, [searchTerm, profesores])

  const handleOpen = () => {
    setEditingProfesor(null)
    setNewProfesor({
      primerNombre: "",
      apellido: "",
      numeroIdentificacion: "",
      fechaIngreso: "",
      asignaturas: [],
      disponibilidad: [],
    })
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!newProfesor.primerNombre) newErrors.primerNombre = "El nombre es requerido"
    if (!newProfesor.apellido) newErrors.apellido = "El apellido es requerido"
    if (!newProfesor.numeroIdentificacion) newErrors.numeroIdentificacion = "El número de identificación es requerido"
    if (!newProfesor.fechaIngreso) newErrors.fechaIngreso = "La fecha de ingreso es requerida"
    if (newProfesor.asignaturas.length === 0) newErrors.asignaturas = "Debe seleccionar al menos una asignatura"
    if (newProfesor.disponibilidad.length === 0)
      newErrors.disponibilidad = "Debe seleccionar al menos un día de disponibilidad"

    newProfesor.disponibilidad.forEach((d) => {
      if (!d.horaInicio || !d.horaFin) {
        newErrors[`disponibilidad_${d.dia}`] = "Debe seleccionar hora de inicio y fin"
      } else if (d.horaFin <= d.horaInicio) {
        newErrors[`disponibilidad_${d.dia}`] = "La hora de fin debe ser mayor que la hora de inicio"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      if (editingProfesor) {
        setProfesores(profesores.map((p) => (p.id === editingProfesor.id ? { ...editingProfesor, ...newProfesor } : p)))
      } else {
        const profesorToAdd = { ...newProfesor, id: Date.now() }
        setProfesores([...profesores, profesorToAdd])
      }
      console.log("Profesor guardado:", editingProfesor ? { ...editingProfesor, ...newProfesor } : newProfesor)
      handleClose()
    }
  }

  const handleEdit = (profesor: Profesor) => {
    setEditingProfesor(profesor)
    setNewProfesor({ ...profesor })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    setProfesores(profesores.filter((p) => p.id !== id))
  }

  const handleDisponibilidadChange = (dia: string, checked: boolean) => {
    if (checked) {
      setNewProfesor((prev) => ({
        ...prev,
        disponibilidad: [...prev.disponibilidad, { dia, horaInicio: "", horaFin: "" }],
      }))
    } else {
      setNewProfesor((prev) => ({
        ...prev,
        disponibilidad: prev.disponibilidad.filter((d) => d.dia !== dia),
      }))
    }
    setErrors((prev) => ({ ...prev, disponibilidad: "" }))
  }

  const handleHoraChange = (dia: string, tipo: "horaInicio" | "horaFin", valor: string) => {
    setNewProfesor((prev) => ({
      ...prev,
      disponibilidad: prev.disponibilidad.map((d) => {
        if (d.dia === dia) {
          if (tipo === "horaInicio") {
            return { ...d, [tipo]: valor, horaFin: "" }
          } else {
            return { ...d, [tipo]: valor }
          }
        }
        return d
      }),
    }))
    setErrors((prev) => ({ ...prev, [`disponibilidad_${dia}`]: "" }))
  }

  const handleAsignaturasChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewProfesor((prev) => ({
      ...prev,
      asignaturas: event.target.value as number[],
    }))
    setErrors((prev) => ({ ...prev, asignaturas: "" }))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
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
                  <Typography variant="h6">{`${profesor.primerNombre} ${profesor.apellido}`}</Typography>
                  <Typography variant="body2">ID: {profesor.numeroIdentificacion}</Typography>
                  <Typography variant="body2">Ingreso: {profesor.fechaIngreso}</Typography>
                  <Typography variant="body2">
                    Asignaturas: {profesor.asignaturas.map((a) => `Asignatura ${a}`).join(", ")}
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
                  <TableCell>{`${profesor.primerNombre} ${profesor.apellido}`}</TableCell>
                  <TableCell>{profesor.numeroIdentificacion}</TableCell>
                  <TableCell>{profesor.fechaIngreso}</TableCell>
                  <TableCell>
                    {profesor.asignaturas.map((asignaturaId) => (
                      <Chip key={asignaturaId} label={`Asignatura ${asignaturaId}`} sx={{ m: 0.5 }} />
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
                value={newProfesor.primerNombre}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, primerNombre: e.target.value })
                  setErrors((prev) => ({ ...prev, primerNombre: "" }))
                }}
                error={!!errors.primerNombre}
                helperText={errors.primerNombre}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Apellido"
                type="text"
                fullWidth
                value={newProfesor.apellido}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, apellido: e.target.value })
                  setErrors((prev) => ({ ...prev, apellido: "" }))
                }}
                error={!!errors.apellido}
                helperText={errors.apellido}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Número de Identificación"
                type="text"
                fullWidth
                value={newProfesor.numeroIdentificacion}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, numeroIdentificacion: e.target.value })
                  setErrors((prev) => ({ ...prev, numeroIdentificacion: "" }))
                }}
                error={!!errors.numeroIdentificacion}
                helperText={errors.numeroIdentificacion}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Ingreso"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newProfesor.fechaIngreso}
                onChange={(e) => {
                  setNewProfesor({ ...newProfesor, fechaIngreso: e.target.value })
                  setErrors((prev) => ({ ...prev, fechaIngreso: "" }))
                }}
                error={!!errors.fechaIngreso}
                helperText={errors.fechaIngreso}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" error={!!errors.asignaturas}>
                <InputLabel id="asignaturas-label">Asignaturas</InputLabel>
                <Select
                  labelId="asignaturas-label"
                  multiple
                  value={newProfesor.asignaturas}
                  onChange={handleAsignaturasChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip key={value} label={`Asignatura ${value}`} />
                      ))}
                    </Box>
                  )}
                >
                  {[1, 2, 3, 4, 5].map((id) => (
                    <MenuItem key={id} value={id}>
                      {`Asignatura ${id}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.asignaturas && <FormHelperText>{errors.asignaturas}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Disponibilidad
          </Typography>
          {errors.disponibilidad && (
            <FormHelperText error>{errors.disponibilidad}</FormHelperText>
          )}
          <Grid container spacing={2}>
            {diasSemana.map((dia) => (
              <Grid item xs={12} sm={6} md={4} key={dia}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newProfesor.disponibilidad.some((d) => d.dia === dia)}
                        onChange={(e) => handleDisponibilidadChange(dia, e.target.checked)}
                      />
                    }
                    label={dia}
                  />
                  {newProfesor.disponibilidad.some((d) => d.dia === dia) && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <FormControl fullWidth error={!!errors[`disponibilidad_${dia}`]}>
                        <InputLabel>Hora de inicio</InputLabel>
                        <Select
                          value={newProfesor.disponibilidad.find((d) => d.dia === dia)?.horaInicio || ""}
                          onChange={(e) => handleHoraChange(dia, "horaInicio", e.target.value as string)}
                        >
                          {horas.map((hora) => (
                            <MenuItem key={hora} value={hora}>
                              {hora}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth error={!!errors[`disponibilidad_${dia}`]}>
                        <InputLabel>Hora de fin</InputLabel>
                        <Select
                          value={newProfesor.disponibilidad.find((d) => d.dia === dia)?.horaFin || ""}
                          onChange={(e) => handleHoraChange(dia, "horaFin", e.target.value as string)}
                        >
                          {horas
                            .filter(
                              (hora) =>
                                hora > (newProfesor.disponibilidad.find((d) => d.dia === dia)?.horaInicio || ""),
                            )
                            .map((hora) => (
                              <MenuItem key={hora} value={hora}>
                                {hora}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                  {errors[`disponibilidad_${dia}`] && (
                    <FormHelperText error>{errors[`disponibilidad_${dia}`]}</FormHelperText>
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

