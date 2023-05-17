import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

const sequelize = new Sequelize(
  DB_NAME as string,
  DB_USER as string,
  DB_PASS as string,
  {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
