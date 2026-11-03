// Part B: REST API using Express.js
import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

// In-memory task store (no database)
let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Write Test Cases', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' }
];

const REQUIRED_FIELDS = ['taskName', 'assignedTo', 'status', 'priority'];

const findMissing = (body) =>
  REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');

// GET /tasks - all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - one task
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ message: `Task with id ${req.params.id} not found` });
  }
  res.json(task);
});

// POST /tasks - add a task
app.post('/tasks', (req, res) => {
  const body = req.body || {};
  const missing = findMissing(body);
  if (body.id === undefined || body.id === null || missing.length > 0) {
    const fields = [...(body.id === undefined || body.id === null ? ['id'] : []), ...missing];
    return res.status(400).json({ message: `Missing required fields: ${fields.join(', ')}` });
  }

  const id = Number(body.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'id must be a number' });
  }
  if (tasks.some((t) => t.id === id)) {
    return res.status(409).json({ message: `Task with id ${id} already exists` });
  }

  const task = {
    id,
    taskName: body.taskName,
    assignedTo: body.assignedTo,
    status: body.status,
    priority: body.priority
  };
  tasks.push(task);
  res.status(201).json({ message: 'Task added successfully', task });
});

// PUT /tasks/:id - update a task
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: `Task with id ${req.params.id} not found` });
  }

  const body = req.body || {};
  const missing = findMissing(body);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  tasks[index] = {
    id, // id cannot be changed
    taskName: body.taskName,
    assignedTo: body.assignedTo,
    status: body.status,
    priority: body.priority
  };
  res.json({ message: 'Task updated successfully', task: tasks[index] });
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: `Task with id ${req.params.id} not found` });
  }
  const [deleted] = tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully', task: deleted });
});

// Invalid JSON body / other errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
