import type React from "react"
import { useState, useRef, useEffect } from "react"
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
  Save as SaveIcon,
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
  horasAsignadas: number
}

interface Profesor {
  id: number
  nombre: string
}

interface Asignatura {
  id: number
  nombre: string
  horasSemanales: number
}

interface Aula {
  id: number
  nombre: string
  capacidad: number
}

interface GeneradorHorarioProps {
  seccionId: number
}

const profesoresPorDefecto: Profesor[] = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "María García" },
  { id: 3, nombre: "Carlos Rodríguez" },
]

const asignaturasPorDefecto: Asignatura[] = [
  { id: 1, nombre: "Matemáticas", horasSemanales: 6 },
  { id: 2, nombre: "Física", horasSemanales: 4 },
  { id: 3, nombre: "Química", horasSemanales: 4 },
  { id: 4, nombre: "Historia", horasSemanales: 3 },
]

const aulasPorDefecto: Aula[] = [
  { id: 1, nombre: "Aula 101", capacidad: 30 },
  { id: 2, nombre: "Aula 102", capacidad: 25 },
  { id: 3, nombre: "Laboratorio", capacidad: 20 },
]

const GeneradorHorario: React.FC<GeneradorHorarioProps> = ({ seccionId }) => {
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
    horasAsignadas: 0,
  })
  const [isPrinting, setIsPrinting] = useState(false)
  const [horasRestantes, setHorasRestantes] = useState<{ [key: string]: number }>({})
  const [horasExtras, setHorasExtras] = useState<Omit<Clase, "id" | "materia" | "profesor" | "aula"> | null>(null)

  const horarioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const horasInicialesRestantes: { [key: string]: number } = {}
    asignaturasPorDefecto.forEach((asignatura) => {
      horasInicialesRestantes[asignatura.nombre] = asignatura.horasSemanales
    })
    setHorasRestantes(horasInicialesRestantes)
  }, [])

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
      horasAsignadas: 0,
    })
    setHorasExtras(null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingClase(null)
    setHorasExtras(null)
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
      horasAsignadas: clase.horasAsignadas,
    })
    setHorasExtras(null)
    setOpen(true)
  }

  const handleDelete = (claseId: string) => {
    const claseAEliminar = clases.find((clase) => clase.id === claseId)
    if (claseAEliminar) {
      setHorasRestantes((prev) => ({
        ...prev,
        [claseAEliminar.materia]: (prev[claseAEliminar.materia] || 0) + claseAEliminar.horasAsignadas,
      }))
    }
    setClases(clases.filter((clase) => clase.id !== claseId))
  }

  const checkOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    return start1 < end2 && end1 > start2
  }

  const verificarSolapamiento = (nuevaClase: Omit<Clase, "id">, claseId?: string): boolean => {
    return clases.some((clase) => {
      if (claseId && clase.id === claseId) return false
      if (clase.dia !== nuevaClase.dia) return false

      return checkOverlap(nuevaClase.horaInicio, nuevaClase.horaFin, clase.horaInicio, clase.horaFin)
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

    // Check overlap with extra hours
    if (horasExtras) {
      const mainClassOverlap = checkOverlap(
        nuevaClase.horaInicio,
        nuevaClase.horaFin,
        horasExtras.horaInicio,
        horasExtras.horaFin,
      )
      const extraHoursOverlap = clases.some(
        (clase) =>
          clase.dia === horasExtras.dia &&
          checkOverlap(clase.horaInicio, clase.horaFin, horasExtras.horaInicio, horasExtras.horaFin),
      )

      if (mainClassOverlap || extraHoursOverlap) {
        setWarningMessage("Las horas extras se solapan con otras clases. Por favor, ajuste los horarios.")
        setOpenWarning(true)
        return
      }
    }

    const horasAsignadas = calcularHorasAsignadas(nuevaClase.horaInicio, nuevaClase.horaFin)
    const horasExtrasAsignadas = horasExtras ? calcularHorasAsignadas(horasExtras.horaInicio, horasExtras.horaFin) : 0
    const totalHorasAsignadas = horasAsignadas + horasExtrasAsignadas
    const horasDisponibles = horasRestantes[nuevaClase.materia] || 0

    if (totalHorasAsignadas < horasDisponibles) {
      setWarningMessage(
        `Faltan ${horasDisponibles - totalHorasAsignadas} horas por asignar para ${nuevaClase.materia}.`,
      )
      setOpenWarning(true)
      return
    } else if (totalHorasAsignadas > horasDisponibles) {
      setWarningMessage(
        `Se han asignado ${totalHorasAsignadas - horasDisponibles} horas de más para ${nuevaClase.materia}.`,
      )
      setOpenWarning(true)
      return
    }

    const nuevaClaseConHoras = { ...nuevaClase, horasAsignadas: totalHorasAsignadas }

    if (editingClase) {
      setClases(
        clases.map((clase) =>
          clase.id === editingClase.id
            ? {
                ...nuevaClaseConHoras,
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
          ...nuevaClaseConHoras,
          id: newId,
          color: generarColorAleatorio(),
        },
      ])
    }

    // Agregar clase extra si existe
    if (horasExtras) {
      const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      setClases((prevClases) => [
        ...prevClases,
        {
          ...horasExtras,
          id: newId,
          profesor: nuevaClase.profesor,
          materia: nuevaClase.materia,
          aula: nuevaClase.aula,
          color: generarColorAleatorio(),
          horasAsignadas: calcularHorasAsignadas(horasExtras.horaInicio, horasExtras.horaFin),
        },
      ])
    }

    // Update remaining hours
    setHorasRestantes((prev) => ({
      ...prev,
      [nuevaClaseConHoras.materia]: 0, // Todas las horas han sido asignadas
    }))

    console.log("Clase guardada:", nuevaClaseConHoras)
    handleClose()
  }

  const calcularHorasAsignadas = (horaInicio: string, horaFin: string) => {
    const inicio = new Date(`2000-01-01T${horaInicio}:00`)
    const fin = new Date(`2000-01-01T${horaFin}:00`)
    const minutos = (fin.getTime() - inicio.getTime()) / (1000 * 60)
    return minutos / 45 // Convertir minutos a horas de clase (45 minutos = 1 hora de clase)
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
      <Typography variant="caption">Horas restantes: {horasRestantes[clase.materia] || 0}</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
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
    </Box>
  )

  const handleDownloadPDF = async () => {
    if (horarioRef.current) {
      setIsPrinting(true)
      await new Promise((resolve) => setTimeout(resolve, 100)) // Espera para que se apliquen los cambios de estilo

      const canvas = await html2canvas(horarioRef.current, {
        scale: 2,
      })
      const imgData = canvas.toDataURL("image/png")

      const imgWidth = 210 * 0.9
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      })

      const xPosition = (pdf.internal.pageSize.width - imgWidth) / 2
      const yPosition = (pdf.internal.pageSize.height - imgHeight) / 2

      pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight)
      pdf.save("horario.pdf")

      setIsPrinting(false)
    }

    // Mostrar todas las clases en la consola
    console.log("Todas las clases agregadas:", clases)
  }

  const handleGuardarHorario = () => {
    console.log("Horario guardado:", clases)
  }

  const printStyles = `
    @media print {
      .clase-content button {
        display: none !important;
      }
    }
  `

  const handleAddHorasExtras = () => {
    if (!horasExtras) {
      setHorasExtras({ dia: 0, horaInicio: "", horaFin: "", horasAsignadas: 0 })
    }
  }

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
        <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleGuardarHorario}>
          Guardar Horario
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
                            minWidth: "180px",
                            height: "100px",
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
                  {asignaturasPorDefecto.map((asignatura) => (
                    <MenuItem key={asignatura.id} value={asignatura.nombre}>
                      {asignatura.nombre}
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
                  {profesoresPorDefecto.map((profesor) => (
                    <MenuItem key={profesor.id} value={profesor.nombre}>
                      {profesor.nombre}
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
                  {aulasPorDefecto.map((aula) => (
                    <MenuItem key={aula.id} value={aula.nombre}>
                      {aula.nombre}
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

          {horasExtras && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Horas Extras
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Día</InputLabel>
                    <Select
                      value={horasExtras.dia}
                      onChange={(e) => setHorasExtras({ ...horasExtras, dia: e.target.value as number })}
                    >
                      {dias.map((dia, idx) => (
                        <MenuItem key={dia} value={idx}>
                          {dia}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Hora de Inicio</InputLabel>
                    <Select
                      value={horasExtras.horaInicio}
                      onChange={(e) => setHorasExtras({ ...horasExtras, horaInicio: e.target.value as string })}
                    >
                      {horas.map((hora) => (
                        <MenuItem key={hora} value={hora}>
                          {hora}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Hora de Finalización</InputLabel>
                    <Select
                      value={horasExtras.horaFin}
                      onChange={(e) => setHorasExtras({ ...horasExtras, horaFin: e.target.value as string })}
                    >
                      {horas
                        .filter((hora) => hora > horasExtras.horaInicio)
                        .map((hora) => (
                          <MenuItem key={hora} value={hora}>
                            {hora}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {!horasExtras && (
            <Button onClick={handleAddHorasExtras} sx={{ mt: 2 }}>
              Agregar Horas Extras
            </Button>
          )}
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

