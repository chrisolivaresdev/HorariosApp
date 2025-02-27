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

interface User {
  id: number
  username: string
  email: string
  password: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<Omit<User, "id">>({ username: "", email: "", password: "" })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Mock API call to fetch users
  useEffect(() => {
    // Replace this with actual API call in a real application
    setUsers([
      { id: 1, username: "admin", email: "admin@example.com", password: "password" },
      { id: 2, username: "user1", email: "user1@example.com", password: "password" },
      { id: 3, username: "user2", email: "user2@example.com", password: "password" },
    ])
  }, [])

  const handleOpen = () => {
    setEditingUser(null)
    setNewUser({ username: "", email: "", password: "" })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...editingUser, ...newUser } : user)))
    } else {
      const userToAdd = { ...newUser, id: Date.now() }
      setUsers([...users, userToAdd])
    }
    handleClose()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setNewUser({ username: user.username, email: user.email, password: "" })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter((user) => user.id !== id))
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
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Add User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
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
        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
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
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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

