import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface PreviousScheduleModalprop{
    isOpen:any,
    onClose:any,
    schedule:any
}

const PreviousScheduleModal = ({ isOpen, onClose, schedule }:PreviousScheduleModalprop) => {

  console.log(schedule)

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Horario Anterior</DialogTitle>
      <DialogContent>
        {schedule ? (
          <Box>
            {Array.from(new Set(schedule.classes.map((item:any) => item.subject.name)))
              .map((subjectName:any, index:any) => {
                const item = schedule.classes.find((item:any) => item.subject.name === subjectName);
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body1">Materia: {item.subject.name}</Typography>
                    <Typography variant="body1">Profesor: {item.teacher.firstname}-{item.teacher.lastname}</Typography>
                  </Box>
                );
              })}
          </Box>
        ) : (
          <Typography>No hay datos disponibles</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviousScheduleModal;