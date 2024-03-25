const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { createTables, createProduct, createUser, fetchUsers, fetchProducts, createFavorite, fetchFavorites, destroyFavorite } = require('./db');

const app = express();
app.use(bodyParser.json());

// Create tables on startup
createTables();

// Routes
app.get('/api/users', async (req, res) => {
  const users = await fetchUsers();
  res.json(users);
});

app.get('/api/products', async (req, res) => {
  const products = await fetchProducts();
  res.json(products);
});

app.get('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  const favorites = await fetchFavorites(id);
  res.json(favorites);
});

app.post('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  const { product_id } = req.body;
  const favorite = await createFavorite(product_id, id);
  res.status(201).json(favorite);
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  const { id } = req.params;
  await destroyFavorite(id);
  res.sendStatus(204);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});