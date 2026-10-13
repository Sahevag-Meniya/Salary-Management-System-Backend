require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected successfully to MySQL via Sequelize.');
  } catch (error) {
    console.warn('⚠️  MySQL connection warning:', error.message);
    console.warn('👉 Ensure MySQL is running, the database exists, and .env credentials are correct.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
