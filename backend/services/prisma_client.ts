import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getDBStatus = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to Prisma");
    return true;
  } catch (error) {
    console.log(error)
    console.error("Error connecting to Prisma");
  }
  return false;
};

const isConnected = async () => {
  await getDBStatus();
}

if (!isConnected()) {
  console.error("Database is not connected");
  process.exit(1);
}

export default prisma;