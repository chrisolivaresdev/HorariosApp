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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"

interface Aula {
  id:   string,
  name: string
  type: string
  max_capacity: number
}

interface AulasProps {
  periodId: number
  aulas: Aula[]
  setAula: () => void
  isMobile: boolean
}

const Aulas: React.FC<AulasProps> = ({ periodId, aulas, setAula, isMobile }) => {
  const [open, setOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [newAula, setNewAula] = useState<Omit<Aula, "id">>({
    name: "",
    type: "",
    max_capacity: 0,
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

  const getClassrooms = () => {
    axiosInstance
      .get(`classrooms/find-by-period/${periodId}`)
      .then((response) => {
        setAula(response.data)
        console.log(response.data)
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

  useEffect(() => {
    getClassrooms()
  }, [periodId])

  const handleOpen = () => {
    setEditingAula(null)
    setNewAula({ name: "", type: "", max_capacity: 0 })
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => {
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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      if (editingAula) {
        const aulaToAdd = { name: newAula.name, type: newAula.type, max_capacity: newAula.max_capacity }
        axiosInstance
        .patch(`classrooms/${editingAula.id}`, aulaToAdd)
        .then((response) => {
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
        console.log(periodId)
        const aulaToAdd = { ...newAula, periodId }
        axiosInstance
        .post("classrooms", aulaToAdd)
        .then((response) => {
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
      handleClose()
    }
  }

  const handleEdit = (aula: Aula) => {
    setEditingAula(aula)
    setNewAula({ ...aula })
    setErrors({})
    setOpen(true)
  }

  const handleDelete = (id: number) => {
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
          .then((response) => {
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
                  <Typography variant="body2">Capacidad: {aula.max_capacity}</Typography>
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
                <TableCell>Capacidad Máxima</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAulas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((aula) => (
                <TableRow key={aula.id}>
                  <TableCell>{aula.name}</TableCell>
                  <TableCell>{aula.type}</TableCell>
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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Aulas

