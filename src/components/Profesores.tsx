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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

interface DisponibilidadDia {
  dia: string
  horaInicio: string
  horaFin: string
}

interface Profesor {
  id: number
  primerNombre: string
  segundoNombre: string
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
  const [open, setOpen] = useState(false)
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null)
  const [newProfesor, setNewProfesor] = useState<Omit<Profesor, "id">>({
    primerNombre: "",
    segundoNombre: "",
    numeroIdentificacion: "",
    fechaIngreso: "",
    asignaturas: [],
    disponibilidad: [],
  })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleOpen = () => {
    setEditingProfesor(null)
    setNewProfesor({
      primerNombre: "",
      segundoNombre: "",
      numeroIdentificacion: "",
      fechaIngreso: "",
      asignaturas: [],
      disponibilidad: [],
    })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (!validarHoras()) {
      alert("La hora de fin debe ser mayor que la hora de inicio en todos los días seleccionados.")
      return
    }

    if (editingProfesor) {
      setProfesores(profesores.map((p) => (p.id === editingProfesor.id ? { ...editingProfesor, ...newProfesor } : p)))
    } else {
      const profesorToAdd = { ...newProfesor, id: Date.now() }
      setProfesores([...profesores, profesorToAdd])
    }
    handleClose()
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
  }

  const handleHoraChange = (dia: string, tipo: "horaInicio" | "horaFin", valor: string) => {
    setNewProfesor((prev) => ({
      ...prev,
      disponibilidad: prev.disponibilidad.map((d) => {
        if (d.dia === dia) {
          if (tipo === "horaInicio") {
            // Si se cambia la hora de inicio, resetear la hora de fin
            return { ...d, [tipo]: valor, horaFin: "" }
          } else {
            // Si se cambia la hora de fin, asegurarse de que sea mayor que la hora de inicio
            return { ...d, [tipo]: valor }
          }
        }
        return d
      }),
    }))
  }

  const handleAsignaturasChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewProfesor((prev) => ({
      ...prev,
      asignaturas: event.target.value as number[],
    }))
  }

  const validarHoras = (): boolean => {
    return newProfesor.disponibilidad.every((d) => {
      if (d.horaInicio && d.horaFin) {
        return d.horaFin > d.horaInicio
      }
      return true // Si no hay horas seleccionadas, se considera válido
    })
  }

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Profesor
      </Button>
      {isMobile ? (
        <Grid container spacing={2}>
          {profesores.map((profesor) => (
            <Grid item xs={12} key={profesor.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{`${profesor.primerNombre} ${profesor.segundoNombre}`}</Typography>
                  <Typography variant="body2">ID: {profesor.numeroIdentificacion}</Typography>
                  <Typography variant="body2">Ingreso: {profesor.fechaIngreso}</Typography>
                  <Typography variant="body2">
                    Asignaturas: {profesor.asignaturas.map((a) => `Asignatura ${a}`).join(", ")}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(profesor)}>
                    Editar
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(profesor.id)}>
                    Eliminar
                  </Button>
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
              {profesores.map((profesor) => (
                <TableRow key={profesor.id}>
                  <TableCell>{`${profesor.primerNombre} ${profesor.segundoNombre}`}</TableCell>
                  <TableCell>{profesor.numeroIdentificacion}</TableCell>
                  <TableCell>{profesor.fechaIngreso}</TableCell>
                  <TableCell>
                    {profesor.asignaturas.map((asignaturaId) => (
                      <Chip key={asignaturaId} label={`Asignatura ${asignaturaId}`} sx={{ m: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(profesor)}>
                      Editar
                    </Button>
                    <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(profesor.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingProfesor ? "Editar Profesor" : "Agregar Nuevo Profesor"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Primer Nombre"
                type="text"
                fullWidth
                value={newProfesor.primerNombre}
                onChange={(e) => setNewProfesor({ ...newProfesor, primerNombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Segundo Nombre"
                type="text"
                fullWidth
                value={newProfesor.segundoNombre}
                onChange={(e) => setNewProfesor({ ...newProfesor, segundoNombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Número de Identificación"
                type="text"
                fullWidth
                value={newProfesor.numeroIdentificacion}
                onChange={(e) => setNewProfesor({ ...newProfesor, numeroIdentificacion: e.target.value })}
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
                onChange={(e) => setNewProfesor({ ...newProfesor, fechaIngreso: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
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
              </FormControl>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Disponibilidad
          </Typography>
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
                      <FormControl fullWidth>
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
                      <FormControl fullWidth>
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

