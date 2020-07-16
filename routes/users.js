const express = require('express');
const router = express.Router();
const { getUser, getUsers, createUser, updateUser, deleteUser } = require('../controllers/users');

//Include other resource routers
const advancedResults = require('../middleware/advance_result');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect)
router.use(authorize('admin'))

router
    .route('/')
    .get(
        advancedResults(User),
        getUsers
    )
    .post(createUser)
router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)
module.exports = router