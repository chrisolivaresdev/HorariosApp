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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material"

export interface Asignatura {
  id: number
  nombreAsignatura: string
  tipoAsignatura: string
  duracionAsignatura: string
  trayecto: number
  trimestres: number[]
  horasSemanales: number
}

const Asignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [filteredAsignaturas, setFilteredAsignaturas] = useState<Asignatura[]>([])
  const [open, setOpen] = useState(false)
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null)
  const [newAsignatura, setNewAsignatura] = useState<Omit<Asignatura, "id">>({
    nombreAsignatura: "",
    tipoAsignatura: "",
    duracionAsignatura: "",
    trayecto: 1,
    trimestres: [],
    horasSemanales: 0,
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (newAsignatura.trayecto === 0) {
      setNewAsignatura({
        ...newAsignatura,
        duracionAsignatura: "Trimestral",
        trimestres: [1],
      })
    } else {
      if (newAsignatura.duracionAsignatura === "Anual") {
        setNewAsignatura({ ...newAsignatura, trimestres: [1, 2, 3] })
      } else if (newAsignatura.duracionAsignatura === "Trimestral") {
        setNewAsignatura({ ...newAsignatura, trimestres: newAsignatura.trimestres.slice(0, 1) })
      } else if (newAsignatura.duracionAsignatura === "Semestral") {
        setNewAsignatura({ ...newAsignatura, trimestres: newAsignatura.trimestres.slice(0, 2) })
      }
    }
  }, [newAsignatura.trayecto, newAsignatura.duracionAsignatura])

  useEffect(() => {
    const filtered = asignaturas.filter((asignatura) =>
      asignatura.nombreAsignatura.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAsignaturas(filtered)
    setPage(0)
  }, [searchTerm, asignaturas])

  const handleOpen = () => {
    setEditingAsignatura(null)
    setNewAsignatura({
      nombreAsignatura: "",
      tipoAsignatura: "",
      duracionAsignatura: "",
      trayecto: 1,
      trimestres: [],
      horasSemanales: 1,
    })
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!newAsignatura.nombreAsignatura) newErrors.nombreAsignatura = "El nombre es requerido"
    if (!newAsignatura.tipoAsignatura) newErrors.tipoAsignatura = "El tipo es requerido"
    if (!newAsignatura.duracionAsignatura) newErrors.duracionAsignatura = "La duración es requerida"
    if (newAsignatura.trayecto === undefined) newErrors.trayecto = "El trayecto es requerido"
    if (newAsignatura.trimestres.length === 0) newErrors.trimestres = "Seleccione al menos un trimestre"
    if (newAsignatura.horasSemanales <= 0) newErrors.horasSemanales = "Las horas semanales deben ser mayores a 0"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      if (editingAsignatura) {
        setAsignaturas(
          asignaturas.map((a) => (a.id === editingAsignatura.id ? { ...editingAsignatura, ...newAsignatura } : a)),
        )
      } else {
        const asignaturaToAdd = { ...newAsignatura, id: Date.now() }
        setAsignaturas([...asignaturas, asignaturaToAdd])
      }
      console.log(
        "Asignatura guardada:",
        editingAsignatura ? { ...editingAsignatura, ...newAsignatura } : newAsignatura,
      )
      handleClose()
    }
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
                  <Typography variant="h6">{asignatura.nombreAsignatura}</Typography>
                  <Typography variant="body2">Tipo: {asignatura.tipoAsignatura}</Typography>
                  <Typography variant="body2">Duración: {asignatura.duracionAsignatura}</Typography>
                  <Typography variant="body2">
                    Trayecto: {asignatura.trayecto === 0 ? "Inicial" : asignatura.trayecto}
                  </Typography>
                  <Typography variant="body2">
                    Trimestres: {asignatura.trimestres.map((t) => `${t}`).join(", ")}
                  </Typography>
                  <Typography variant="body2">Horas Semanales: {asignatura.horasSemanales}</Typography>
                </CardContent>
                <CardActions>
                <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(asignaturra)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(asignaturra.id)}>
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
                <TableCell>Trimestres</TableCell>
                <TableCell>Horas Semanales</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAsignaturas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((asignatura) => (
                <TableRow key={asignatura.id}>
                  <TableCell>{asignatura.nombreAsignatura}</TableCell>
                  <TableCell>{asignatura.tipoAsignatura}</TableCell>
                  <TableCell>{asignatura.duracionAsignatura}</TableCell>
                  <TableCell>{asignatura.trayecto === 0 ? "Inicial" : asignatura.trayecto}</TableCell>
                  <TableCell>{asignatura.trimestres.map((t) => `${t}`).join(", ")}</TableCell>
                  <TableCell>{asignatura.horasSemanales}</TableCell>
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
                value={newAsignatura.nombreAsignatura}
                onChange={(e) => setNewAsignatura({ ...newAsignatura, nombreAsignatura: e.target.value })}
                error={!!errors.nombreAsignatura}
                helperText={errors.nombreAsignatura}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.tipoAsignatura}>
                <InputLabel>Tipo de Asignatura</InputLabel>
                <Select
                  value={newAsignatura.tipoAsignatura}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, tipoAsignatura: e.target.value as string })}
                >
                  <MenuItem value="Teórica">Teórica</MenuItem>
                  <MenuItem value="Práctica">Práctica</MenuItem>
                  <MenuItem value="Teórico-Práctica">Teórico-Práctica</MenuItem>
                </Select>
                {errors.tipoAsignatura && <FormHelperText>{errors.tipoAsignatura}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.duracionAsignatura}>
                <InputLabel>Duración de la Asignatura</InputLabel>
                <Select
                  value={newAsignatura.duracionAsignatura}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, duracionAsignatura: e.target.value as string })}
                  disabled={newAsignatura.trayecto === 0}
                >
                  <MenuItem value="Trimestral">Trimestral</MenuItem>
                  <MenuItem value="Semestral">Semestral</MenuItem>
                  <MenuItem value="Anual">Anual</MenuItem>
                </Select>
                {errors.duracionAsignatura && <FormHelperText>{errors.duracionAsignatura}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.trayecto}>
                <InputLabel>Trayecto</InputLabel>
                <Select
                  value={newAsignatura.trayecto}
                  onChange={(e) => setNewAsignatura({ ...newAsignatura, trayecto: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Inicial</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>Prosecución</MenuItem>
                  <MenuItem value={4}>3</MenuItem>
                  <MenuItem value={5}>4</MenuItem>
                </Select>
                {errors.trayecto && <FormHelperText>{errors.trayecto}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.trimestres}>
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
                  disabled={newAsignatura.duracionAsignatura === "Anual" || newAsignatura.trayecto === 0}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                </Select>
                {errors.trimestres && <FormHelperText>{errors.trimestres}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Horas Semanales"
                type="number"
                fullWidth
                value={newAsignatura.horasSemanales}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value >= 1) {
                    setNewAsignatura({ ...newAsignatura, horasSemanales: value })
                  }
                }}
                error={!!errors.horasSemanales}
                helperText={errors.horasSemanales}
              />
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

