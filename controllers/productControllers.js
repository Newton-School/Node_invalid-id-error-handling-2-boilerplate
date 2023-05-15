const Product = require('../models/Product');

const handleAsyncErrors = (asyncFn) => {
  return (req, res, next) => {
    asyncFn(req, res, next).catch((err) => {
      if (err.name === 'CastError') {
        if (err.kind === 'ObjectId') {
          return res.status(404).json({
            status: 'Error',
            message: 'Invalid ID',
          });
        }
      }

      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        // Handling not found errors
        return res.status(404).json({
          status: 'Error',
          message: 'Resource not found',
        });
      }

      // Handling other errors
      res.status(500).json({
        status: 'Error',
        message: 'Internal Server Error',
        error: err.message,
      });
    });
  };
};

/*
Write a error handler to handle to invalid ID errors.
If the ID is invalid, return a 400 status code with the following JSON response:
{
  status: 'Error',
  message: 'Invalid ID'
}
*/


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

const getProductByID = handleAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      status: 'Error',
      message: 'Product Not Found',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});


module.exports = { searchProducts, getProductByID };
