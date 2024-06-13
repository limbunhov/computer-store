// Endpoint to get all unique categories from products
// Endpoint to get products by model

// // Create a banner (POST)
// app.post('/banners', async (req, res) => {
//   const { title, image, description } = req.body;
//   try {
//     const newBanner = new Banner({ title, image, description });
//     await newBanner.save();
//     res.status(201).json({ message: 'Banner created successfully', banner: newBanner });
//   } catch (error) {
//     console.error('Error creating banner:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Get all banners (GET)
// app.get('/banners', async (req, res) => {
//   try {
//     const banners = await Banner.find();
//     res.json(banners);
//   } catch (error) {
//     console.error('Error fetching banners:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Get a single banner by ID (GET)
// app.get('/banners/:bannerId', async (req, res) => {
//   const { bannerId } = req.params;
//   try {
//     const banner = await Banner.findById(bannerId);
//     if (!banner) {
//       return res.status(404).json({ error: 'Banner not found' });
//     }
//     res.json(banner);
//   } catch (error) {
//     console.error('Error fetching banner:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Update a banner (PUT)
// app.put('/banners/:bannerId', async (req, res) => {
//   const { bannerId } = req.params;
//   const { title, image, description } = req.body;
//   try {
//     const updatedBanner = await Banner.findByIdAndUpdate(
//       bannerId,
//       { title, image, description },
//       { new: true }
//     );
//     if (!updatedBanner) {
//       return res.status(404).json({ error: 'Banner not found' });
//     }
//     res.json({ message: 'Banner updated successfully', banner: updatedBanner });
//   } catch (error) {
//     console.error('Error updating banner:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Delete a banner (DELETE)
// app.delete('/banners/:bannerId', async (req, res) => {
//   const { bannerId } = req.params;
//   try {
//     const deletedBanner = await Banner.findByIdAndDelete(bannerId);
//     if (!deletedBanner) {
//       return res.status(404).json({ error: 'Banner not found' });
//     }
//     res.json({ message: 'Banner deleted successfully', banner: deletedBanner });
//   } catch (error) {
//     console.error('Error deleting banner:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });




// app.get('/products/byModel/:model', async (req, res) => {
//   try {
//     const model = req.params.model;

//     // Query the database for products with the specified model
//     const products = await Product.find({ model: model });

//     // Return the products as a JSON response
//     res.json(products);
//   } catch (error) {
//     // Handle errors if any occur
//     console.error('Error fetching products by model:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// // Endpoint to get products by category
// app.get('/products/byCategory/:category', async (req, res) => {
//   try {
//     const category = req.params.category;

//     // Query the database for products with the specified category
//     const products = await Product.find({ category: category });

//     // Return the products as a JSON response
//     res.json(products);
//   } catch (error) {
//     // Handle errors if any occur
//     console.error('Error fetching products by category:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });




// app.post('/products', async (req, res) => {
//   // Access request body using req.body
//   const { name, title, price, image, category, year,rate,model} = req.body;
//   try {
//     const newProduct = new Product({
//       name: name,
//       title:title, 
//       price: price, 
//       image: image, 
//       category: category, 
//       year: year,
//       rate:rate,
//       model:model
//     });
//     await newProduct.save();
//     res.json({ message: 'Product added successful!' });
//   } catch (error) {
//     console.error('Error saving product:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.get('/products', async (req, res) => {
//   try {
//     let query = {
//       $or: [
//         { 'name': new RegExp(req.query.search, 'i') },
        
//       ],
//     }

//     let sort = {};
//     if (req.query.sort) {
//       // Set the sort field based on the value of req.query.sort
//       sort[req.query.sort] = 1; // You can also use -1 for descending order
//     }

//     const products = await Product.find(query).sort(sort);

//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// // Define a route to fetch a product by its ID
// app.get('/products/:productId', async (req, res) => {
//   try {
//     // Extract the productId from the URL parameters
//     const productId = req.params.productId;

//     // Use Mongoose findById() to find the product by its ID
//     const product = await Product.findById(productId);

//     // If product is not found, return a 404 Not Found response
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     // If product is found, return it in the response
//     res.json(product);
//   } catch (error) {
//     // Handle errors
//     console.error('Error fetching product by ID:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// // Example route for updating a product
// app.put('/products/:productId', async (req, res) => {
//   const productID = req.params.productId; // Fix: use params, not body
//   const updatedProductData = req.body;

//   try {
//     // Validate if productId is a valid ObjectId before attempting to update
//     if (!mongoose.Types.ObjectId.isValid(productID)) {
//       return res.status(400).json({ message: 'Invalid product ID' });
//     }

//     // Use Mongoose to update the product by ID
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productID,
//       { $set: updatedProductData },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     return res.json({ message: 'Product updated successfully', product: updatedProduct });
//   } catch (error) {
//     console.error('Error updating product:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Example route for deleting a product
// app.delete('/products/:productId', async (req, res) => {
//   const { productId } = req.params;

//   try {
//     const deletedProduct = await Product.findOneAndDelete({ _id: productId });

//     if (!deletedProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     return res.json({ message: 'Product deleted successfully', product: deletedProduct });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// });

