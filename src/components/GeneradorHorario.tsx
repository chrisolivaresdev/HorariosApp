import type React from "react"
import { useState, useRef } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
} from "@mui/icons-material"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface Clase {
  id: string
  profesor: string
  materia: string
  aula: string
  dia: number
  horaInicio: string
  horaFin: string
  color?: string
}

interface GeneradorHorarioProps {
  seccionId: number
  profesores: any[]
  materias: any[]
  aulas: any[]
}

const GeneradorHorario: React.FC<GeneradorHorarioProps> = ({ seccionId, profesores, materias, aulas }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(false)
  const [openWarning, setOpenWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [clases, setClases] = useState<Clase[]>([])
  const [editingClase, setEditingClase] = useState<Clase | null>(null)
  const [nuevaClase, setNuevaClase] = useState<Omit<Clase, "id">>({
    profesor: "",
    materia: "",
    aula: "",
    dia: 0,
    horaInicio: "",
    horaFin: "",
  })
  const [isPrinting, setIsPrinting] = useState(false)

  const horarioRef = useRef<HTMLDivElement>(null)

  // Generar rangos de horas
  const horas = []
  let hora = 7
  let minutos = 0
  while (hora < 19 || (hora === 19 && minutos === 0)) {
    horas.push(`${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`)
    minutos += 45
    if (minutos >= 60) {
      hora++
      minutos = minutos - 60
    }
  }

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const handleClickOpen = () => {
    setEditingClase(null)
    setNuevaClase({
      profesor: "",
      materia: "",
      aula: "",
      dia: 0,
      horaInicio: "",
      horaFin: "",
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingClase(null)
  }

  const handleCloseWarning = () => {
    setOpenWarning(false)
  }

  const handleEdit = (clase: Clase) => {
    setEditingClase(clase)
    setNuevaClase({
      profesor: clase.profesor,
      materia: clase.materia,
      aula: clase.aula,
      dia: clase.dia,
      horaInicio: clase.horaInicio,
      horaFin: clase.horaFin,
    })
    setOpen(true)
  }

  const handleDelete = (claseId: string) => {
    setClases(clases.filter((clase) => clase.id !== claseId))
  }

  const verificarSolapamiento = (nuevaClase: Omit<Clase, "id">, claseId?: string): boolean => {
    return clases.some((clase) => {
      if (claseId && clase.id === claseId) return false
      if (clase.dia !== nuevaClase.dia) return false

      return (
        (nuevaClase.horaInicio >= clase.horaInicio && nuevaClase.horaInicio < clase.horaFin) ||
        (nuevaClase.horaFin > clase.horaInicio && nuevaClase.horaFin <= clase.horaFin) ||
        (nuevaClase.horaInicio <= clase.horaInicio && nuevaClase.horaFin >= clase.horaFin)
      )
    })
  }

  const handleSave = () => {
    if (nuevaClase.horaFin <= nuevaClase.horaInicio) {
      setWarningMessage("La hora de finalización debe ser posterior a la hora de inicio.")
      setOpenWarning(true)
      return
    }

    const haySolapamiento = verificarSolapamiento(nuevaClase, editingClase?.id)

    if (haySolapamiento) {
      setWarningMessage("Ya existe una clase programada en este horario. Por favor, seleccione otro horario.")
      setOpenWarning(true)
      return
    }

    if (editingClase) {
      setClases(
        clases.map((clase) =>
          clase.id === editingClase.id
            ? {
                ...nuevaClase,
                id: editingClase.id,
                color: editingClase.color,
              }
            : clase,
        ),
      )
    } else {
      const newId = Date.now().toString()
      setClases([
        ...clases,
        {
          ...nuevaClase,
          id: newId,
          color: generarColorAleatorio(),
        },
      ])
    }
    handleClose()
  }

  const generarColorAleatorio = () => {
    const colores = [
      "#bbdefb", // Azul claro
      "#c8e6c9", // Verde claro
      "#f8bbd0", // Rosa claro
      "#fff9c4", // Amarillo claro
      "#ffccbc", // Naranja claro
    ]
    return colores[Math.floor(Math.random() * colores.length)]
  }

  const encontrarClase = (hora: string, dia: number) => {
    return clases.find((clase) => clase.dia === dia && clase.horaInicio <= hora && clase.horaFin > hora)
  }

  const renderAccionesClase = (clase: Clase) => (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
      <Tooltip title="Editar">
        <IconButton size="small" onClick={() => handleEdit(clase)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" onClick={() => handleDelete(clase.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )

  const handleDownloadPDF = async () => {
    if (horarioRef.current) {
      setIsPrinting(true)
      await new Promise((resolve) => setTimeout(resolve, 100)) // Espera para que se apliquen los cambios de estilo

      const canvas = await html2canvas(horarioRef.current, {
        scale: 2, // Increase from 1.5 to 2 for better quality
      })
      const imgData = canvas.toDataURL("image/png")

      // Calcula las dimensiones para que el horario ocupe aproximadamente el 80% de la página
      const imgWidth = 210 * 0.9 // A4 width in mm * 90%
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      })

      // Centra la imagen en la página
      const xPosition = (pdf.internal.pageSize.width - imgWidth) / 2
      const yPosition = (pdf.internal.pageSize.height - imgHeight) / 2

      pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight)
      pdf.save("horario.pdf")

      setIsPrinting(false)
    }
  }

  const printStyles = `
    @media print {
      .clase-content button {
        display: none !important;
      }
    }
  `

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <style>{printStyles}</style>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleClickOpen}>
          Agregar Clase
        </Button>
        <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>
          Descargar PDF
        </Button>
      </Box>

      <Box ref={horarioRef}>
        {isMobile ? (
          // Vista móvil: horario por día
          <Box sx={{ mb: 2 }}>
            {dias.map((dia, index) => (
              <Paper key={dia} sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {dia}
                </Typography>
                {horas.map((hora) => {
                  const clase = encontrarClase(hora, index)
                  if (clase) {
                    return (
                      <Paper
                        key={hora}
                        sx={{
                          p: 1,
                          mb: 1,
                          backgroundColor: clase.color,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box>
                            <Typography variant="subtitle2">
                              {clase.horaInicio} - {clase.horaFin}
                            </Typography>
                            <Typography variant="body2">{clase.materia}</Typography>
                            <Typography variant="body2">Prof: {clase.profesor}</Typography>
                            <Typography variant="body2">Aula: {clase.aula}</Typography>
                          </Box>
                          {renderAccionesClase(clase)}
                        </Box>
                      </Paper>
                    )
                  }
                  return null
                })}
              </Paper>
            ))}
          </Box>
        ) : (
          // Vista desktop: tabla completa
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Hora</TableCell>
                  {dias.map((dia) => (
                    <TableCell key={dia} sx={{ borderLeft: "1px solid rgba(224, 224, 224, 1)" }}>
                      {dia}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {horas.map((hora) => (
                  <TableRow key={hora}>
                    <TableCell>{hora}</TableCell>
                    {dias.map((dia, index) => {
                      const clase = encontrarClase(hora, index)
                      return (
                        <TableCell
                          key={`${dia}-${hora}`}
                          sx={{
                            backgroundColor: clase?.color,
                            minWidth: "180px", // Increase from 150px
                            height: "100px", // Increase from 80px
                            borderLeft: "1px solid rgba(224, 224, 224, 1)",
                            ...(clase && {
                              borderBottom: "none",
                            }),
                          }}
                        >
                          {clase && hora === clase.horaInicio && (
                            <Box className="clase-content">
                              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="subtitle1" sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                                  {clase.materia}
                                </Typography>
                                {!isPrinting && renderAccionesClase(clase)}
                              </Box>
                              <Typography variant="body1" sx={{ fontSize: "0.9rem" }}>
                                Prof: {clase.profesor}
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: "0.9rem" }}>
                                Aula: {clase.aula}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingClase ? "Editar Clase" : "Agregar Clase al Horario"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Materia</InputLabel>
                <Select
                  value={nuevaClase.materia}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, materia: e.target.value as string })}
                >
                  {materias.map((materia: any) => (
                    <MenuItem key={materia.id} value={materia.nombreAsignatura}>
                      {materia.nombreAsignatura}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profesor</InputLabel>
                <Select
                  value={nuevaClase.profesor}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, profesor: e.target.value as string })}
                >
                  {profesores.map((profesor: any) => (
                    <MenuItem key={profesor.id} value={`${profesor.primerNombre} ${profesor.segundoNombre}`}>
                      {profesor.primerNombre} {profesor.segundoNombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Aula</InputLabel>
                <Select
                  value={nuevaClase.aula}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, aula: e.target.value as string })}
                >
                  {aulas.map((aula: any) => (
                    <MenuItem key={aula.id} value={aula.nombreAula}>
                      {aula.nombreAula}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Día</InputLabel>
                <Select
                  value={nuevaClase.dia}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, dia: e.target.value as number })}
                >
                  {dias.map((dia, index) => (
                    <MenuItem key={dia} value={index}>
                      {dia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Hora de Inicio</InputLabel>
                <Select
                  value={nuevaClase.horaInicio}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, horaInicio: e.target.value as string })}
                >
                  {horas.map((hora) => (
                    <MenuItem key={hora} value={hora}>
                      {hora}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Hora de Finalización</InputLabel>
                <Select
                  value={nuevaClase.horaFin}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, horaFin: e.target.value as string })}
                >
                  {horas
                    .filter((hora) => hora > nuevaClase.horaInicio)
                    .map((hora) => (
                      <MenuItem key={hora} value={hora}>
                        {hora}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingClase ? "Guardar Cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de advertencia */}
      <Dialog
        open={openWarning}
        onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon sx={{ color: "warning.main" }} />
            <Typography variant="h6">Advertencia</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{warningMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWarning} color="primary" autoFocus>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GeneradorHorario

