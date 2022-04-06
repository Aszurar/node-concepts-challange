const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(400).json({ error: "User not found" });
  }

  request.user = user;
  return next();
}

function checkIfUserAlreadyExists(request, response, next) {
  const { username } = request.body;
  const user = users.find((user) => user.username === username);
  if (user) {
    return response.status(400).json({ error: "Todo dosen't exist" });
  }
  return next();
}

function checkIfTodoAlreadyExists(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "User not found" });
  }

  return next();
}

app.post("/users", checkIfUserAlreadyExists, (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkIfTodoAlreadyExists,
  (request, response) => {
    const { title, deadline } = request.body;
    const { id } = request.params;
    const { user } = request;

    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    // user.todos[todoIndex].title = title;
    // user.todos[todoIndex].deadline = new Date(deadline);

    // const todo = user.todos.find((todo) => todo.id === todo.id);

    const todoList = user.todos.map((todo) =>
      todo.id === id
        ? { ...todo, title: title, deadline: new Date(deadline) }
        : todo
    );

    user.todos = todoList;

    // todo.title = title;
    // todo.deadline = new Date(deadline);

    // user.todos[todoIndex] = todo;

    response.status(200).json(user.todos[todoIndex]);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkIfTodoAlreadyExists,
  (request, response) => {
    // Complete aqui
    const { id } = request.params;
    const { user } = request;

    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    user.todos[todoIndex].done = true;

    response.status(200).json(user.todos[todoIndex]);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkIfTodoAlreadyExists,
  (request, response) => {
    // Complete aqui
    const { id } = request.params;
    const { user } = request;

    const todoIndex = user.todos.findIndex((todo) => todo.id === id);
    user.todos.splice(todoIndex, 1);

    response.status(204).json(user.todos[todoIndex]);
  }
);

module.exports = app;
