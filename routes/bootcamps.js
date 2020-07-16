const express = require('express');
const router = express.Router();
const { getBootcamp, getBootcamps, createBootcamp, getBootcampsInRadius, updateBootcamp, deleteBootcamp, bootcampPhotoUpload } = require('../controllers/bootcamps')

//Include other resource routers
const courseRouter = require('./courses');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advance_result');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);


router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);


module.exports = router;

