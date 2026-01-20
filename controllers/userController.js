const { pool } = require('../config/database');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users ORDER BY created_at DESC');
    connection.release();
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get single user
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, company, role = 'User', phone, website } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, company, role, phone, website) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, password, company, role, phone, website]
      );
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: result.insertId,
          name,
          email,
          company,
          role,
          status: 'Active'
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, role, status, phone, website } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'UPDATE users SET name = ?, email = ?, company = ?, role = ?, status = ?, phone = ?, website = ? WHERE id = ?',
        [name, email, company, role, status, phone, website, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN role = 'Admin' THEN 1 ELSE 0 END) as admin_count
      FROM users
    `);
    
    connection.release();
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
};

// Seed demo data
exports.seedDemoData = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Clear existing users
    await connection.query('TRUNCATE TABLE users');
    
    const demoUsers = [
      { name: 'John Doe', email: 'john@otobook.com', password: 'hashed_pwd_1', company: 'OTobook Inc', role: 'Admin', status: 'Active', phone: '+1234567890', website: 'https://otobook.com' },
      { name: 'Jane Smith', email: 'jane@otobook.com', password: 'hashed_pwd_2', company: 'OTobook Inc', role: 'Editor', status: 'Active', phone: '+1234567891', website: '' },
      { name: 'Bob Johnson', email: 'bob@otobook.com', password: 'hashed_pwd_3', company: 'Tech Corp', role: 'User', status: 'Active', phone: '+1234567892', website: 'https://techcorp.com' },
      { name: 'Alice Williams', email: 'alice@otobook.com', password: 'hashed_pwd_4', company: 'Innovation Labs', role: 'Editor', status: 'Inactive', phone: '+1234567893', website: '' },
      { name: 'Charlie Brown', email: 'charlie@otobook.com', password: 'hashed_pwd_5', company: 'Digital Solutions', role: 'User', status: 'Active', phone: '+1234567894', website: 'https://digitalsolutions.com' }
    ];
    
    for (const user of demoUsers) {
      await connection.query(
        'INSERT INTO users (name, email, password, company, role, status, phone, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.company, user.role, user.status, user.phone, user.website]
      );
    }
    
    connection.release();
    
    res.json({
      success: true,
      message: `${demoUsers.length} demo users seeded successfully`
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed demo data'
    });
  }
};
