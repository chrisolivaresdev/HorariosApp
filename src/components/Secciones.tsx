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
}

const Secciones: React.FC<SeccionesProps> = ({ periodoId, secciones, updateSecciones }) => {
  const [open, setOpen] = useState(false)
  const [editingSeccion, setEditingSeccion] = useState<Seccion | null>(null)
  const [newSeccion, setNewSeccion] = useState<Omit<Seccion, "id">>({
    nombreSeccion: "",
    totalEstudiantes: 0,
    trayecto: 1,
    trimestre: 1,
  })

  const handleOpen = () => {
    setEditingSeccion(null)
    setNewSeccion({ nombreSeccion: "", totalEstudiantes: 0, trayecto: 1, trimestre: 1 })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (editingSeccion) {
      updateSecciones(secciones.map((s) => (s.id === editingSeccion.id ? { ...editingSeccion, ...newSeccion } : s)))
    } else {
      const seccionToAdd = { ...newSeccion, id: Date.now() }
      updateSecciones([...secciones, seccionToAdd])
    }
    handleClose()
  }

  const handleEdit = (seccion: Seccion) => {
    setEditingSeccion(seccion)
    setNewSeccion({ ...seccion })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    updateSecciones(secciones.filter((s) => s.id !== id))
  }

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Sección
      </Button>
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
            {secciones.map((seccion) => (
              <TableRow key={seccion.id}>
                <TableCell>{seccion.nombreSeccion}</TableCell>
                <TableCell>{seccion.totalEstudiantes}</TableCell>
                <TableCell>{seccion.trayecto}</TableCell>
                <TableCell>{seccion.trimestre}</TableCell>
                <TableCell>
                  <Button startIcon={<EditIcon />} onClick={() => handleEdit(seccion)}>
                    Editar
                  </Button>
                  <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(seccion.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
            onChange={(e) => setNewSeccion({ ...newSeccion, nombreSeccion: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Total de Estudiantes"
            type="number"
            fullWidth
            value={newSeccion.totalEstudiantes}
            onChange={(e) => setNewSeccion({ ...newSeccion, totalEstudiantes: Number.parseInt(e.target.value) })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Trayecto</InputLabel>
            <Select
              value={newSeccion.trayecto}
              onChange={(e) => setNewSeccion({ ...newSeccion, trayecto: e.target.value as number })}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Trimestre</InputLabel>
            <Select
              value={newSeccion.trimestre}
              onChange={(e) => setNewSeccion({ ...newSeccion, trimestre: e.target.value as number })}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
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

export default Secciones

