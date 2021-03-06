const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan')
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload');
const path = require('path')
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

// load env vars
dotenv.config({ path: './config/config.env' })

// connect to database 
connectDB()

//ROute files 
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json())

// Cookie parser 
app.use(cookieParser())

// app.use(logger);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// File Uploading 
app.use(fileUpload());

//  Sanitize data
app.use(mongoSanitize());

//  Set Security Headers 
app.use(helmet());

//  Prevent XSS attacks 
app.use(xss());

//  Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes 
    max: 100
})
app.use(limiter);

//  Prevent http param polution
app.use(hpp());

//  Enable CORS
app.use(cors());

// Set Static folder 
app.use(express.static(path.join(__dirname, 'public')))

// Mount Routers 
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`.yellow.bold);
});

// Handle unhandled promise rejections 
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    // Close server and Exit process
    server.close(_ => process.exit(1))
})