const db = require('../config/database');

class School {
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

module.exports = School;
