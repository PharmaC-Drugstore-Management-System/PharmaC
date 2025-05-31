// index.ts

import express from "express";
import userRoutes from "./routes/user.route";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Define the root route
app.get("/", (req, res) => {
  res.send("Welcome to the PharmaC API");
});

// Use the user routes
app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
