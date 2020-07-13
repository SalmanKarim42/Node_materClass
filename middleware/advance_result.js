const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // copying req.query;
    const reqQuery = { ...req.query };

    //Fields to exclude 
    const removeFields = ['select', 'sort', 'limit', 'page'];

    //Loop over removeFIelds and delete them from reqQuery;
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string 
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt,$gte,etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // parsing string to obj
    queryStr = JSON.parse(queryStr)

    // console.log(queryStr)
    // finding by query
    query = model.find(queryStr)

    // select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query.select(fields);
    }


    //SOrt 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination

    const page = parseInt(req.query.page, 10) || 1; // setting page default 1
    const limit = parseInt(req.query.limit, 10) || 10; // setting limit defautl 10
    const startIndex = (page - 1) * limit; // values to skip and starting index 
    const endIndex = page * limit; // end index 
    const total = await model.countDocuments()
    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    // Executing query 
    const results = await query;

    // Pagination result 
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next();
}

module.exports = advancedResults;