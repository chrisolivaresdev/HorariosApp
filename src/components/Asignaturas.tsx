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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  CardActions,
  Chip,
  OutlinedInput,
  Box,
  TablePagination,
  InputAdornment,
  FormHelperText,
  Tooltip,
  IconButton,
  SelectChangeEvent,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"

export interface Asignatura {
  id: number
  name: string
  subject_type: string
  duration: string
  journey: string
  quarters: string[]
  weekly_hours: string
}

const Asignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [filteredAsignaturas, setFilteredAsignaturas] = useState<Asignatura[]>([])
  const [open, setOpen] = useState(false)
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null)
  const [newAsignatura, setNewAsignatura] = useState<Omit<Asignatura, "id">>({
    name: "",
    subject_type: "",
    duration: "",
    journey: "",
    quarters: [],
    weekly_hours: "0",
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
    if (newAsignatura.journey == "0") {
      setNewAsignatura({
        ...newAsignatura,
        duration: "Trimestral",
        quarters: ["1"],
      })
    } else {
      if (newAsignatura.duration === "Anual") {
        setNewAsignatura({ ...newAsignatura, quarters: ["1", "2", "3"] })
      } else if (newAsignatura.duration === "Trimestral") {
        setNewAsignatura({ ...newAsignatura, quarters: newAsignatura.quarters.slice(0, 1) })
      } else if (newAsignatura.duration === "Semestral") {
        setNewAsignatura({ ...newAsignatura, quarters: newAsignatura.quarters.slice(0, 2) })
      }
    }
  }, [newAsignatura.journey, newAsignatura.duration])

  useEffect(() => {
    const filtered = asignaturas.filter((asignatura) =>
      asignatura?.name?.toLowerCase().includes(searchTerm?.toLowerCase()),
    )
    setFilteredAsignaturas(filtered)
    setPage(0)
  }, [searchTerm, asignaturas])

  const handleOpen = () => {
    setEditingAsignatura(null)
    setNewAsignatura({
      name: "",
      subject_type: "",
      duration: "",
      journey: "",
      quarters: [],
      weekly_hours: "",
    })
    setErrors({})
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return; 
    }

    setOpen(false)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!newAsignatura.name) newErrors.name = "El nombre es requerido"
    if (!newAsignatura.subject_type) newErrors.subject_type = "El tipo es requerido"
    if (!newAsignatura.duration) newErrors.duration = "La duración es requerida"
    if (newAsignatura.journey === undefined) newErrors.journey = "El journey es requerido"
    if (newAsignatura.quarters.length === 0) newErrors.quarters = "Seleccione al menos un trimestre"
    if (newAsignatura.weekly_hours == "0") newErrors.weekly_hours = "Las horas semanales deben ser mayores a 0"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getSubjects = () => {
    axiosInstance.get("subjects")
      .then(response => {
        setAsignaturas(response.data)
      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
  }

  const handleSave = () => {
    if (validateForm()) {
      if (editingAsignatura) {
        let editAsignatura ={
          name: newAsignatura.name,
          subject_type: newAsignatura.subject_type,
          duration: newAsignatura.duration,
          journey: newAsignatura.journey,
          quarters: newAsignatura.quarters,
          weekly_hours: newAsignatura.weekly_hours,
        }
        axiosInstance.patch(`subjects/${editingAsignatura.id}`, editAsignatura)
      .then(() => {
        Swal.fire({
          title: 'Bien!',
          text: 'Asignatura editada correctamente!.',
          icon: 'success',
        });
        getSubjects()
      }).catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
     
      } else {
        axiosInstance.post('/subjects', newAsignatura)
        .then(() => {
          Swal.fire({
            title: 'Bien!',
            text: 'Asignatura creada correctamente!.',
            icon: 'success',
          });
          getSubjects()
        })
        .catch(error => {
          Swal.fire({
            title: '¡Error!',
            text: 'A ocurrido un error.',
            icon: 'error',
          });
          console.error('Error:', error);
        });
      }
      handleClose("","")
    }
  }

  const handleEdit = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura)
    setNewAsignatura({ ...asignatura })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro de eliminar esta asignatura?',
      text: '¡No podrás deshacer esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminalo'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`subjects/${id}`)
        .then(() => {
          Swal.fire(
            'Eliminado!',
            'La asignatura ha sido eliminada.',
            'success'
          );
          getSubjects()
        })
        .catch(error => {
          Swal.fire({
            title: '¡Error!',
            text: 'A ocurrido un error.',
            icon: 'error',
          });
          console.error('Error:', error);
        });
        
      }
    });
  }

  const handlequartersChange = (event: SelectChangeEvent<string[]>) => {
    const selectedquarters = event.target.value as string[]
    let updatedquarters = selectedquarters

    if (newAsignatura.duration === "Trimestral" && selectedquarters.length > 1) {
      updatedquarters = [selectedquarters[selectedquarters.length - 1]]
    } else if (newAsignatura.duration === "Semestral" && selectedquarters.length > 2) {
      updatedquarters = selectedquarters.slice(0, 2)
    }

    setNewAsignatura({
      ...newAsignatura,
      quarters: updatedquarters,
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

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Agregar Asignatura
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
          {filteredAsignaturas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((asignatura) => (
            <Grid item xs={12} key={asignatura.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{asignatura.name}</Typography>
                  <Typography variant="body2">Tipo: {asignatura.subject_type}</Typography>
                  <Typography variant="body2">Duración: {asignatura.duration}</Typography>
                  <Typography variant="body2">
                    journey: {asignatura.journey === "0" ? "Inicial" : asignatura.journey === "3" ? "Prosecución" : asignatura.journey === "4" ? "3" : asignatura.journey === "5" ? "4" : asignatura.journey === "6" ? "5" : asignatura.journey}
                  </Typography>
                  <Typography variant="body2">
                    quarters: {asignatura.quarters.map((t) => `${t}`).join(", ")}
                  </Typography>
                  <Typography variant="body2">Horas Semanales: {asignatura.weekly_hours}</Typography>
                </CardContent>
                <CardActions>
                <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(asignatura)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(asignatura.id)}>
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
                <TableCell>Tipo</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Trayecto</TableCell>
                <TableCell>Trimestre</TableCell>
                <TableCell>Horas Semanales</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAsignaturas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((asignatura) => (
                <TableRow key={asignatura.id}>
                  <TableCell>{asignatura.name}</TableCell>
                  <TableCell>{asignatura.subject_type == "THEORETICAL" ? "Teórica" : asignatura.subject_type == "PRACTICAL" ? "Practica" : asignatura.subject_type == "THEORETICAL_PRACTICAL" ? "Teorica practica" : ""}</TableCell>
                  <TableCell>{asignatura.duration}</TableCell>
                  <TableCell>{asignatura.journey === "0" ? "Inicial" : asignatura.journey === "3" ? "Prosecución" : asignatura.journey === "4" ? "3" : asignatura.journey === "5" ? "4" : asignatura.journey === "6" ? "5" : asignatura.journey}</TableCell>
                  <TableCell>{asignatura.quarters.map((t) => `${t}`).join(", ")}</TableCell>
                  <TableCell>{asignatura.weekly_hours}</TableCell>
                  <TableCell>
                  <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(asignatura)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(asignatura.id)}>
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
        count={filteredAsignaturas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
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
                value={newAsignatura.name}
                onChange={(e) => setNewAsignatura({ ...newAsignatura, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.subject_type}>
                <InputLabel>Tipo de Asignatura</InputLabel>
                <Select
                  value={newAsignatura.subject_type}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, subject_type: e.target.value as string })}
                >
                  <MenuItem value="THEORETICAL">Teórica</MenuItem>
                  <MenuItem value="PRACTICAL">Práctica</MenuItem>
                  <MenuItem value="THEORETICAL_PRACTICAL">Teórico-Práctica</MenuItem>
                </Select>
                {errors.subject_type && <FormHelperText>{errors.subject_type}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.duration}>
                <InputLabel>Duración de la Asignatura</InputLabel>
                <Select
                  value={newAsignatura.duration}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, duration: e.target.value as string })}
                  disabled={newAsignatura.journey === "0"}
                >
                  <MenuItem value="Trimestral">Trimestral</MenuItem>
                  <MenuItem value="Semestral">Semestral</MenuItem>
                  <MenuItem value="Anual">Anual</MenuItem>
                </Select>
                {errors.duration && <FormHelperText>{errors.duration}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.journey}>
                <InputLabel>Trayecto</InputLabel>
                <Select
                  value={newAsignatura.journey}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, journey: e.target.value })}
                >
                  <MenuItem value={"0"}>Inicial</MenuItem>
                  <MenuItem value={"1"}>1</MenuItem>
                  <MenuItem value={"2"}>2</MenuItem>
                  <MenuItem value={"3"}>Prosecución</MenuItem>
                  <MenuItem value={"4"}>3</MenuItem>
                  <MenuItem value={"5"}>4</MenuItem>
                  <MenuItem value={"6"}>5</MenuItem>

                </Select>
                {errors.journey && <FormHelperText>{errors.journey}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.quarters}>
                <InputLabel>Trimestre</InputLabel>
                <Select
                  multiple
                  value={newAsignatura.quarters}
                  onChange={handlequartersChange}
                  input={<OutlinedInput label="quarters" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  disabled={newAsignatura.duration === "Anual" || newAsignatura.journey === "0"}
                >
                  <MenuItem value={"1"}>1</MenuItem>
                  <MenuItem value={"2"}>2</MenuItem>
                  <MenuItem value={"3"}>3</MenuItem>
                </Select>
                {errors.quarters && <FormHelperText>{errors.quarters}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Horas Semanales"
                type="number"
                fullWidth
                value={newAsignatura.weekly_hours}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value >= 1) {
                    setNewAsignatura({ ...newAsignatura, weekly_hours: e.target.value.toString() })
                  }
                }}
                error={!!errors.weekly_hours}
                helperText={errors.weekly_hours}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>handleClose("","")}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Asignaturas

