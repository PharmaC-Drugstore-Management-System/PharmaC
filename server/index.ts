import express from "express";
import { getUsers, getUserById } from "./controllers/user.controller";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Define the root route
app.get("/", (req, res) => {
  res.send("Welcome to the PharmaC API");
});

// Route to get all users
app.get("/users", getUsers);

// Route to get a user by ID
app.get("/users/:id", getUserById);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
