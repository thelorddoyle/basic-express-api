import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import sequelize from "./sequelize";
import User from "./models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const { APP_SECRET_KEY, NODE_ENV } = process.env;
if (!APP_SECRET_KEY) {
  console.error("Missing APP_SECRET_KEY");
  process.exit(1);
}

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRouter = Router();
const userRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!username || !password) {
      return res
        .status(404)
        .json({ message: "Must provide username and password" });
    }

    if (!user) {
      return res.status(404).json({ message: "No user matches that username" });
    }

    // debugging a login issue
    console.log("user: ", user);

    console.log("password in req: ", password);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword from req: ", hashedPassword);
    console.log("password in db: ", user?.password);

    const passwordMatch = await bcrypt.compare(password, user?.password);

    console.log("do the passwords match: ", passwordMatch); // Add this line

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, APP_SECRET_KEY);
    res.json({ message: "ok", token });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (req, res, next) => {
  try {
    const users = await User.findAll();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No Users found" });
    }
    res.json(users);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRouter);
app.use("/users", userRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// Database
sequelize
  .authenticate()
  .then(() => console.log("Database connected."))
  .catch((err) => console.error("Unable to connect to the database:", err));

sequelize
  .sync({ force: NODE_ENV === "development" })
  .then(() => {
    console.log("Database synchronized!");
    app.listen(3000, () => console.log("Server is listening on port 3000"));
  })
  .catch((err) => console.error(err));
