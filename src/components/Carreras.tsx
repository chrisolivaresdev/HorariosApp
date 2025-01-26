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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

interface Carrera {
  id: number
  nombrePdf: string
  tipoCarrera: string
  nivelEstudio: string
}

interface CarrerasProps {
  periodoId: number
  carreras: Carrera[]
  updateCarreras: (newCarreras: Carrera[]) => void
}

const Carreras: React.FC<CarrerasProps> = ({ periodoId, carreras, updateCarreras }) => {
  const [open, setOpen] = useState(false)
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null)
  const [newCarrera, setNewCarrera] = useState<Omit<Carrera, "id">>({
    nombrePdf: "",
    tipoCarrera: "",
    nivelEstudio: "",
  })

  const handleOpen = () => {
    setEditingCarrera(null)
    setNewCarrera({ nombrePdf: "", tipoCarrera: "", nivelEstudio: "" })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (editingCarrera) {
      updateCarreras(carreras.map((c) => (c.id === editingCarrera.id ? { ...editingCarrera, ...newCarrera } : c)))
    } else {
      const carreraToAdd = { ...newCarrera, id: Date.now() }
      updateCarreras([...carreras, carreraToAdd])
    }
    handleClose()
  }

  const handleEdit = (carrera: Carrera) => {
    setEditingCarrera(carrera)
    setNewCarrera({ ...carrera })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    updateCarreras(carreras.filter((c) => c.id !== id))
  }

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Carrera
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre PDF</TableCell>
              <TableCell>Tipo de Carrera</TableCell>
              <TableCell>Nivel de Estudio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carreras.map((carrera) => (
              <TableRow key={carrera.id}>
                <TableCell>{carrera.nombrePdf}</TableCell>
                <TableCell>{carrera.tipoCarrera}</TableCell>
                <TableCell>{carrera.nivelEstudio}</TableCell>
                <TableCell>
                  <Button startIcon={<EditIcon />} onClick={() => handleEdit(carrera)}>
                    Editar
                  </Button>
                  <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(carrera.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingCarrera ? "Editar Carrera" : "Agregar Nueva Carrera"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre PDF"
            type="text"
            fullWidth
            value={newCarrera.nombrePdf}
            onChange={(e) => setNewCarrera({ ...newCarrera, nombrePdf: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de Carrera</InputLabel>
            <Select
              value={newCarrera.tipoCarrera}
              onChange={(e) => setNewCarrera({ ...newCarrera, tipoCarrera: e.target.value as string })}
            >
              <MenuItem value="Pnf">PNF</MenuItem>
              <MenuItem value="Carrera">Carrera</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Nivel de Estudio</InputLabel>
            <Select
              value={newCarrera.nivelEstudio}
              onChange={(e) => setNewCarrera({ ...newCarrera, nivelEstudio: e.target.value as string })}
            >
              <MenuItem value="Pregrado">Pregrado</MenuItem>
              <MenuItem value="Postgrado">Postgrado</MenuItem>
              <MenuItem value="Doctorado">Doctorado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Carreras

