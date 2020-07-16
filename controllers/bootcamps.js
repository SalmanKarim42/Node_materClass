const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path')


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {


    res.status(200).json(res.advancedResults)
})

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const bootcamp = await Bootcamp.findById(id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));

    }
    res.status(200).json({
        success: true,
        message: `Show  bootcamp ${id}`,
        data: bootcamp
    })

})


// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    // Add user to req.body 
    req.body.user = req.user.id;


    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp 
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)

    // console.log(req.body)
    res.status(201).json({
        success: true,
        message: "Create new bootcamp",
        data: bootcamp
    })

})


// @desc    Update  bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {


    const { id } = req.params;
    let bootcamp = await Bootcamp.findById(id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
    }

    // Make sure user is bootcamp owner 
    if (bootcamp.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        message: `update bootcamp ${req.params.id}`,
        data: bootcamp
    })

})


// @desc    Delete  bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {


    const { id } = req.params;
    const bootcamp = await Bootcamp.findById(id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
    }
    // Make sure user is bootcamp owner 
    if (bootcamp.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401));
    }

    await bootcamp.remove();
    res.status(200).json({
        success: true,
        message: `bootcamp deleted ${req.params.id} `,
        data: {}
    })
})

// @desc    Get Bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {

    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder 
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude
    const lng = loc[0].longitude


    // Calc radius using radians
    // Divide distance by radius of Earth 
    // Earth Radius = 3,963 in miles  // 6,378 KM

    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat],
                    radius
                ]
            }
        }
    })
    res.status(200).json({
        success: true,
        message: `bootcamps in a radius ${radius} miles `,
        count: bootcamps.length,
        data: bootcamps,
    })
})


// @desc    Upload photo for  bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const bootcamp = await Bootcamp.findById(id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
    }

    // Make sure user is bootcamp owner 
    if (bootcamp.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to upload photo to  this bootcamp`, 401));
    }
    if (!req.files) {
        return next(new ErrorResponse(`Please Upload a file.`, 400));
    }
    const file = req.files.file;

    // Make sure the file is a photo 
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please Upload an image file.`, 400));
    }

    // CHeck file size 
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please Upload an image less than. ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename 
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload.`, 500));

        }
        await Bootcamp.findByIdAndUpdate(id, {
            photo: file.name
        })
        res.status(200).json({
            success: true,
            data: file.name
        })
    })


})
