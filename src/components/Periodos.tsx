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
  Tabs,
  Tab,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  TablePagination,
  InputAdornment,
} from "@mui/material"
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material"
import Aulas from "./Aulas"
import Secciones from "./Secciones"

interface Periodo {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  aulas: any[]
  secciones: any[]
}

const Periodos: React.FC = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [filteredPeriodos, setFilteredPeriodos] = useState<Periodo[]>([])
  const [open, setOpen] = useState(false)
  const [newPeriodo, setNewPeriodo] = useState<Omit<Periodo, "id" | "aulas" | "secciones">>({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  })
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    const filtered = periodos.filter((periodo) => periodo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredPeriodos(filtered)
    setPage(0)
  }, [searchTerm, periodos])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSave = () => {
    const periodoToAdd = {
      ...newPeriodo,
      id: Date.now(),
      aulas: [],
      secciones: [],
    }
    setPeriodos([...periodos, periodoToAdd])
    setNewPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" })
    handleClose()
    setSelectedPeriodo(periodoToAdd)
    console.log("Periodo guardado:", periodoToAdd)
  }

  const handlePeriodoClick = (periodo: Periodo) => {
    setSelectedPeriodo(periodo)
    setTabValue(0)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const updatePeriodoData = (periodoId: number, entityType: keyof Periodo, newData: any[]) => {
    setPeriodos(periodos.map((periodo) => (periodo.id === periodoId ? { ...periodo, [entityType]: newData } : periodo)))
    if (selectedPeriodo && selectedPeriodo.id === periodoId) {
      setSelectedPeriodo({ ...selectedPeriodo, [entityType]: newData })
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Agregar Periodo
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
          {filteredPeriodos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((periodo) => (
            <Grid item xs={12} key={periodo.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{periodo.nombre}</Typography>
                  <Typography variant="body2">Inicio: {periodo.fechaInicio}</Typography>
                  <Typography variant="body2">Fin: {periodo.fechaFin}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handlePeriodoClick(periodo)}>
                    Ver Detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4, overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Fecha de Inicio</TableCell>
                <TableCell>Fecha de Fin</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPeriodos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((periodo) => (
                <TableRow key={periodo.id}>
                  <TableCell>{periodo.nombre}</TableCell>
                  <TableCell>{periodo.fechaInicio}</TableCell>
                  <TableCell>{periodo.fechaFin}</TableCell>
                  <TableCell>
                    <Button onClick={() => handlePeriodoClick(periodo)} variant="outlined" color="primary">
                      Ver Detalles
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
        count={filteredPeriodos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {selectedPeriodo && (
        <Box sx={{ width: "100%", mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Detalles del Periodo: {selectedPeriodo.nombre}
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="periodo tabs"
              variant={isMobile ? "fullWidth" : "standard"}
              orientation={isMobile ? "horizontal" : "horizontal"}
            >
              <Tab label="Aulas" />
              <Tab label="Secciones" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Aulas
                periodoId={selectedPeriodo.id}
                aulas={selectedPeriodo.aulas}
                updateAulas={(newAulas) => updatePeriodoData(selectedPeriodo.id, "aulas", newAulas)}
                isMobile={isMobile}
              />
            )}
            {tabValue === 1 && (
              <Secciones
                periodoId={selectedPeriodo.id}
                secciones={selectedPeriodo.secciones}
                updateSecciones={(newSecciones) => updatePeriodoData(selectedPeriodo.id, "secciones", newSecciones)}
                isMobile={isMobile}
              />
            )}
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Agregar Nuevo Periodo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                value={newPeriodo.nombre}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Inicio"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newPeriodo.fechaInicio}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaInicio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Fin"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newPeriodo.fechaFin}
                onChange={(e) => setNewPeriodo({ ...newPeriodo, fechaFin: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Periodos

