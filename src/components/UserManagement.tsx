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
  Typography,
  TablePagination,
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

  useEffect(() => {
    getUsers()
  }, [])

  const handleOpen = () => {
    setEditingUser(null)
    setNewUser({ username: "",  password: "" })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const getUsers = () => {
    axiosInstance.get("users")
      .then(response => {
        setUsers(response.data)
      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
  }

  const handleSave = () => {
    if (editingUser) {
      axiosInstance.patch(`users/update/${editingUser.id}`, newUser)
      .then(response => {
        Swal.fire({
          title: 'Bien!',
          text: 'Usuario editado correctamente!.',
          icon: 'success',
        });
      getUsers()
      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
    } else {
      axiosInstance.post('/auth/register', newUser)
      .then(response => {
        Swal.fire({
          title: 'Bien!',
          text: 'Usuario creado correctamente!.',
          icon: 'success',
        });
      getUsers()

      })
      .catch(error => {
        Swal.fire({
          title: '¡Error!',
          text: 'A ocurrido un error.',
          icon: 'error',
        });
        console.error('Error:', error);
      });
      
    }
    handleClose()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setNewUser({ username: user.username, password: "" })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro de eliminar este usuario?',
      text: '¡No podrás deshacer esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminalo'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`users/remove/${id}`)
        .then(response => {
          Swal.fire(
            'Eliminado!',
            'El usuario ha sido borrado.',
            'success'
          );
        })
        .catch(error => {
          Swal.fire({
            title: '¡Error!',
            text: 'A ocurrido un error.',
            icon: 'error',
          });
          console.error('Error:', error);
        });
        
      }
    });
   
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

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
              <TableCell>Username</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <DeleteIcon />
                  </IconButton>
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
        <DialogTitle>{editingUser ? "Editarr usuario" : "Agregar nuevo usuario"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UserManagement

