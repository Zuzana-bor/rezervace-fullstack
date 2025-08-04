import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

// Validace pro vytvoření rezervace
export const validateAppointment = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { date, service } = req.body;
  const errors: string[] = [];

  if (!date) {
    errors.push('Datum je povinný');
  } else {
    const appointmentDate = new Date(date);
    const now = new Date();
    if (appointmentDate <= now) {
      errors.push('Datum rezervace musí být v budoucnosti');
    }
  }

  if (!service || typeof service !== 'string' || service.trim().length === 0) {
    errors.push('Služba je povinná');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(', '), 400));
  }

  next();
};

// Validace pro admin vytvoření rezervace
export const validateAdminAppointment = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { date, service, firstName, lastName, clientPhone } = req.body;
  const errors: string[] = [];

  if (!date) errors.push('Datum je povinný');
  if (!service) errors.push('Služba je povinná');
  if (!firstName) errors.push('Jméno je povinné');
  if (!lastName) errors.push('Příjmení je povinné');

  if (clientPhone) {
    const phonePattern = /^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/;
    if (!phonePattern.test(clientPhone.replace(/\s+/g, ''))) {
      errors.push('Neplatné telefonní číslo');
    }
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(', '), 400));
  }

  next();
};

// Validace MongoDB ObjectId
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;

    if (!objectIdPattern.test(id)) {
      return next(new AppError(`Neplatný formát ${paramName}`, 400));
    }

    next();
  };
};
