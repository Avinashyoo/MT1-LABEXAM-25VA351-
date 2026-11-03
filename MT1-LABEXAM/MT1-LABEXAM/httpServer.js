// Part A: HTTP server using only built-in modules (no Express)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

// In-memory task store (no database)
const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress' },
  { id: 3, taskName: 'Write Test Cases', assignedTo: 'Amit Kumar', status: 'Completed' }
];

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method } = req;
  const url = req.url.split('?')[0];

  // GET routes
  if (method === 'GET' && url === '/') {
    return sendHtml(res, 200, '<h1>Welcome to the Employee Task Management Application</h1>');
  }

  if (method === 'GET' && url === '/tasks') {
    return sendJson(res, 200, tasks);
  }

  if (method === 'GET' && url === '/about') {
    return sendJson(res, 200, {
      application: 'Employee Task Management',
      description: 'Demonstrates the Node.js HTTP module, routing, HTTP methods and FS module.',
      version: '1.0.0',
      technology: ['Node.js', 'HTTP Module', 'FS Module']
    });
  }

  // Static file serving using the FS module
  if (method === 'GET' && url === '/home') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    return fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error('File read error:', err.message);
        return sendHtml(res, 500, '<h1>500 - Unable to read the requested file</h1>');
      }
      sendHtml(res, 200, content);
    });
  }

  // POST /add-task
  if (method === 'POST' && url === '/add-task') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let task;
      try {
        task = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON in request body' });
      }

      const required = ['id', 'taskName', 'assignedTo', 'status'];
      const missing = required.filter(
        (field) => task[field] === undefined || task[field] === null || task[field] === ''
      );
      if (missing.length > 0) {
        return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
      }

      if (tasks.some((t) => t.id === task.id)) {
        return sendJson(res, 409, { error: `Task with id ${task.id} already exists` });
      }

      const newTask = {
        id: task.id,
        taskName: task.taskName,
        assignedTo: task.assignedTo,
        status: task.status
      };
      tasks.push(newTask);
      sendJson(res, 201, { message: 'Task added successfully', task: newTask });
    });
    req.on('error', () => sendJson(res, 400, { error: 'Bad request' }));
    return;
  }

  // Known path but wrong method
  if (['/', '/tasks', '/about', '/home', '/add-task'].includes(url)) {
    return sendJson(res, 405, { error: `Method ${method} not allowed on ${url}` });
  }

  // Invalid route
  sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
