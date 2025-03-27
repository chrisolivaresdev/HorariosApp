"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import axiosInstance from "../axios/axiosInstance"

interface availabilityDia {
  dayOfWeek: string
  start_time: string
  end_time: string
}

interface Profesor {
  id: number
  firstname: string
  lastname: string
  identification: string
  entry_date: string
  subjects: number[]
  availabilities: availabilityDia[]
}

interface HorarioProfesorProps {
  profesor: Profesor
  periodoId: number
}

const HorarioProfesor: React.FC<HorarioProfesorProps> = ({ profesor, periodoId }) => {
  const [clases, setClases] = useState<any[]>([])
  const [periodo, setPeriodo] = useState<any>("")
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
        const [horarioResponse, periodoResponse] = await Promise.all([
          axiosInstance.get(`schedules/teacher/${profesor.id}/period/${periodoId}`),
          axiosInstance.get(`periods/${periodoId}`),
        ])
  
        const formatTime = (isoString: string) => {
          const date = new Date(isoString)
          const hours = date.getUTCHours().toString().padStart(2, "0")
          const minutes = date.getUTCMinutes().toString().padStart(2, "0")
          return `${hours}:${minutes}`
        }
  
        // Recorremos todos los objetos dentro de `schedules` y sus `classes`
        const horarios = horarioResponse.data.schedules.flatMap((schedule: any) =>
          schedule.classes.map((horario: any) => ({
            id: horario.id.toString(),
            subjectName: horario.subject.name,
            sectionName: horario.section.name,
            teacherId: Number(profesor.id),
            subjectId: Number(horario.subject.id),
            aulaName: horario.classroom.name,
            classroomId: Number(horario.classroom.id),
            day_of_week: horario.day_of_week,
            start_time: formatTime(horario.start_time),
            end_time: formatTime(horario.end_time),
            color: generarColorAleatorio(horario.subject.id.toString()),
            horasAsignadas:
              (new Date(horario.end_time).getTime() - new Date(horario.start_time).getTime()) / (1000 * 60 * 45), // Convertir minutos a horas de clase (45 minutos = 1 hora de clase)
          }))
        )
  
        setClases(horarios)
        setPeriodo(periodoResponse.data)
      } catch (error) {
        console.error("Error al cargar el horario del profesor:", error)
      }
    }
  
    fetchHorario()
  }, [profesor.id, periodoId])

  const handleDownloadPDF = async () => {
    if (horarioRef.current) {
      const canvas = await html2canvas(horarioRef.current, {
        scale: 2,
      })
      const imgData = canvas.toDataURL("image/png")

      const imgWidth = 210 * 0.85
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const xPosition = (pdf.internal.pageSize.width - imgWidth) / 2
      const yPosition = 10 // Ajustar la posición Y para evitar el espacio en blanco

      pdf.setFontSize(16)
      pdf.setFontSize(12)
      pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight)
      pdf.save(`Horario_${profesor.firstname}-${profesor.lastname}.pdf`)
    }
  }

  return (
    <Box>
      <Box ref={horarioRef} sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem" }}>
            Horario de {profesor.firstname} {profesor.lastname}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            {`${periodo.name}`}
          </Typography>
        </Box>
        <TableContainer component={Paper} sx={{ maxWidth: "1000px" }}>
          <Table size="small" className="horario-table" sx={{ tableLayout: "fixed", minWidth: "900px" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem", width: "60px", minWidth: "60px" }}>
                  Hora
                </TableCell>
                {diasSemana.map((dia) => (
                  <TableCell
                    key={dia}
                    sx={{
                      borderLeft: "1px solid rgba(224, 224, 224, 1)",
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      width: "130px",
                      minWidth: "130px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dia}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {horas.map((hora) => (
                <TableRow key={hora}>
                  <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem", width: "60px", minWidth: "60px" }}>
                    {hora}
                  </TableCell>
                  {diasSemana.map((day_of_week) => {
                    const clase = clases?.find(
                      (clase) => clase.day_of_week === day_of_week && clase.start_time <= hora && clase.end_time > hora,
                    )
                    return (
                      <TableCell
                        key={`${day_of_week}-${hora}`}
                        className={clase ? "has-class" : ""}
                        sx={{
                          backgroundColor: clase?.color,
                          height: "50px",
                          maxHeight: "50px",
                          width: "130px",
                          minWidth: "130px",
                          padding: "2px 4px",
                          borderLeft: "1px solid rgba(224, 224, 224, 1)",
                          overflow: "hidden",
                          ...(clase && {
                            borderBottom: "none",
                            border: "1px solid rgba(0, 0, 0, 0.5)", // Darker border for cells with classes
                          }),
                        }}
                      >
                        {clase && hora === clase.start_time && (
                          <Box className="clase-content" sx={{ padding: "1px", overflow: "hidden" }}>
                            <Typography
                              variant="subtitle1"
                              className="clase-title"
                              sx={{
                                fontWeight: "bold",
                                width: "100%",
                              }}
                            >
                              {clase.subjectName}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: "0.7rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {clase.aulaName}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: "0.7rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {clase.sectionName}
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

export default HorarioProfesor

