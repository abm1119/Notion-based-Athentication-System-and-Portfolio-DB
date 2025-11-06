require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const caseStudiesRoutes = require('./routes/caseStudies');
const databaseRoutes = require('./routes/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/case-studies', caseStudiesRoutes);
app.use('/api/database', databaseRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/case-studies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'case-studies.html'));
});

app.get('/completed-projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'completed-projects.html'));
});

app.get('/database-viewer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'database-viewer.html'));
});

app.get('/case-study-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'case-study-detail.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Function to find an available port
const findAvailablePort = (startPort, callback) => {
  const net = require('net');
  const server = net.createServer();
  
  server.listen(startPort, (err) => {
    if (err) {
      // Port is in use, try the next one
      server.close();
      findAvailablePort(startPort + 1, callback);
    } else {
      // Port is available
      const port = server.address().port;
      server.close();
      callback(null, port);
    }
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Port is in use, try the next one
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err);
    }
  });
};

// Start server with error handling
const startServer = (port = PORT) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Press Ctrl+C to stop the server');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${port} is already in use.`);
      console.log('🔍 Looking for an available port...');
      
      findAvailablePort(port + 1, (findErr, availablePort) => {
        if (findErr) {
          console.error('❌ Could not find an available port:', findErr.message);
          process.exit(1);
        } else {
          console.log(`✅ Found available port: ${availablePort}`);
          console.log(`🚀 Starting server on port ${availablePort}...`);
          
          // Recursively call startServer with the new port
          startServer(availablePort);
        }
      });
    } else {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    }
  });

  return server;
};

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
