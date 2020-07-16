const fs = require('fs')
const mongoose = require('mongoose')

const colors = require('colors')
const dotenv = require('dotenv')


/// Load env vars 
dotenv.config({ path: './config/config.env' });

//Load Models ;
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course');
const User = require('./models/User');


// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    // userFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
})

// Read Json files 

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf8'))

// Import into DB 
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);

        console.log(`Data Imported...`.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}
// Import into DB 
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();


        console.log(`Data Destroyed...`.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}