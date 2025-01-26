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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  CardActions,
  Chip,
  OutlinedInput,
  Box,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

export interface Asignatura {
  id: number
  nombreAsignatura: string
  tipoAsignatura: string
  duracionAsignatura: string
  carrera: string
  trayecto: number
  trimestres: number[]
}

const Asignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [open, setOpen] = useState(false)
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null)
  const [newAsignatura, setNewAsignatura] = useState<Omit<Asignatura, "id">>({
    nombreAsignatura: "",
    tipoAsignatura: "",
    duracionAsignatura: "",
    carrera: "",
    trayecto: 1,
    trimestres: [],
  })
  const [carreras, setCarreras] = useState<string[]>([
    "Ingeniería Informática",
    "Ingeniería Civil",
    "Administración de Empresas",
    "Psicología",
    "Medicina",
  ])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (newAsignatura.duracionAsignatura === "Anual") {
      setNewAsignatura({ ...newAsignatura, trimestres: [1, 2, 3] })
    } else if (newAsignatura.duracionAsignatura === "Trimestral") {
      setNewAsignatura({ ...newAsignatura, trimestres: newAsignatura.trimestres.slice(0, 1) })
    } else if (newAsignatura.duracionAsignatura === "Semestral") {
      setNewAsignatura({ ...newAsignatura, trimestres: newAsignatura.trimestres.slice(0, 2) })
    }
  }, [newAsignatura])

  const handleOpen = () => {
    setEditingAsignatura(null)
    setNewAsignatura({
      nombreAsignatura: "",
      tipoAsignatura: "",
      duracionAsignatura: "",
      carrera: "",
      trayecto: 1,
      trimestres: [],
    })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (editingAsignatura) {
      setAsignaturas(
        asignaturas.map((a) => (a.id === editingAsignatura.id ? { ...editingAsignatura, ...newAsignatura } : a)),
      )
    } else {
      const asignaturaToAdd = { ...newAsignatura, id: Date.now() }
      setAsignaturas([...asignaturas, asignaturaToAdd])
    }
    if (!carreras.includes(newAsignatura.carrera)) {
      setCarreras([...carreras, newAsignatura.carrera])
    }
    handleClose()
  }

  const handleEdit = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura)
    setNewAsignatura({ ...asignatura })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    setAsignaturas(asignaturas.filter((a) => a.id !== id))
  }

  const handleTrimestresChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedTrimestres = event.target.value as number[]
    let updatedTrimestres = selectedTrimestres

    if (newAsignatura.duracionAsignatura === "Trimestral" && selectedTrimestres.length > 1) {
      updatedTrimestres = [selectedTrimestres[selectedTrimestres.length - 1]]
    } else if (newAsignatura.duracionAsignatura === "Semestral" && selectedTrimestres.length > 2) {
      updatedTrimestres = selectedTrimestres.slice(0, 2)
    }

    setNewAsignatura({
      ...newAsignatura,
      trimestres: updatedTrimestres,
    })
  }

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Asignatura
      </Button>
      {isMobile ? (
        <Grid container spacing={2}>
          {asignaturas.map((asignatura) => (
            <Grid item xs={12} key={asignatura.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{asignatura.nombreAsignatura}</Typography>
                  <Typography variant="body2">Tipo: {asignatura.tipoAsignatura}</Typography>
                  <Typography variant="body2">Duración: {asignatura.duracionAsignatura}</Typography>
                  <Typography variant="body2">Carrera: {asignatura.carrera}</Typography>
                  <Typography variant="body2">Trayecto: {asignatura.trayecto}</Typography>
                  <Typography variant="body2">
                    Trimestres: {asignatura.trimestres.map((t) => `${t}`).join(", ")}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(asignatura)}>
                    Editar
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(asignatura.id)}>
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
                <TableCell>Tipo</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Carrera</TableCell>
                <TableCell>Trayecto</TableCell>
                <TableCell>Trimestres</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asignaturas.map((asignatura) => (
                <TableRow key={asignatura.id}>
                  <TableCell>{asignatura.nombreAsignatura}</TableCell>
                  <TableCell>{asignatura.tipoAsignatura}</TableCell>
                  <TableCell>{asignatura.duracionAsignatura}</TableCell>
                  <TableCell>{asignatura.carrera}</TableCell>
                  <TableCell>{asignatura.trayecto}</TableCell>
                  <TableCell>{asignatura.trimestres.map((t) => `${t}`).join(", ")}</TableCell>
                  <TableCell>
                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(asignatura)}>
                      Editar
                    </Button>
                    <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(asignatura.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingAsignatura ? "Editar Asignatura" : "Agregar Nueva Asignatura"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre de la Asignatura"
                type="text"
                fullWidth
                value={newAsignatura.nombreAsignatura}
                onChange={(e) => setNewAsignatura({ ...newAsignatura, nombreAsignatura: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Tipo de Asignatura</InputLabel>
                <Select
                  value={newAsignatura.tipoAsignatura}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, tipoAsignatura: e.target.value as string })}
                >
                  <MenuItem value="Teórica">Teórica</MenuItem>
                  <MenuItem value="Práctica">Práctica</MenuItem>
                  <MenuItem value="Teórico-Práctica">Teórico-Práctica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Duración de la Asignatura</InputLabel>
                <Select
                  value={newAsignatura.duracionAsignatura}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, duracionAsignatura: e.target.value as string })}
                >
                  <MenuItem value="Trimestral">Trimestral</MenuItem>
                  <MenuItem value="Semestral">Semestral</MenuItem>
                  <MenuItem value="Anual">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Carrera</InputLabel>
                <Select
                  value={newAsignatura.carrera}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, carrera: e.target.value as string })}
                >
                  {carreras.map((carrera) => (
                    <MenuItem key={carrera} value={carrera}>
                      {carrera}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Trayecto</InputLabel>
                <Select
                  value={newAsignatura.trayecto}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, trayecto: Number(e.target.value) })}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Trimestres</InputLabel>
                <Select
                  multiple
                  value={newAsignatura.trimestres}
                  onChange={handleTrimestresChange}
                  input={<OutlinedInput label="Trimestres" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  disabled={newAsignatura.duracionAsignatura === "Anual"}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
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
    </>
  )
}

export default Asignaturas

