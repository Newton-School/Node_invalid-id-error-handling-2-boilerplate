const Product = require('../models/Product');
const AppError = require("../utils/AppError");

const handleAsyncErrors = (asyncFn) => {
    return (req, res, next) => {
      asyncFn(req, res, next).catch((err) => {
        res.status(500).json({
          status: 'Error',
          message: 'Internal Server Error',
          error: err.message,
        });
      });
    };
  };

/*
Make the necessary changes to the controller to return error 400 using the AppError error handling function, when an invalid Id is requested.
Status Code: 400
{
  error: "Invalid ID"
}

Status Code: 404
{
  error: "Product Not Found"
}
*/


const getProductByID = handleAsyncErrors(async (req, res) => {
  const id = req.params.id;
  //Write your code here
});

const searchProducts = handleAsyncErrors(async (req, res) => {
    const { page = 1, limit = 10, search, category, sort, minPrice, maxPrice } = req.query;
    const query = {};
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
        query.category = category;
    }
    if (minPrice && maxPrice) {
        query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
        query.price = { $gte: minPrice };
    } else if (maxPrice) {
        query.price = { $lte: maxPrice };
    }
    const sortOrder = sort === 'asc' ? 'price' : '-price';

    const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort(sortOrder);
    const count = await Product.countDocuments(query);

    res.status(200).json({
        status: 'success',
        data: {
            count,
            products,
        },
    });
});

module.exports = { searchProducts, getProductByID };
