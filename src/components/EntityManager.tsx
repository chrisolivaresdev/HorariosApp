import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"

interface Entity {
  id: number
  [key: string]: any
}

interface EntityManagerProps<T extends Entity> {
  entities: T[]
  setEntities: React.Dispatch<React.SetStateAction<T[]>>
  entityName: string
  fields: { name: string; label: string; type: string }[]
}

function EntityManager<T extends Entity>({ entities, setEntities, entityName, fields }: EntityManagerProps<T>) {
  const [open, setOpen] = useState(false)
  const [currentEntity, setCurrentEntity] = useState<Partial<T>>({})
  const [isEditing, setIsEditing] = useState(false)

  const handleOpen = () => {
    setCurrentEntity({})
    setIsEditing(false)
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return; 
    }

    setOpen(false)
  }

  const handleSave = () => {
    if (isEditing) {
      setEntities(entities.map((e) => (e.id === currentEntity.id ? ({ ...e, ...currentEntity } as T) : e)))
    } else {
      setEntities([...entities, { ...currentEntity, id: Date.now() } as T])
    }
    handleClose("","")
  }

  const handleEdit = (entity: T) => {
    setCurrentEntity(entity)
    setIsEditing(true)
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    setEntities(entities.filter((e) => e.id !== id))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar {entityName}
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {fields.map((field) => (
                <TableCell key={field.name}>{field.label}</TableCell>
              ))}
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {entities.map((entity) => (
                <motion.tr
                  key={entity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {fields.map((field) => (
                    <TableCell key={field.name}>{entity[field.name]}</TableCell>
                  ))}
                  <TableCell>
                    <Button onClick={() => handleEdit(entity)}>Editar</Button>
                    <Button onClick={() => handleDelete(entity.id)}>Eliminar</Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? `Editar ${entityName}` : `Agregar ${entityName}`}</DialogTitle>
        <DialogContent>
          {fields.map((field) => (
            <TextField
              key={field.name}
              margin="dense"
              label={field.label}
              type={field.type}
              fullWidth
              value={currentEntity[field.name] || ""}
              onChange={(e) => setCurrentEntity({ ...currentEntity, [field.name]: e.target.value })}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> handleClose("","")}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  )
}

export default EntityManager

