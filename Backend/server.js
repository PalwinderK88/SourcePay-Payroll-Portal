const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');
const path = require('path');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/authroutes');
const payslipsRouter = require('./routes/payslips');
const documentsRouter = require('./routes/documents');
const agenciesRouter = require('./Routes/agencies');
const octapayRouter = require('./Routes/octapay');
const notificationsRouter = require('./Routes/notifications');
const faqRouter = require('./Routes/faq');
const documentReminderService = require('./services/documentReminderService');
const NotificationService = require('./services/notificationService');
const timesheetsRouter = require('./Routes/timesheets');

app.use(cors());
app.use(express.json());

// Initialize notification service
const notificationService = new NotificationService(io);

// Make io and notificationService accessible to routes
app.set('io', io);
app.set('notificationService', notificationService);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register all routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/payslips', payslipsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/agencies', agenciesRouter);
app.use('/api/octapay', octapayRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api', faqRouter);
app.use('/api/timesheets', timesheetsRouter);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join user-specific room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their notification room`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start document reminder service with notification service
documentReminderService.notificationService = notificationService;
documentReminderService.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  documentReminderService.stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

const PORT = process.env.PORT || 5003;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🔌 Socket.IO ready for connections');
  console.log('📅 Document reminder service active');
  console.log('🔔 Notification service initialized');
  console.log('💬 FAQ/Chatbot service ready');
  console.log('📋 Timesheet bulk upload ready');
});
