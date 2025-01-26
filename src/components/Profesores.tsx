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
  FormControlLabel,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import type { Asignatura } from "./Asignaturas"

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

interface ProfesoresProps {
  periodoId: number
  profesores: Profesor[]
  updateProfesores: (newProfesores: Profesor[]) => void
  asignaturas: Asignatura[]
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

const Profesores: React.FC<ProfesoresProps> = ({ periodoId, profesores, updateProfesores, asignaturas }) => {
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
    if (editingProfesor) {
      updateProfesores(
        profesores.map((p) => (p.id === editingProfesor.id ? { ...editingProfesor, ...newProfesor } : p)),
      )
    } else {
      const profesorToAdd = { ...newProfesor, id: Date.now() }
      updateProfesores([...profesores, profesorToAdd])
    }
    handleClose()
  }

  const handleEdit = (profesor: Profesor) => {
    setEditingProfesor(profesor)
    setNewProfesor({ ...profesor })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    updateProfesores(profesores.filter((p) => p.id !== id))
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
      disponibilidad: prev.disponibilidad.map((d) => (d.dia === dia ? { ...d, [tipo]: valor } : d)),
    }))
  }

  const handleAsignaturasChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewProfesor((prev) => ({
      ...prev,
      asignaturas: event.target.value as number[],
    }))
  }

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Profesor
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Primer Nombre</TableCell>
              <TableCell>Segundo Nombre</TableCell>
              <TableCell>Número de Identificación</TableCell>
              <TableCell>Fecha de Ingreso</TableCell>
              <TableCell>Asignaturas</TableCell>
              <TableCell>Disponibilidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profesores.map((profesor) => (
              <TableRow key={profesor.id}>
                <TableCell>{profesor.primerNombre}</TableCell>
                <TableCell>{profesor.segundoNombre}</TableCell>
                <TableCell>{profesor.numeroIdentificacion}</TableCell>
                <TableCell>{profesor.fechaIngreso}</TableCell>
                <TableCell>
                  {profesor.asignaturas.map((asignaturaId) => (
                    <Chip
                      key={asignaturaId}
                      label={asignaturas.find((a) => a.id === asignaturaId)?.nombreAsignatura}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {profesor.disponibilidad.map((d) => `${d.dia}: ${d.horaInicio}-${d.horaFin}`).join(", ")}
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                        <Chip key={value} label={asignaturas.find((a) => a.id === value)?.nombreAsignatura} />
                      ))}
                    </Box>
                  )}
                >
                  {asignaturas.map((asignatura) => (
                    <MenuItem key={asignatura.id} value={asignatura.id}>
                      {asignatura.nombreAsignatura}
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
              <Grid item xs={12} key={dia}>
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
                      <TextField
                        label="Hora de inicio"
                        type="time"
                        value={newProfesor.disponibilidad.find((d) => d.dia === dia)?.horaInicio || ""}
                        onChange={(e) => handleHoraChange(dia, "horaInicio", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        sx={{ flexGrow: 1 }}
                      />
                      <TextField
                        label="Hora de fin"
                        type="time"
                        value={newProfesor.disponibilidad.find((d) => d.dia === dia)?.horaFin || ""}
                        onChange={(e) => handleHoraChange(dia, "horaFin", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        sx={{ flexGrow: 1 }}
                      />
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

