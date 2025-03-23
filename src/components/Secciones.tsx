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
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  TablePagination,
  InputAdornment,
  FormHelperText,
  IconButton,
  Tooltip,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material"
import axiosInstance from "../axios/axiosInstance"
import Swal from "sweetalert2"

interface Seccion {
  id: number
  name: string
  total_students: number
  journey: string
  quarter: string
}


const Secciones: React.FC = () => {
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [filteredSecciones, setFilteredSecciones] = useState<Seccion[]>([])
  const [open, setOpen] = useState(false)
  const [editingSeccion, setEditingSeccion] = useState<Seccion | null>(null)
  const [newSeccion, setNewSeccion] = useState<Omit<Seccion, "id">>({
    name: "",
    total_students: 0,
    journey: "",
    quarter: "",
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    getSecciones()
  }, [])

  useEffect(() => {
    const filtered = secciones.filter((seccion) => seccion?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredSecciones(filtered)
    setPage(0)
  }, [searchTerm, secciones])

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

  const handleOpen = () => {
    setEditingSeccion(null)
    setNewSeccion({
      name: "",
      total_students: 0,
      journey: "",
      quarter: "",
    })
    setErrors({})
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
    setErrors({});
  };
  

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!newSeccion.name) newErrors.name = "El nombre de la sección es requerido"
    if (newSeccion.total_students <= 0) newErrors.total_students = "El número de estudiantes debe ser mayor a 0"
    if (!newSeccion.journey) newErrors.journey = "La Trayecto es requeridao"
    if (!newSeccion.quarter) newErrors.quarter = "El trimestre es requerido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      if (editingSeccion) {
        axiosInstance
          .patch(`sections/${editingSeccion.id}`, newSeccion)
          .then(() => {
            Swal.fire({
              title: "¡Bien!",
              text: "Sección actualizada correctamente.",
              icon: "success",
            })
            getSecciones()
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
          .post("sections", newSeccion)
          .then(() => {
            Swal.fire({
              title: "¡Bien!",
              text: "Sección creada correctamente.",
              icon: "success",
            })
            getSecciones()
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
      handleClose("","")
    }
  }

  const handleEdit = (seccion: Seccion) => {
    setEditingSeccion(seccion)
    setNewSeccion({
      name: seccion.name,
      total_students: seccion.total_students,
      journey: seccion.journey,
      quarter: seccion.quarter,
    })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar esta sección?",
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
          .delete(`sections/${id}`)
          .then(() => {
            Swal.fire("¡Eliminada!", "La sección ha sido eliminada.", "success")
            getSecciones()
          })
          .catch((error) => {
            Swal.fire({
              title: "¡Error!",
              text: "Ha ocurrido un error al eliminar la sección.",
              icon: "error",
            })
            console.error("Error:", error)
          })
      }
    })
  }

  const handleChangePage = (event: any, newPage: number) => {
    console.log(event)
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
                  <Typography variant="h6">{seccion.name}</Typography>
                  <Typography variant="body2">Estudiantes: {seccion.total_students}</Typography>
                  <Typography variant="body2">Trayecto: {seccion.journey}</Typography>
                  <Typography variant="body2">Trimestre: {seccion.quarter}</Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEdit(seccion)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleDelete(seccion.id)}>
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
                <TableCell>Estudiantes</TableCell>
                <TableCell>Trayecto</TableCell>
                <TableCell>Trimestre</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSecciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((seccion) => (
                <TableRow key={seccion.id}>
                  <TableCell>{seccion.name}</TableCell>
                  <TableCell>{seccion.total_students}</TableCell>
                  <TableCell>{seccion.journey}</TableCell>
                  <TableCell>{seccion.quarter}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(seccion)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(seccion.id)}>
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
        count={filteredSecciones.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingSeccion ? "Editar Sección" : "Agregar Nueva Sección"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre de la Sección"
                type="text"
                fullWidth
                value={newSeccion.name}
                onChange={(e) => {
                  setNewSeccion({ ...newSeccion, name: e.target.value })
                  setErrors((prev) => ({ ...prev, name: "" }))
                }}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Número de Estudiantes"
                type="number"
                fullWidth
                value={newSeccion.total_students}
                onChange={(e) => {
                  setNewSeccion({ ...newSeccion, total_students: Number.parseInt(e.target.value) || 0 })
                  setErrors((prev) => ({ ...prev, total_students: "" }))
                }}
                error={!!errors.total_students}
                helperText={errors.total_students}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" error={!!errors.journey}>
                <InputLabel id="journey-label">Trayecto</InputLabel>
                <Select
                  labelId="journey-label"
                  value={newSeccion.journey}
                  onChange={(e) => {
                    setNewSeccion({ ...newSeccion, journey: e.target.value as string })
                    setErrors((prev) => ({ ...prev, journey: "" }))
                  }}>
                      <MenuItem value={"0"}>Inicial</MenuItem>
                      <MenuItem value={"1"}>1</MenuItem>
                      <MenuItem value={"2"}>2</MenuItem>
                      <MenuItem value={"3"}>Prosecución</MenuItem>
                      <MenuItem value={"4"}>3</MenuItem>
                      <MenuItem value={"5"}>4</MenuItem>
                </Select>
                {errors.journey && <FormHelperText>{errors.journey}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" error={!!errors.quarter}>
                <InputLabel id="quarter-label">Trimestre</InputLabel>
                <Select
                  labelId="quarter-label"
                  value={newSeccion.quarter}
                  onChange={(e) => {
                    setNewSeccion({ ...newSeccion, quarter: e.target.value as string })
                    setErrors((prev) => ({ ...prev, quarter: "" }))
                  }}
                >
                    <MenuItem value={"1"}>1</MenuItem>
                    <MenuItem value={"2"}>2</MenuItem>
                    <MenuItem value={"3"}>3</MenuItem>
                </Select>
                {errors.quarter && <FormHelperText>{errors.quarter}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose("", "")}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Secciones

