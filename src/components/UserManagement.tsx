"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  IconButton,
  TablePagination,
  Tooltip,
} from "@mui/material"
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import axiosInstance from "../axios/axiosInstance"
import Swal from "sweetalert2"
interface User {
  id: number
  username: string
  password: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<Omit<User, "id">>({ username: "", password: "" })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [errors, setErrors] = useState<{
    username: string
    password: string
  }>({ username: "", password: "" })

  useEffect(() => {
    getUsers()
  }, [])

  const handleOpen = () => {
    setEditingUser(null)
    setNewUser({ username: "", password: "" })
    setOpen(true)
  }

  const handleClose = (event:any, reason: string) => {
    console.log(event)
    if (reason === "backdropClick") {
      return;
    }
    setOpen(false);
    setErrors({ username: "", password: "" })
  };

  const getUsers = () => {
    axiosInstance
      .get("users")
      .then((response) => {
        setUsers(response.data)
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

  const handleSave = () => {
    // Reset errors
    setErrors({ username: "", password: "" })

    // Validate fields
    let isValid = true
    const newErrors = { username: "", password: "" }

    if (!newUser.username.trim()) {
      newErrors.username = "El nombre de usuario es obligatorio"
      isValid = false
    }

    if (!newUser.password.trim()) {
      newErrors.password = "La contraseña es obligatoria"
      isValid = false
    }

    if (!isValid) {
      setErrors(newErrors)
      return
    }

    // Continue with saving if validation passes
    if (editingUser) {
      axiosInstance
        .patch(`users/update/${editingUser.id}`, newUser)
        .then(() => {
          Swal.fire({
            title: "Bien!",
            text: "Usuario editado correctamente!.",
            icon: "success",
          })
          getUsers()
        })
        .catch((error) => {
          Swal.fire({
            title: "¡Error!",
            text: "A ocurrido un error.",
            icon: "error",
          })
          console.error("Error:", error)
        })
    } else {
      axiosInstance
        .post("/auth/register", newUser)
        .then(() => {
          Swal.fire({
            title: "Bien!",
            text: "Usuario creado correctamente!.",
            icon: "success",
          })
          getUsers()
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
    handleClose("","")
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setNewUser({ username: user.username, password: "" })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este usuario?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminalo",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance
          .delete(`users/remove/${id}`)
          .then(() => {
            Swal.fire("Eliminado!", "El usuario ha sido borrado.", "success")
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
    })
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    console.log(event)
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Agregar Usuario
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEdit(user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingUser ? "Editar usuario" : "Agregar nuevo usuario"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Usuario"
            type="text"
            fullWidth
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            error={!!errors.username}
            helperText={errors.username}
            required
          />
          <TextField
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{handleClose("","")}}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UserManagement

