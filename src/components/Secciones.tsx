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
  Box,
  TablePagination,
  InputAdornment,
  FormHelperText,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
} from "@mui/icons-material"
import GeneradorHorario from "./GeneradorHorario"

interface Seccion {
  id: number
  nombreSeccion: string
  totalEstudiantes: number
  trayecto: number
  trimestre: number
}

interface SeccionesProps {
  periodoId: number
  secciones: Seccion[]
  updateSecciones: (newSecciones: Seccion[]) => void
  isMobile: boolean
  profesores?: any[]
  materias?: any[]
  aulas?: any[]
}

const Secciones: React.FC<SeccionesProps> = ({
  periodoId,
  secciones,
  updateSecciones,
  isMobile,
  profesores = [],
  materias = [],
  aulas = [],
}) => {
  const [open, setOpen] = useState(false)
  const [openHorario, setOpenHorario] = useState(false)
  const [editingSeccion, setEditingSeccion] = useState<Seccion | null>(null)
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null)
  const [newSeccion, setNewSeccion] = useState<Omit<Seccion, "id">>({
    nombreSeccion: "",
    totalEstudiantes: 0,
    trayecto: 1,
    trimestre: 1,
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSecciones, setFilteredSecciones] = useState<Seccion[]>(secciones)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const filtered = secciones.filter((seccion) =>
      seccion.nombreSeccion.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSecciones(filtered)
    setPage(0)
  }, [searchTerm, secciones])

  const handleOpen = () => {
    setEditingSeccion(null)
    setNewSeccion({ nombreSeccion: "", totalEstudiantes: 0, trayecto: 1, trimestre: 1 })
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setErrors({})
  }

  const handleOpenHorario = (seccion: Seccion) => {
    setSelectedSeccion(seccion)
    setOpenHorario(true)
  }

  const handleCloseHorario = () => {
    setSelectedSeccion(null)
    setOpenHorario(false)
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    if (!newSeccion.nombreSeccion) newErrors.nombreSeccion = "El nombre de la sección es requerido"
    if (!newSeccion.totalEstudiantes || newSeccion.totalEstudiantes <= 0) {
      newErrors.totalEstudiantes = "El total de estudiantes debe ser mayor que 0"
    }
    if (newSeccion.trayecto === undefined) newErrors.trayecto = "El trayecto es requerido"
    if (newSeccion.trimestre === undefined) newErrors.trimestre = "El trimestre es requerido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      if (editingSeccion) {
        const updatedSecciones = secciones.map((s) =>
          s.id === editingSeccion.id ? { ...editingSeccion, ...newSeccion } : s,
        )
        updateSecciones(updatedSecciones)
        console.log(`Sección actualizada en periodo ${periodoId}:`, { ...editingSeccion, ...newSeccion })
      } else {
        const seccionToAdd = { ...newSeccion, id: Date.now() }
        const updatedSecciones = [...secciones, seccionToAdd]
        updateSecciones(updatedSecciones)
        console.log(`Nueva sección agregada en periodo ${periodoId}:`, seccionToAdd)
      }
      handleClose()
    }
  }

  const handleEdit = (seccion: Seccion) => {
    setEditingSeccion(seccion)
    setNewSeccion({ ...seccion })
    setErrors({})
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    updateSecciones(secciones.filter((s) => s.id !== id))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleTrayectoChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const trayectoValue = event.target.value as number
    setNewSeccion((prev) => ({
      ...prev,
      trayecto: trayectoValue,
      trimestre: trayectoValue === 0 ? 1 : prev.trimestre,
    }))
    setErrors((prev) => ({ ...prev, trayecto: "" }))
  }

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Agregar Sección
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
          {filteredSecciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((seccion) => (
            <Grid item xs={12} key={seccion.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{seccion.nombreSeccion}</Typography>
                  <Typography variant="body2">Estudiantes: {seccion.totalEstudiantes}</Typography>
                  <Typography variant="body2">
                    Trayecto: {seccion.trayecto === 0 ? "Inicial" : seccion.trayecto}
                  </Typography>
                  <Typography variant="body2">Trimestre: {seccion.trimestre}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(seccion)}>
                    Editar
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(seccion.id)}>
                    Eliminar
                  </Button>
                  <Button size="small" startIcon={<ScheduleIcon />} onClick={() => handleOpenHorario(seccion)}>
                    Generar Horario
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
                <TableCell>Nombre de la Sección</TableCell>
                <TableCell>Total de Estudiantes</TableCell>
                <TableCell>Trayecto</TableCell>
                <TableCell>Trimestre</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSecciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((seccion) => (
                <TableRow key={seccion.id}>
                  <TableCell>{seccion.nombreSeccion}</TableCell>
                  <TableCell>{seccion.totalEstudiantes}</TableCell>
                  <TableCell>{seccion.trayecto === 0 ? "Inicial" : seccion.trayecto}</TableCell>
                  <TableCell>{seccion.trimestre}</TableCell>
                  <TableCell>
                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(seccion)}>
                      Editar
                    </Button>
                    <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(seccion.id)}>
                      Eliminar
                    </Button>
                    <Button startIcon={<ScheduleIcon />} onClick={() => handleOpenHorario(seccion)}>
                      Generar Horario
                    </Button>
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
        count={filteredSecciones.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Dialog para agregar/editar sección */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingSeccion ? "Editar Sección" : "Agregar Nueva Sección"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Sección"
            type="text"
            fullWidth
            value={newSeccion.nombreSeccion}
            onChange={(e) => {
              setNewSeccion({ ...newSeccion, nombreSeccion: e.target.value })
              setErrors({ ...errors, nombreSeccion: "" })
            }}
            error={!!errors.nombreSeccion}
            helperText={errors.nombreSeccion}
          />
          <TextField
            margin="dense"
            label="Total de Estudiantes"
            type="number"
            fullWidth
            value={newSeccion.totalEstudiantes}
            onChange={(e) => {
              setNewSeccion({ ...newSeccion, totalEstudiantes: Number(e.target.value) })
              setErrors({ ...errors, totalEstudiantes: "" })
            }}
            error={!!errors.totalEstudiantes}
            helperText={errors.totalEstudiantes}
          />
          <FormControl fullWidth margin="dense" error={!!errors.trayecto}>
            <InputLabel>Trayecto</InputLabel>
            <Select value={newSeccion.trayecto} onChange={handleTrayectoChange}>
              <MenuItem value={0}>Inicial</MenuItem>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>Prosecución</MenuItem>
              <MenuItem value={4}>3</MenuItem>
              <MenuItem value={5}>4</MenuItem>
            </Select>
            {errors.trayecto && <FormHelperText>{errors.trayecto}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth margin="dense" error={!!errors.trimestre}>
            <InputLabel>Trimestre</InputLabel>
            <Select
              value={newSeccion.trimestre}
              onChange={(e) => {
                setNewSeccion({ ...newSeccion, trimestre: Number(e.target.value) })
                setErrors({ ...errors, trimestre: "" })
              }}
              disabled={newSeccion.trayecto === 0}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
            {errors.trimestre && <FormHelperText>{errors.trimestre}</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para el generador de horario */}
      <Dialog
        open={openHorario}
        onClose={handleCloseHorario}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
          },
        }}
      >
        <DialogTitle>
          Generar Horario - {selectedSeccion?.nombreSeccion}
          <Typography variant="subtitle2" color="text.secondary">
            Trayecto {selectedSeccion?.trayecto === 0 ? "Inicial" : selectedSeccion?.trayecto} - Trimestre{" "}
            {selectedSeccion?.trimestre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedSeccion && (
              <GeneradorHorario
                seccionId={selectedSeccion.id}
                profesores={profesores}
                materias={materias}
                aulas={aulas}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHorario}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Secciones

