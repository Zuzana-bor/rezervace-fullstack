// Sdílené typy pro celou aplikaci

export type User = {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  password?: string;
};

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
  duration?: number;
  userId?: User;
  clientFirstName?: string;
  clientLastName?: string;
  clientPhone?: string;
};

export type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number;
};

export type BlockedTime = {
  _id: string;
  start: string;
  end: string;
  allDay: boolean;
  note?: string;
};

export type ApiError = {
  message: string;
  status?: number;
};
