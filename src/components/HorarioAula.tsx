import React, { useEffect, useState, useRef } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from "@mui/material"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import axiosInstance from "../axios/axiosInstance"
import Swal from "sweetalert2"


interface Aula {
  id: string
  name: string
  type: string
  max_capacity: number
  current_capacity: number
  availabilities: availabilityDia[]
}

interface availabilityDia {
  dayOfWeek: string
  start_time: string
  end_time: string
}

interface HorarioAulaProps {
  aula: Aula
  periodId:any
}

const HorarioAula: React.FC<HorarioAulaProps> = ({ aula, periodId }) => {
  const [clases, setClases] = useState<any[]>([])
  const horarioRef = useRef<HTMLDivElement>(null)
  const colorMap = new Map<string, string>()

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

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const generarColorAleatorio = (subjectId: string) => {
    if (colorMap.has(subjectId)) {
      return colorMap.get(subjectId)!
    }

    const colores = [
      "#bbdefb", // Azul claro
      "#c8e6c9", // Verde claro
      "#f8bbd0", // Rosa claro
      "#fff9c4", // Amarillo claro
      "#ffccbc", // Naranja claro
    ]
    const nuevoColor = colores[Math.floor(Math.random() * colores.length)]
    colorMap.set(subjectId, nuevoColor)
    return nuevoColor
  }


  useEffect(() => {
    const fetchHorario = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:3000/api/schedules/classroom/${aula.id}/period/${periodId}`)
        const horarios = response.data.schedules[0].classes.map((horario: any) => {
          const formatTime = (isoString: string) => {
            const date = new Date(isoString)
            const hours = date.getUTCHours().toString().padStart(2, "0")
            const minutes = date.getUTCMinutes().toString().padStart(2, "0")
            return `${hours}:${minutes}`
          }

          return {
            id: horario.id.toString(),
            subjectName: horario.subject.name,
            sectionName: horario.section.name,
            teacherId: Number(horario.teacher.id),
            teacherName: horario.teacher.firstname,
            teacherLastName: horario.teacher.lastname,
            subjectId: Number(horario.subject.id),
            aulaName: horario.classroom?.name,
            classroomId: Number(horario.classroom?.id),
            day_of_week: horario.day_of_week,
            start_time: formatTime(horario.start_time),
            end_time: formatTime(horario.end_time),
            color: generarColorAleatorio(horario.subject.id.toString()),
            horasAsignadas: (new Date(horario.end_time).getTime() - new Date(horario.start_time).getTime()) / (1000 * 60 * 45), // Convertir minutos a horas de clase (45 minutos = 1 hora de clase)
          }
        })

        setClases(horarios)
        Swal.fire({
          title: "¡Bien!",
          text: "Horario cargado correctamente.",
          icon: "success",
        })
      } catch (error:any) {
        if (error.response && error.response.status === 404) {
          Swal.fire({
            title: "¡Error!",
            text: "No se encontraron horarios para el aula en el período dado.",
            icon: "error",
          })
        } else {
          Swal.fire({
            title: "¡Error!",
            text: "Error al cargar el horario del aula.",
            icon: "error",
          })
        }
        console.error("Error al cargar el horario del aula:", error)
      }
    }
    
    fetchHorario()
  }, [aula.id, periodId])

  const handleDownloadPDF = async () => {
    if (horarioRef.current) {
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
      const yPosition = 10 // Ajustar la posición Y para evitar el espacio en blanco

      pdf.setFontSize(16)
      pdf.setFontSize(12)
      pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight)
      pdf.save(`Horario_${aula.name}.pdf`)
    }
  }

  return (
    <Box>
      <Box ref={horarioRef} sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem" }}>
            Horario del {aula.name}
          </Typography>
        </Box>
        <TableContainer component={Paper} sx={{ maxWidth: "1000px" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hora</TableCell>
                {diasSemana.map((dia) => (
                  <TableCell key={dia}>{dia}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {horas.map((hora) => (
                <TableRow key={hora}>
                  <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{hora}</TableCell>
                  {diasSemana.map((day_of_week) => {
                    const clase = clases?.find(
                      (clase) => clase.day_of_week === day_of_week && clase.start_time <= hora && clase.end_time > hora
                    )
                    return (
                      <TableCell
                        key={`${day_of_week}-${hora}`}
                        sx={{
                          backgroundColor: clase?.color,
                          height: "60px",
                          padding: "2px 4px",
                          borderLeft: "1px solid rgba(224, 224, 224, 1)",
                          ...(clase && {
                            borderBottom: "none",
                          }),
                        }}
                      >
                        {clase && hora === clase.start_time && (
                          <Box className="clase-content" sx={{ padding: "2px" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                              <Typography variant="subtitle1" sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                                {clase.subjectName}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontSize: "0.7rem" }}>
                              {clase.sectionName}
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: "0.7rem" }}>
                            {clase.teacherName} {clase.teacherLastName}
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
      </Box>
      <Button variant="contained" color="primary" onClick={handleDownloadPDF} sx={{ mt: 2 }}>
        Descargar PDF
      </Button>
    </Box>
  )
}

export default HorarioAula