const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// 🧠 In-memory datastore
let users = {}; // key: id, value: user object
let currentId = 1;

// 🔧 Custom request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️ [${new Date().toISOString()}] ${req.method} ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `⬅️ [${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration} ms)`
    );
  });

  next();
});

// 🧩 POST /users - Add a new user
app.post("/users", (req, res) => {
  console.log("📩 Incoming request body:", req.body);

  const { name, email } = req.body;

  if (!name || !email) {
    console.warn("⚠️ Validation failed: name or email missing.");
    return res.status(400).json({ message: "Name and email are required." });
  }

  const id = currentId++;
  users[id] = { id, name, email };

  console.log(`✅ User added successfully:`, users[id]);
  res.status(201).json({ message: "User added successfully.", user: users[id] });
});

// 🧩 GET /users - Get all users
app.get("/users", (req, res) => {
  console.log("📋 Fetching all users...");

  const userList = Object.values(users);

  if (userList.length === 0) {
    console.warn("⚠️ No users found in datastore.");
    return res.status(404).json({ message: "No users found." });
  }

  console.log(`✅ Returning ${userList.length} user(s).`);
  res.json({ count: userList.length, users: userList });
});

// 🧩 GET /users/:id - Get user by ID
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🔍 Fetching user with ID: ${id}`);

  const user = users[id];
  if (!user) {
    console.warn(`⚠️ User with ID ${id} not found.`);
    return res.status(404).json({ message: "User not found." });
  }

  console.log(`✅ User found:`, user);
  res.json(user);
});

// 🧩 DELETE /users/:id - Delete user by ID
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🗑️ Request to delete user with ID: ${id}`);

  if (!users[id]) {
    console.warn(`⚠️ User with ID ${id} not found for deletion.`);
    return res.status(404).json({ message: "User not found." });
  }

  delete users[id];
  console.log(`✅ User with ID ${id} deleted successfully.`);
  res.json({ message: "User deleted successfully." });
});

// 🧩 Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unexpected error occurred:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
