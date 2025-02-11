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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material"

interface Aula {
  id: number
  nombreAula: string
  tipoAula: string
  capacidadMaxima: number
}

interface AulasProps {
  periodoId: number
  aulas: Aula[]
  updateAulas: (newAulas: Aula[]) => void
  isMobile: boolean
}

const Aulas: React.FC<AulasProps> = ({ periodoId, aulas, updateAulas, isMobile }) => {
  const [open, setOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [newAula, setNewAula] = useState<Omit<Aula, "id">>({
    nombreAula: "",
    tipoAula: "",
    capacidadMaxima: 0,
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAulas, setFilteredAulas] = useState<Aula[]>(aulas)

  useEffect(() => {
    const filtered = aulas.filter((aula) =>
      aula.nombreAula.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAulas(filtered)
    setPage(0)
  }, [searchTerm, aulas])

  const handleOpen = () => {
    setEditingAula(null)
    setNewAula({ nombreAula: "", tipoAula: "", capacidadMaxima: 0 })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (editingAula) {
      updateAulas(aulas.map((a) => (a.id === editingAula.id ? { ...editingAula, ...newAula } : a)))
    } else {
      const aulaToAdd = { ...newAula, id: Date.now() }
      updateAulas([...aulas, aulaToAdd])
    }
    handleClose()
  }

  const handleEdit = (aula: Aula) => {
    setEditingAula(aula)
    setNewAula({ ...aula })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    updateAulas(aulas.filter((a) => a.id !== id))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
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
                  <Typography variant="h6">{aula.nombreAula}</Typography>
                  <Typography variant="body2">Tipo: {aula.tipoAula}</Typography>
                  <Typography variant="body2">Capacidad: {aula.capacidadMaxima}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(aula)}>
                    Editar
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(aula.id)}>
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
                <TableCell>Nombre del Aula</TableCell>
                <TableCell>Tipo de Aula</TableCell>
                <TableCell>Capacidad Máxima</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAulas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((aula) => (
                <TableRow key={aula.id}>
                  <TableCell>{aula.nombreAula}</TableCell>
                  <TableCell>{aula.tipoAula}</TableCell>
                  <TableCell>{aula.capacidadMaxima}</TableCell>
                  <TableCell>
                    <Button startIcon={<EditIcon />} onClick={() => handleEdit(aula)}>
                      Editar
                    </Button>
                    <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(aula.id)}>
                      Eliminar
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
            value={newAula.nombreAula}
            onChange={(e) => setNewAula({ ...newAula, nombreAula: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de Aula</InputLabel>
            <Select
              value={newAula.tipoAula}
              onChange={(e) => setNewAula({ ...newAula, tipoAula: e.target.value as string })}
            >
              <MenuItem value="Teórica">Teórica</MenuItem>
              <MenuItem value="Laboratorio">Laboratorio</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Capacidad Máxima"
            type="number"
            fullWidth
            value={newAula.capacidadMaxima}
            onChange={(e) => setNewAula({ ...newAula, capacidadMaxima: Number(e.target.value) })}
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
