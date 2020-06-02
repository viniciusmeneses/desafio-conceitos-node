const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

const validateRepositoryId = (request, response, next) => {
  const { id } = request.params;
  if (!isUuid(id)) return response.status(400).json({ error: "Invalid repository ID" });
  return next();
};

app.use(express.json());
app.use(cors());
app.use("/repositories/:id", validateRepositoryId);

let repositories = [];

const findRepositoryIndex = id => repositories.findIndex(repository => repository.id === id);
const removeRepositoryFromIndex = index => repositories.filter((_, i) => i !== index);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const newRepository = { id: uuid(), title, url, techs, likes: 0 };

  repositories = [...repositories, newRepository];
  return response.json(newRepository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = findRepositoryIndex(id);

  if (repositoryIndex < 0) return response.sendStatus(404).json({ error: "Repository not found" });

  const updatedRepository = {
    ...repositories[repositoryIndex],
    title,
    url,
    techs,
  };

  repositories = [
    ...removeRepositoryFromIndex(repositoryIndex),
    updatedRepository,
  ];

  return response.json(updatedRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndex(id);

  if (repositoryIndex < 0) return response.sendStatus(404).json({ error: "Repository not found" });

  repositories = removeRepositoryFromIndex(repositoryIndex);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndex(id);

  if (repositoryIndex < 0) return response.sendStatus(404).json({ error: "Repository not found" });

  const repository = repositories[repositoryIndex];
  const updatedRepository = {
    ...repository,
    likes: repository.likes + 1,
  };

  repositories = [
    ...removeRepositoryFromIndex(repositoryIndex),
    updatedRepository,
  ];

  return response.json({ likes: updatedRepository.likes });
});

module.exports = app;
