const express = require("express")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const app = express()
app.use(express.json())

const FILE_PATH = "./data/users.json"

// Helper functions
const readUsers = () => {
  const data = fs.readFileSync(FILE_PATH)
  return JSON.parse(data)
}

const writeUsers = (users) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2))
}



/**
 * GET /users
 * Optional: search, sort, order
 */
app.get("/users", (req, res) => {
  let users = readUsers()
  const { search, sort, order } = req.query

  // 🔍 Search
  if (search) {
    users = users.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  // 🔃 Sorting
  if (sort) {
    users.sort((a, b) => {
      if (order === "desc") {
        return b[sort].localeCompare(a[sort])
      }
      return a[sort].localeCompare(b[sort])
    })
  }

  res.json(users)
})



/**
 * GET /users/:id
 */
app.get("/users/:id", (req, res) => {
  const users = readUsers()
  const user = users.find(u => u.id === req.params.id)

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  res.json(user)
})


/**
 * POST /users
 */
app.post("/users", (req, res) => {
  const users = readUsers()
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email required" })
  }

  const newUser = {
    id: uuidv4(),
    name,
    email
  }

  users.push(newUser)
  writeUsers(users)

  res.status(201).json(newUser)
})

/**
 * PUT /users/:id
 */
app.put("/users/:id", (req, res) => {
  const users = readUsers()
  const index = users.findIndex(u => u.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ message: "User not found" })
  }

  const { name, email } = req.body

  users[index] = {
    ...users[index],
    name: name || users[index].name,
    email: email || users[index].email
  }

  writeUsers(users)

  res.json(users[index])
})



/**
 * DELETE /users/:id
 */
app.delete("/users/:id", (req, res) => {
  let users = readUsers()
  const filteredUsers = users.filter(u => u.id !== req.params.id)

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ message: "User not found" })
  }

  writeUsers(filteredUsers)

  res.json({ message: "User deleted successfully" })
})



const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
