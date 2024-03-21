import { Request, Response, NextFunction } from 'express';
import prisma from '../services/prisma_client';

export const checkDatabaseConnection = () => {
  return async (req: Request, res: Response, next: NextFunction) => {

    const getDBStatus = async () => {
      // create tables if they don't exist
      


      try {
        await prisma.$connect();
        console.log("Connected to Prisma");
        return true;
      } catch (error) {
        console.error(error);
      }
      return false;
    };


    const isConnected = await getDBStatus();
    if (isConnected) {
      next();
    } else {
      res.status(500).json({ error: 'Database is not connected' });
    }
  };
};