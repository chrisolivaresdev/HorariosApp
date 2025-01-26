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
}

const Aulas: React.FC<AulasProps> = ({ periodoId, aulas, updateAulas }) => {
  const [open, setOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [newAula, setNewAula] = useState<Omit<Aula, "id">>({
    nombreAula: "",
    tipoAula: "",
    capacidadMaxima: 0,
  })

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

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Aula
      </Button>
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
            {aulas.map((aula) => (
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
      <Dialog open={open} onClose={handleClose}>
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
            onChange={(e) => setNewAula({ ...newAula, capacidadMaxima: Number.parseInt(e.target.value) })}
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

