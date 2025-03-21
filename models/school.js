const db = require('../config/database');

class School {
  static async initialize() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    await db.query(createTableSQL);
    
    // Check if table is empty
    const [rows] = await db.query('SELECT COUNT(*) as count FROM schools');
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO schools (name, address, latitude, longitude) VALUES
        ('Central High School', '123 Main St', 51.5074, -0.1278),
        ('North Elementary', '456 Park Ave', 51.5214, -0.1419),
        ('West Middle School', '789 Oak Rd', 51.4975, -0.1357),
        ('South Academy', '321 Pine St', 51.4937, -0.1207)
      `);
    }
  }

  static async create({ name, address, latitude, longitude }) {

    name = name.trim();
    address = address.trim();
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates');
    }

    const [result] = await db.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    return result;
  }

  static async getAll() {
    try {
      const [schools] = await db.query('SELECT * FROM schools ORDER BY id DESC');
      if (!schools) return [];
      
      return schools.map(school => ({
        ...school,
        latitude: parseFloat(school.latitude),
        longitude: parseFloat(school.longitude)
      }));
    } catch (err) {
      console.error('Database query error:', err);
      throw new Error(`Failed to fetch schools: ${err.message}`);
    }
  }
}

// Initialize table when module is loaded
School.initialize().catch(console.error);

module.exports = School;
