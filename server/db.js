const { Client } = require('pg');
const bcrypt = require('bcrypt');
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_store_db');

async function createTables() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id UUID PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS Product (
        id UUID PRIMARY KEY,
        name VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS Favorite (
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES Product(id) NOT NULL,
        user_id UUID REFERENCES "User"(id) NOT NULL,
        CONSTRAINT user_product_unique UNIQUE (user_id, product_id)
      );
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

async function createProduct(name) {
  try {
    const result = await client.query('INSERT INTO Product (id, name) VALUES (uuid_generate_v4(), $1) RETURNING *', [name]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating product:', error);
  }
}

async function createUser(username, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query('INSERT INTO "User" (id, username, password) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [username, hashedPassword]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function fetchUsers() {
  try {
    const result = await client.query('SELECT * FROM "User"');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

async function fetchProducts() {
  try {
    const result = await client.query('SELECT * FROM Product');
    return result.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

async function createFavorite(product_id, user_id) {
  try {
    const result = await client.query('INSERT INTO Favorite (id, product_id, user_id) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [product_id, user_id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating favorite:', error);
  }
}

async function fetchFavorites(user_id) {
  try {
    const result = await client.query('SELECT * FROM Favorite WHERE user_id = $1', [user_id]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching favorites:', error);
  }
}

async function destroyFavorite(id) {
  try {
    await client.query('DELETE FROM Favorite WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting favorite:', error);
  }
}

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
};