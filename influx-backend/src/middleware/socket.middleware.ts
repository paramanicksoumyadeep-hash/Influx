import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketWithUser extends Socket {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export const socketAuth = (socket: SocketWithUser, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    socket.user = decoded as any;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};
