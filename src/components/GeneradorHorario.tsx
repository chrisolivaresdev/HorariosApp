"use client"

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
  Chip,
  Link, // Añadido para mostrar las horas disponibles
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  CalendarMonth as CalendarIcon, // Icono para mostrar disponibilidad
} from "@mui/icons-material"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Swal from "sweetalert2"
import axiosInstance from "../axios/axiosInstance"

interface Clase {
  id?: any | null
  teacherId?: string // Cambiado a string
  subjectId: string
  classroomId: string
  day_of_week: string
  start_time: string
  end_time: string
  color?: string
  horasAsignadas: number
}

interface GeneradorHorarioProps {
  seccionId: number
  selectedSeccion: any
  periodId: any
}

interface HorasExtras {
  day_of_week: string
  start_time: string
  end_time: string
  horasAsignadas: number
  classroomId?: string
}


const GeneradorHorario: React.FC<GeneradorHorarioProps> = ({ seccionId, selectedSeccion, periodId }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(false)
  const [openWarning, setOpenWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [clases, setClases] = useState<Clase[]>([])
  const [editingClase, setEditingClase] = useState<Clase | null>(null)
  const [nuevaClase, setNuevaClase] = useState<Clase>({
    id:null,
    teacherId: "",
    subjectId: "",
    classroomId: "",
    day_of_week: "Lunes",
    start_time: "",
    end_time: "",
    horasAsignadas: 0,
  })
  const [isPrinting, setIsPrinting] = useState(false)
  const [horasRestantes, setHorasRestantes] = useState<{ [key: string]: number }>({})
  const [horasExtras, setHorasExtras] = useState<HorasExtras | null>(null)
  const [claseOriginal, setClaseOriginal] = useState<Clase | null>(null)
  const [createdSubjects, setCreatedSubjects] = useState<string[]>([])
  const [teachers, setteachers] = useState<any>([])
  const [subjects, setsubjects] = useState<any>([])
  const [classrooms, setclassrooms] = useState<any>([])
  const [hasSchedule, setHasSchedule] = useState<any>(false) 
  const [scheduleId, setScheduleId] = useState<any>(false) 
  
  // Nuevos estados para el diálogo de disponibilidad
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
  const [teacherAvailability, setTeacherAvailability ] = useState<any>("")
  const [classroomAvailability, setClassroomAvailability ] = useState<any>("")



  // Add new state for classroom availability dialog
  const [classroomAvailabilityDialogOpen, setClassroomAvailabilityDialogOpen] = useState(false)
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("")

  const horarioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const horasInicialesRestantes: { [key: string]: number } = {}
    subjects.forEach((asignatura:any) => {
      horasInicialesRestantes[asignatura.id] = asignatura.weekly_hours
    })
    setHorasRestantes(horasInicialesRestantes)
  }, [subjects])

  useEffect(() => {
    getTeachers()
  }, [])

  useEffect(() => {
    getClassrooms(periodId)
  }, [periodId])

  useEffect(() => {
    getSubjects()
  }, [])

  useEffect(() => {
    getHorario()
  }, [seccionId, periodId])

  const getTeachers = () => {
    axiosInstance
      .get("teachers")
      .then((response) => {
        setteachers(response.data)
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: "A ocurrido un error.",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  const getClassrooms = (periodId: any) => {
    axiosInstance
      .get(`classrooms/find-by-period/${periodId}`)
      .then((response) => {
        setclassrooms(response.data)
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: "A ocurrido un error.",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  const getSubjects = () => {
    axiosInstance
      .get("subjects")
      .then((response) => {
        const subjects = response.data.map((subject:any) => ({
          ...subject,
          weekly_hours: Number.parseInt(subject.weekly_hours, 10),
        }))
        console.log(selectedSeccion, subjects)

        const filteredSubjects = subjects.filter(
          (subject:any) =>
            subject.journey === selectedSeccion.trayecto && subject.quarters.includes(selectedSeccion.trimestre),
        )
        console.log(filteredSubjects)
        setsubjects(filteredSubjects)
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: "Ha ocurrido un error.",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  // Generar rangos de horas
  const horas:any = []
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
      id:null,
      teacherId: "",
      subjectId: "",
      classroomId: "",
      day_of_week: "Lunes",
      start_time: "",
      end_time: "",
      horasAsignadas: 0,
    })
    setHorasExtras(null)
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return
    }

    if (editingClase) {
      handleCancel()
    } else {
      setOpen(false)
      setEditingClase(null)
      setHorasExtras(null)
    }
  }

  const handleCloseWarning = () => {
    setOpenWarning(false)
  }

  const handleEdit = (clase: Clase) => {
    setClaseOriginal(clase)
    setEditingClase(clase)
    console.log(clase)
    setNuevaClase({
      id:Number(clase.id) || null, 
      teacherId: clase.teacherId,
      subjectId: clase.subjectId,
      classroomId: clase.classroomId,
      day_of_week: clase.day_of_week,
      start_time: clase.start_time,
      end_time: clase.end_time,
      horasAsignadas: clase.horasAsignadas,
    })

    // Remove all classes of the same subject from the schedule
    const clasesRemovidas = clases.filter((c) => c.subjectId === clase.subjectId)
    setClases(clases.filter((c) => c.subjectId !== clase.subjectId))

    // Reset hours for the subject being edited
    setHorasRestantes((prev) => ({
      ...prev,
      [clase.subjectId]: subjects.find((asignatura:any) => asignatura.id === clase.subjectId)?.weekly_hours || 0,
    }))

    // Find extra hours associated with this subject
    const horasExtrasAsociadas = clasesRemovidas.find((c) => c.day_of_week !== clase.day_of_week)

    if (horasExtrasAsociadas) {
      setHorasExtras({
        day_of_week: horasExtrasAsociadas.day_of_week,
        start_time: horasExtrasAsociadas.start_time,
        end_time: horasExtrasAsociadas.end_time,
        horasAsignadas: horasExtrasAsociadas.horasAsignadas,
        classroomId: horasExtrasAsociadas.classroomId,
      })
    } else {
      setHorasExtras(null)
    }

    setOpen(true)
  }

  // const handleDelete = (claseId: string) => {



  //   const claseAEliminar = clases.find((clase) => clase.id === claseId)
  //   if (claseAEliminar) {
  //     // Remove all classes of the same subject
  //     const clasesEliminadas = clases.filter((clase) => clase.subjectId === claseAEliminar.subjectId)

  //     // Restablecer las horas disponibles para la subjectId eliminada
  //     setHorasRestantes((prev) => {
  //       // Buscar las horas semanales originales de la subjectId
  //       const horasOriginales =
  //         subjects.find((asignatura) => asignatura.id === claseAEliminar.subjectId)?.weekly_hours || 0

  //       return {
  //         ...prev,
  //         [claseAEliminar.subjectId]: horasOriginales,
  //       }
  //     })

  //     setClases(clases.filter((clase) => clase.subjectId !== claseAEliminar.subjectId))
  //     setCreatedSubjects((prev) => prev.filter((subject) => subject !== claseAEliminar.subjectId))
  //   }
  // }

  const handleDelete = (claseId: string) => {
    const claseAEliminar = clases.find((clase) => clase.id === claseId);
    if (claseAEliminar) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          const payload = {
            classIds: [Number(claseAEliminar.id)],
            scheduleId: scheduleId,
          };
  
          axiosInstance
            .delete("/classes", { data: payload })
            .then(() => {
              // Restablecer las horas disponibles para la subjectId eliminada
              setHorasRestantes((prev) => {
                const horasOriginales =
                  subjects.find((asignatura: any) => asignatura.id === claseAEliminar.subjectId)?.weekly_hours || 0;
  
                return {
                  ...prev,
                  [claseAEliminar.subjectId]: horasOriginales,
                };
              });
  
              setClases(clases.filter((clase) => clase.subjectId !== claseAEliminar.subjectId));
              setCreatedSubjects((prev) => prev.filter((subject) => subject !== claseAEliminar.subjectId));
  
              Swal.fire({
                title: "Bien!",
                text: "Clase eliminada correctamente",
                icon: "success",
              });
            })
            .catch((error) => {
              Swal.fire({
                title: "¡Error!",
                text: error.response?.data?.message || "Ha ocurrido un error al eliminar la clase",
                icon: "error",
              });
              console.error("Error:", error);
            });
        }
      });
    }
  };

  const checkOverlap = (
    day1: string,
    start1: string,
    end1: string,
    day2: string,
    start2: string,
    end2: string,
  ): boolean => {
    return day1 === day2 && start1 < end2 && end1 > start2
  }

  const verificarSolapamiento = (nuevaClase: Omit<Clase, "id">, claseId?: string): boolean => {
    console.log("Verificando solapamiento con clases:", clases)
    // Verificar si clases es undefined o null
    if (!clases || !Array.isArray(clases)) {
      console.warn("El array de clases es undefined o no es un array")
      return false
    }

    return clases.some((clase) => {
      if (claseId && clase.id === claseId) return false
      return checkOverlap(
        nuevaClase.day_of_week,
        nuevaClase.start_time,
        nuevaClase.end_time,
        clase.day_of_week,
        clase.start_time,
        clase.end_time,
      )
    })
  }

  const handleSave = () => {
    // Validaciones iniciales (sin cambios)
    if (
      !nuevaClase.subjectId ||
      !nuevaClase.teacherId ||
      !nuevaClase.classroomId ||
      !nuevaClase.day_of_week ||
      !nuevaClase.start_time ||
      !nuevaClase.end_time
    ) {
      setWarningMessage("Por favor, complete todos los campos del formulario.")
      setOpenWarning(true)
      return
    }

    // Resto de validaciones (sin cambios)
    if (nuevaClase.end_time <= nuevaClase.start_time) {
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
      if (!horasExtras.classroomId) {
        setWarningMessage("Debe seleccionar un classroomId para las horas extras.")
        setOpenWarning(true)
        return
      }
      if (horasExtras.end_time <= horasExtras.start_time) {
        setWarningMessage("La hora de finalización debe ser posterior a la hora de inicio.")
        setOpenWarning(true)
        return
      }

      if (!horasExtras.day_of_week) {
        setWarningMessage("Por favor, complete todos los campos del formulario.")
        setOpenWarning(true)
        return
      }

      const mainClassOverlap = checkOverlap(
        nuevaClase.day_of_week,
        nuevaClase.start_time,
        nuevaClase.end_time,
        horasExtras.day_of_week,
        horasExtras.start_time,
        horasExtras.end_time,
      )
      const extraHoursOverlap = clases.some((clase) =>
        checkOverlap(
          clase.day_of_week,
          clase.start_time,
          clase.end_time,
          horasExtras.day_of_week,
          horasExtras.start_time,
          horasExtras.end_time,
        ),
      )

      if (mainClassOverlap || extraHoursOverlap) {
        setWarningMessage(
          "Las horas extras se solapan con otras clases en el mismo día. Por favor, ajuste los horarios.",
        )
        setOpenWarning(true)
        return
      }
    }

    const horasAsignadas = calcularHorasAsignadas(nuevaClase.start_time, nuevaClase.end_time)
    const horasExtrasAsignadas = horasExtras ? calcularHorasAsignadas(horasExtras.start_time, horasExtras.end_time) : 0
    const totalHorasAsignadas = horasAsignadas + horasExtrasAsignadas
    const horasDisponibles = editingClase
      ? subjects.find((asignatura:any) => asignatura.id === nuevaClase.subjectId)?.weekly_hours || 0
      : horasRestantes[nuevaClase.subjectId] || 0

    if (totalHorasAsignadas < horasDisponibles) {
      setWarningMessage(
        `Faltan ${horasDisponibles - totalHorasAsignadas} horas por asignar para ${subjects?.find((subject:any) => subject.id === nuevaClase.subjectId)?.name}.`,
      )
      setOpenWarning(true)
      return
    } else if (totalHorasAsignadas > horasDisponibles) {
      setWarningMessage(
        `Se han asignado ${totalHorasAsignadas - horasDisponibles} horas de más para ${subjects?.find((subject:any) => subject.id === nuevaClase.subjectId)?.name}.`,
      )
      setOpenWarning(true)
      return
    }

    const schedules = [
      {
        start_time: nuevaClase.start_time,
        end_time: nuevaClase.end_time,
        day_of_week: nuevaClase.day_of_week,
        subjectId: nuevaClase.subjectId,
        teacherId: nuevaClase.teacherId,
        classroomId: nuevaClase.classroomId,
        periodId: periodId,
      },
    ]

    const nuevaClaseConHoras:any = {
      ...nuevaClase,
      horasAsignadas: horasAsignadas,
      color: editingClase ? editingClase.color : generarColorAleatorio(nuevaClase.subjectId),
    }

    // Preparar los datos para la validación
    const validate = {
      sectionId: seccionId,
      classes: schedules,
    }

    // Añadir horas extras si existen
    if (horasExtras) {
      // const extraHoursClass = {
      //   ...horasExtras,
      //   id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      //   teacherId: nuevaClase.teacherId,
      //   subjectId: nuevaClase.subjectId,
      //   classroomId: horasExtras.classroomId || nuevaClase.classroomId,
      //   color: nuevaClaseConHoras.color,
      //   horasAsignadas: calcularHorasAsignadas(horasExtras.start_time, horasExtras.end_time),
      // }
      validate.classes.push({
        start_time: horasExtras.start_time,
        end_time: horasExtras.end_time,
        day_of_week: horasExtras.day_of_week,
        subjectId: nuevaClase.subjectId,
        teacherId: nuevaClase.teacherId,
        classroomId: horasExtras?.classroomId,
        periodId: periodId,
      })
    }

    // Formatear las horas para la API
    validate.classes = validate.classes.map((schedule:any) => {
      const formatToISO = (timeString: any) => {
        const currentDate = new Date()
        const [hours, minutes] = timeString.split(":")
        currentDate.setUTCHours(hours, minutes, 0, 0)
        return currentDate.toISOString()
      }

      return {
        ...schedule,
        start_time: formatToISO(schedule.start_time),
        end_time: formatToISO(schedule.end_time),
      }
    })

    // Primero validar con la API
    axiosInstance
      .post("classes/validate", validate)
      .then(() => {
        Swal.fire({
          title: "Bien!",
          text: "Datos disponibles",
          icon: "success",
        })

        // console.log(editingClase)

        // handleGuardarHorario()

        // Ahora actualizar el estado después de la validación exitosa
        setClases((prevClases) => {
          // Asegurarse de que prevClases sea un array
          const currentClases = Array.isArray(prevClases) ? prevClases : []

          // Eliminar todas las clases existentes para esta asignatura
          const updatedClases = currentClases.filter((c) => c.subjectId !== nuevaClase.subjectId)

          // Añadir la nueva clase o la clase actualizada
          updatedClases.push(nuevaClaseConHoras)

          // Añadir horas extras si existen
          if (horasExtras) {
            const extraHoursClass:any = {
              ...horasExtras,
              teacherId: nuevaClase.teacherId,
              subjectId: nuevaClase.subjectId,
              classroomId: horasExtras.classroomId || nuevaClase.classroomId,
              color: nuevaClaseConHoras.color,
              horasAsignadas: calcularHorasAsignadas(horasExtras.start_time, horasExtras.end_time),
            }
            updatedClases.push(extraHoursClass)
          }

          
          return updatedClases
        })

        // Actualizar las horas restantes
        setHorasRestantes((prev) => {
          const horasOriginales = prev[nuevaClaseConHoras.subjectId]
          return {
            ...prev,
            [nuevaClaseConHoras.subjectId]: horasOriginales - totalHorasAsignadas,
          }
        })

        // Si no estamos editando, añadir la asignatura a las creadas
        if (!editingClase) {
          setCreatedSubjects((prev) => [...prev, nuevaClase.subjectId])
        }

        // Cerrar el diálogo
        setOpen(false)
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Error!",
          text: error.response?.data?.message || "Ha ocurrido un error al validar el horario",
          icon: "error",
        })
        console.error("Error:", error)
      })
  }

  const calcularHorasAsignadas = (start_time: string, end_time: string) => {
    const inicio = new Date(`2000-01-01T${start_time}:00`)
    const fin = new Date(`2000-01-01T${end_time}:00`)
    const minutos = (fin.getTime() - inicio.getTime()) / (1000 * 60)
    return minutos / 45 // Convertir minutos a horas de clase (45 minutos = 1 hora de clase)
  }

  const [colorMap] = useState(new Map<string, string>())

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

  const encontrarClase = (hora: string, day_of_week: string) => {
    return clases?.find(
      (clase) => clase.day_of_week === day_of_week && clase.start_time <= hora && clase.end_time > hora,
    )
  }

  const renderAccionesClase = (clase: Clase) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
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



  const getHorario = () => {
    axiosInstance
      .get(`schedules/section/${seccionId}/period/${periodId}`)
      .then((response) => {
        setScheduleId(response.data.schedules[0].id)
        if (response.data.schedules.length > 0) {
          setHasSchedule(true)
        } else {
          setHasSchedule(false)
        }
     
        const horarios = response.data.schedules[0].classes.map((horario:any) => {
          const colores = [
            "#bbdefb", // Azul claro
            "#c8e6c9", // Verde claro
            "#f8bbd0", // Rosa claro
            "#fff9c4", // Amarillo claro
            "#ffccbc", // Naranja claro
          ];
          const generarColorAleatorio = () => colores[Math.floor(Math.random() * colores.length)];
  
          const formatTime = (isoString: string) => {
            const date = new Date(isoString);
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          };
  
          return {
            id: horario.id.toString(),
            teacherId: Number(horario.teacher.id),
            subjectId: Number(horario.subject.id),
            classroomId: Number(horario.classroom.id),
            day_of_week: horario.day_of_week,
            start_time: formatTime(horario.start_time),
            end_time: formatTime(horario.end_time),
            color: generarColorAleatorio(),
            horasAsignadas: (new Date(horario.end_time).getTime() - new Date(horario.start_time).getTime()) / (1000 * 60 * 45), // Convertir minutos a horas de clase (45 minutos = 1 hora de clase)
          };
        });
  
        const usedSubjects = horarios.map((horario:any) => horario.subjectId);
  
        setClases(horarios);
        setCreatedSubjects(usedSubjects);
  
        Swal.fire({
          title: "Bien!",
          text: "Cargado el horario correctamente",
          icon: "success",
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "¡Atento!",
          text: error.response?.data?.message || "Ha ocurrido un error al cargar el horario",
          icon: "warning",
        });
        console.error("Error:", error);
      });
  };

  const handleGuardarHorario = () => {
    const schedules = clases.map((clase) => {
      const formatToISO = (timeString: string) => {
        const currentDate = new Date();
        const [hours, minutes] = timeString.split(":");
        currentDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);
        return currentDate.toISOString();
      };

      let objeto: any

      console.log(clase)
      console.log(hasSchedule)

      if(hasSchedule){
        objeto = {
          id: clase.id,
          start_time: formatToISO(clase.start_time),
          end_time: formatToISO(clase.end_time),
          day_of_week: clase.day_of_week,
          subjectId: clase.subjectId,
          teacherId: clase.teacherId,
          classroomId: clase.classroomId,
          periodId: periodId,
        };
      }else {
        objeto = {
          start_time: formatToISO(clase.start_time),
          end_time: formatToISO(clase.end_time),
          day_of_week: clase.day_of_week,
          subjectId: clase.subjectId,
          teacherId: clase.teacherId,
          classroomId: clase.classroomId,
          periodId: periodId,
        };
      }
  
      return objeto;
    });

    let result;

    if (hasSchedule) {
      result = {
        scheduleId: scheduleId,
        sectionId: seccionId,
        classes: schedules,
      };
    } else {
      result = {
        sectionId: seccionId,
        classes: schedules,
      };
    }
  
    if (hasSchedule) {
  
      axiosInstance
        .patch(`classes`, result)
        .then(() => {
          Swal.fire({
            title: "Bien!",
            text: "Actualizado correctamente disponibles",
            icon: "success",
          });
        })
        .catch((error) => {
          Swal.fire({
            title: "¡Error!",
            text: error.response?.data?.message || "Ha ocurrido un error al guardar el horario",
            icon: "error",
          });
          console.error("Error:", error);
        });
    } else {
      axiosInstance
        .post("classes", result)
        .then(() => {
          Swal.fire({
            title: "Bien!",
            text: "Guardado Correctamente disponibles",
            icon: "success",
          });
        })
        .catch((error) => {
          Swal.fire({
            title: "¡Error!",
            text: error.response?.data?.message || "Ha ocurrido un error al guardar el horario",
            icon: "error",
          });
          console.error("Error:", error);
        });
    }
  };
     

  const printStyles = `
    @media print {
      .clase-content button {
        display: none !important;
      }
    }
  `

  const handleAddHorasExtras = () => {
    if (!horasExtras) {
      setHorasExtras({ day_of_week: "Lunes", start_time: "", end_time: "", horasAsignadas: 0, classroomId: "" })
    }
  }

  const handleCancel = () => {
    if (claseOriginal) {
      // Get all classes with the same subject ID that were removed
      const clasesOriginales = clases.filter((c) => c.subjectId === claseOriginal.subjectId)

      // If no classes with this subject ID exist in the current state, restore the original ones
      if (clasesOriginales.length === 0) {
        // Find all classes that were removed when editing started
        const toRestore = clases.filter((c) => c.id !== claseOriginal.id && c.subjectId === claseOriginal.subjectId)

        // Add back the original class and any associated classes
        setClases((prevClases) => [...prevClases, claseOriginal, ...toRestore])
      }
    }

    setClaseOriginal(null)
    setEditingClase(null)
    setHorasExtras(null)
    setOpen(false)
  }

  const obtenerDisponibilidadProfesor = async (teacherId: string) => {
    try {
      const response = await axiosInstance.get(`http://localhost:3000/api/teachers/${teacherId}/available-slots`);
  
      const disponibilidad = response.data.reduce((acc:any, schedule:any) => {
        const day = schedule.dayOfWeek;
        const freeSlots = schedule.freeSlots.map((slot:any) => {
          const startTime = extractTimeFromISO(slot.start_time);
          const endTime = extractTimeFromISO(slot.end_time);
          return `${startTime}-${endTime}`;
        });
  
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(...freeSlots);
        return acc;
      }, {});

      console.log(disponibilidad)

  
      setTeacherAvailability((prev:any) => ({
        ...prev,
        [teacherId]: disponibilidad,
      }));
    } catch (error) {
      console.error("Error al obtener la disponibilidad del profesor:", error);
      Swal.fire({
        title: "¡Error!",
        text: "Ha ocurrido un error al obtener la disponibilidad del profesor.",
        icon: "error",
      });
    }
  };
  
  const extractTimeFromISO = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  

  // Nueva función para manejar la apertura del diálogo de disponibilidad
  const handleShowAvailability = async (teacherId:any) => {
    setSelectedTeacherId(teacherId);
    await obtenerDisponibilidadProfesor(teacherId);
    setAvailabilityDialogOpen(true);
  };

  // Función para cerrar el diálogo de disponibilidad
  const handleCloseAvailability = () => {
    setAvailabilityDialogOpen(false)
  }

  // Función para obtener el nombre del profesor por ID
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t:any) => t.id == teacherId)
    return teacher ? `${teacher.firstname} ${teacher.lastname}` : "Profesor"
  }

  const obtenerDisponibilidadAula = async (classroomId: string) => {
    try {
      const response = await axiosInstance.get(`http://localhost:3000/api/classrooms/${classroomId}/available-slots`);
  
      const disponibilidad = response.data.reduce((acc:any, schedule:any) => {
        const day = schedule.dayOfWeek;
        const freeSlots = schedule.freeSlots.map((slot:any) => {
          const startTime = extractTimeFromISO(slot.start_time);
          const endTime = extractTimeFromISO(slot.end_time);
          return `${startTime}-${endTime}`;
        });
  
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(...freeSlots);
        return acc;
      }, {});
  
      setClassroomAvailability((prev:any) => ({
        ...prev,
        [classroomId]: disponibilidad,
      }));
    } catch (error) {
      console.error("Error al obtener la disponibilidad del aula:", error);
      Swal.fire({
        title: "¡Error!",
        text: "Ha ocurrido un error al obtener la disponibilidad del aula.",
        icon: "error",
      });
    }
  };

  // Add function to handle opening classroom availability dialog
  const handleShowClassroomAvailability = async (classroomId: string) => {
    setSelectedClassroomId(classroomId);
    await obtenerDisponibilidadAula(classroomId);
    setClassroomAvailabilityDialogOpen(true);
  };

  // Add function to close classroom availability dialog
  const handleCloseClassroomAvailability = () => {
    setClassroomAvailabilityDialogOpen(false)
  }

  // Add function to get classroom name by ID
  const getClassroomName = (classroomId: string) => {
    const classroom = classrooms.find((c:any) => c.id == classroomId)
    return classroom ? classroom.name : "Aula"
  }

  useEffect(() => {
    console.log("Estado de clases actualizado:", clases)
  }, [clases])

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <style>{printStyles}</style>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleClickOpen} size="small">
          Agregar Clase
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          size="small"
        >
          Descargar PDF
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleGuardarHorario}
          size="small"
        >
          Guardar Horario
        </Button>
      </Box>

      <Box ref={horarioRef} sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem" }}>
            {selectedSeccion?.nombreSeccion}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            Trayecto {selectedSeccion?.trayecto === 0 ? "Inicial" : selectedSeccion?.trayecto} - Trimestre{" "}
            {selectedSeccion?.trimestre}
          </Typography>
        </Box>

        {isMobile ? (
          // Vista móvil: horario por día
          <Box sx={{ mb: 2 }}>
            {dias.map((day_of_week) => (
              <Paper key={day_of_week} sx={{ mb: 2, p: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: "0.9rem" }}>
                  {day_of_week}
                </Typography>
                {horas.map((hora:any) => {
                  const clase = encontrarClase(hora, day_of_week)
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
                            <Typography variant="subtitle2" sx={{ fontSize: "0.8rem" }}>
                              {clase.start_time} - {clase.end_time}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: "0.7rem" }}>
                              {subjects.find((subject:any) => subject.id === clase.subjectId).name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: "0.7rem" }}>
                              Prof:{" "}
                              {teachers.find((teacher:any) => teacher.id == clase.teacherId).firstname +
                                " " +
                                teachers.find((teacher:any) => teacher.id == clase.teacherId).lastname}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: "0.7rem" }}>
                              {clase.classroomId}
                            </Typography>
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
          // Vista desktop: tabla compacta
          <TableContainer component={Paper} sx={{ maxWidth: "1000px" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem", width: "60px" }}>Hora</TableCell>
                  {dias.map((day_of_week) => (
                    <TableCell
                      key={day_of_week}
                      sx={{
                        borderLeft: "1px solid rgba(224, 224, 224, 1)",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        width: "135px",
                      }}
                    >
                      {day_of_week}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {horas.map((hora:any) => (
                  <TableRow key={hora}>
                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{hora}</TableCell>
                    {dias.map((day_of_week) => {
                      const clase = encontrarClase(hora, day_of_week)
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
                                  {subjects.find((subject:any) => subject.id === clase.subjectId).name}
                                </Typography>
                                {!isPrinting && renderAccionesClase(clase)}
                              </Box>
                              <Typography variant="body1" sx={{ fontSize: "0.7rem" }}>
                                Prof:{" "}
                                {teachers.find((teacher:any) => teacher.id == clase.teacherId).firstname +
                                  " " +
                                  teachers.find((teacher:any) => teacher.id == clase.teacherId).lastname}
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: "0.7rem" }}>
                                {classrooms.find((classroom:any) => classroom.id == clase.classroomId).name}
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: "0.7rem" }}>
                                {classrooms.find((classroom:any) => classroom.id == clase.classroomId).type}
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
                <InputLabel>Asignaturas</InputLabel>
                <Select
                  value={nuevaClase.subjectId}
                  // onChange={(e) => setNuevaClase({ ...nuevaClase, subjectId: e.target.value as string, teacherId : undefined})}
                  onChange={(e) => {
                    const selectedSubjectId = e.target.value as string

                    // Filter teachers for this subject
                    const availableTeachers = teachers.filter(
                      (teacher:any) =>
                        teacher.subjects && teacher.subjects.some((sub:any) => sub.subjectId == selectedSubjectId),
                    )

                    // Check if there are no teachers available for this subject
                    if (availableTeachers.length === 0 && selectedSubjectId) {
                      Swal.fire({
                        title: "¡Advertencia!",
                        text: "No hay profesor disponible para dar esa materia.",
                        icon: "warning",
                      })
                    }

                    // Reset teacherId when subject changes
                    setNuevaClase({
                      ...nuevaClase,
                      subjectId: selectedSubjectId,
                      teacherId: undefined, // Clear the professor selection
                    })
                  }}
                >
                  {subjects
                    .filter((asignatura:any) => {
                      // Si estamos editando, mostrar la asignatura actual
                      if (editingClase && asignatura.id === nuevaClase.subjectId) {
                        return true
                      }

                      // Si no estamos editando, solo mostrar asignaturas que no están en uso
                      return !createdSubjects.includes(asignatura.id)
                    })
                    .map((asignatura:any) => (
                      <MenuItem key={asignatura.id} value={asignatura.id}>
                        {asignatura.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Replace the professor select in the dialog with this updated version */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <FormControl
                  fullWidth
                  disabled={
                    !nuevaClase.subjectId ||
                    teachers.filter(
                      (teacher: any) =>
                        !nuevaClase.subjectId || teacher.subjects.some((sub:any) => sub.subjectId == nuevaClase.subjectId),
                    ).length < 1
                  }
                >
                  <InputLabel>Profesor</InputLabel>
                  <Select
                    value={nuevaClase.teacherId}
                    onChange={(e) => {
                      setNuevaClase({ ...nuevaClase, teacherId: e.target.value as string })
                      setSelectedTeacherId(e.target.value as string)
                    }}
                  >
                    {teachers
                      .filter(
                        (teacher:any) =>
                          !nuevaClase.subjectId ||
                          teacher.subjects.some((sub:any) => sub.subjectId == nuevaClase.subjectId),
                      )
                      .map((teacherId:any) => (
                        <MenuItem key={teacherId.id} value={teacherId.id}>
                          {`${teacherId.firstname} ${teacherId.lastname}`}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {nuevaClase.teacherId && (
                  <IconButton
                    color="primary"
                    onClick={() => handleShowAvailability(nuevaClase.teacherId)}
                    sx={{ ml: 1 }}
                    title="Ver disponibilidad del profesor"
                  >
                    <CalendarIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
            {/* Replace the classroom select in the dialog with this updated version */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <FormControl fullWidth>
                  <InputLabel>Aula</InputLabel>
                  <Select
                    value={nuevaClase.classroomId}
                    onChange={(e) => {
                      setNuevaClase({ ...nuevaClase, classroomId: e.target.value as string })
                      setSelectedClassroomId(e.target.value as string)
                    }}
                  >
                    {classrooms.map((classroomId:any) => (
                      <MenuItem key={classroomId.id} value={classroomId.id}>
                        {`${classroomId.name} - Capacidad ${classroomId.max_capacity}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {nuevaClase.classroomId && (
                  <IconButton
                    color="primary"
                    onClick={() => handleShowClassroomAvailability(nuevaClase.classroomId)}
                    sx={{ ml: 1 }}
                    title="Ver disponibilidad del aula"
                  >
                    <CalendarIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Día</InputLabel>
                <Select
                  value={nuevaClase.day_of_week}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, day_of_week: e.target.value })}
                >
                  {dias.map((day_of_week) => (
                    <MenuItem key={day_of_week} value={day_of_week}>
                      {day_of_week}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Hora de Inicio</InputLabel>
                <Select
                  value={nuevaClase.start_time}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, start_time: e.target.value as string })}
                >
                  {horas.map((hora:any) => (
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
                  value={nuevaClase.end_time}
                  onChange={(e) => setNuevaClase({ ...nuevaClase, end_time: e.target.value as string })}
                >
                  {horas
                    .filter((hora:any) => hora > nuevaClase.start_time)
                    .map((hora:any) => (
                      <MenuItem key={hora} value={hora}>
                        {hora}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {(horasExtras || editingClase) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Horas Extras
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Día</InputLabel>
                    <Select
                      value={horasExtras?.day_of_week ?? ""}
                      onChange={(e) => setHorasExtras((prev: any) => ({ ...prev, day_of_week: Number(e.target.value) }))}
                    >
                      {dias.map((day_of_week) => (
                        <MenuItem key={day_of_week} value={day_of_week}>
                          {day_of_week}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Hora de Inicio</InputLabel>
                    <Select
                      value={horasExtras?.start_time ?? ""}
                      onChange={(e) => setHorasExtras((prev:any) => ({ ...prev, start_time: e.target.value as string }))}
                    >
                      {horas.map((hora:any) => (
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
                      value={horasExtras?.end_time ?? ""}
                      onChange={(e) => setHorasExtras((prev:any) => ({ ...prev, end_time: e.target.value as string }))}
                    >
                      {horas
                        .filter((hora:any) => hora > (horasExtras?.start_time ?? ""))
                        .map((hora:any) => (
                          <MenuItem key={hora} value={hora}>
                            {hora}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Aula</InputLabel>
                    <Select
                      value={horasExtras?.classroomId ?? ""}
                      onChange={(e) => setHorasExtras((prev:any) => ({ ...prev, classroomId: e.target.value as string }))}
                    >
                      {classrooms.map((classroomId:any) => (
                        <MenuItem key={classroomId.id} value={classroomId.id}>
                          {`${classroomId.name} - Capacidad - ${classroomId.max_capacity}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button onClick={() => setHorasExtras(null)}>Eliminar Horas Extras</Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {!horasExtras && !editingClase && (
            <Button onClick={handleAddHorasExtras} sx={{ mt: 2 }}>
              Agregar Horas Extras
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
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

      {/* Diálogo de disponibilidad del profesor */}
      <Dialog open={availabilityDialogOpen} onClose={handleCloseAvailability} maxWidth="sm" fullWidth>
        <DialogTitle>Disponibilidad de {getTeacherName(selectedTeacherId)}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Día</TableCell>
                  <TableCell>Horas Disponibles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dias.map((day) => (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    <TableCell>
                      {teacherAvailability[selectedTeacherId]?.[day]?.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {teacherAvailability[selectedTeacherId]?.[day]?.map((timeSlot:any, index:any) => (
                            <Chip
                              key={index}
                              label={timeSlot}
                              size="small"
                              sx={{ bgcolor: "primary.light", color: "primary.contrastText" }}
                            />
                          )) || "No disponible"}
                        </Box>
                      ) : (
                        "No disponible"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
            Nota: Esta información es provisional. Consulte con el profesor para confirmar su disponibilidad.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
    Para más detalles, visite la sección de{" "}
    <Link href="/profesores" sx={{ color: "primary.main" }} target="_blank">
      Profesores
    </Link>.
  </Typography>
         
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAvailability} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de disponibilidad del aula */}
      <Dialog open={classroomAvailabilityDialogOpen} onClose={handleCloseClassroomAvailability} maxWidth="sm" fullWidth>
        <DialogTitle>Disponibilidad de {getClassroomName(selectedClassroomId)}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Día</TableCell>
                  <TableCell>Horas Disponibles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dias.map((day) => (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    <TableCell>
                      {classroomAvailability[selectedClassroomId]?.[day]?.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {classroomAvailability[selectedClassroomId]?.[day]?.map((timeSlot:any, index:any) => (
                            <Chip
                              key={index}
                              label={timeSlot}
                              size="small"
                              sx={{ bgcolor: "success.light", color: "success.contrastText" }}
                            />
                          )) || "No disponible"}
                        </Box>
                      ) : (
                        "No disponible"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
            Nota: Esta información es provisional. Verifique la disponibilidad actual del aula.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClassroomAvailability} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GeneradorHorario

