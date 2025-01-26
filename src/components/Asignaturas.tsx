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

export interface Asignatura {
  id: number
  nombreAsignatura: string
  tipoAsignatura: string
  duracionAsignatura: string
}

interface AsignaturasProps {
  periodoId: number
  asignaturas: Asignatura[]
  updateAsignaturas: (newAsignaturas: Asignatura[]) => void
}

const Asignaturas: React.FC<AsignaturasProps> = ({ periodoId, asignaturas, updateAsignaturas }) => {
  const [open, setOpen] = useState(false)
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null)
  const [newAsignatura, setNewAsignatura] = useState<Omit<Asignatura, "id">>({
    nombreAsignatura: "",
    tipoAsignatura: "",
    duracionAsignatura: "",
  })

  const handleOpen = () => {
    setEditingAsignatura(null)
    setNewAsignatura({ nombreAsignatura: "", tipoAsignatura: "", duracionAsignatura: "" })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (editingAsignatura) {
      updateAsignaturas(
        asignaturas.map((a) => (a.id === editingAsignatura.id ? { ...editingAsignatura, ...newAsignatura } : a)),
      )
    } else {
      const asignaturaToAdd = { ...newAsignatura, id: Date.now() }
      updateAsignaturas([...asignaturas, asignaturaToAdd])
    }
    handleClose()
  }

  const handleEdit = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura)
    setNewAsignatura({ ...asignatura })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    updateAsignaturas(asignaturas.filter((a) => a.id !== id))
  }

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Asignatura
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignaturas.map((asignatura) => (
              <TableRow key={asignatura.id}>
                <TableCell>{asignatura.nombreAsignatura}</TableCell>
                <TableCell>{asignatura.tipoAsignatura}</TableCell>
                <TableCell>{asignatura.duracionAsignatura}</TableCell>
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingAsignatura ? "Editar Asignatura" : "Agregar Nueva Asignatura"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Asignatura"
            type="text"
            fullWidth
            value={newAsignatura.nombreAsignatura}
            onChange={(e) => setNewAsignatura({ ...newAsignatura, nombreAsignatura: e.target.value })}
          />
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

