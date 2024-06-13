const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');


// Import Schema
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Favorite = require('./models/Favorite');
// const Banner = require('./models/Banners');
const bannerRoutes = require('./routes/bannersRoutes');
const products = require('./routes/productRoutes')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const mongoURI = 'mongodb+srv://salin:salinrupp@cluster0.umnblbr.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/banners', bannerRoutes);
app.use('/products', products)


app.post('/add-to-cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Check if productId and userId are provided
    if (!productId || !userId) {
      return res.status(400).json({ error: 'productId and userId are required' });
    }

    let cartItem = await Cart.findOne({ user: userId, product: productId });

    if (cartItem) {
      // If the product is already in the cart, increase its quantity
      cartItem.quantity += quantity;
    } else {
      // If the product is not in the cart, add it with the specified quantity
      cartItem = new Cart({ user: userId, product: productId, quantity });
    }

    // Save the cart item
    await cartItem.save();

    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/cart/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch cart items based on userId
    const cartItems = await Cart.find({ user: userId });

    // Extract product IDs from cart items
    const productIds = cartItems.map(cartItem => cartItem.product);

    // Fetch details of each product using the product IDs
    const products = await Product.find({ _id: { $in: productIds } });

    // Combine cart items with product details
    const cartWithDetails = cartItems.map(cartItem => {
      const productDetail = products.find(product => product._id.equals(cartItem.product));
      return {
        cartItem,
        productDetail,
      };
    });

    // Send the combined data as a JSON response
    res.status(200).json(cartWithDetails);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/cart/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete all cart items for the specified user
    await Cart.deleteMany({ user: userId });

    res.status(200).json({ message: 'Cart cleared successfully!' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add this API endpoint in your Express server
app.put('/cart/:userId/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.params.userId;
    const { quantity } = req.body;

    console.log('Updating quantity for product:', productId, 'in user cart:', userId);

    // Use findOneAndUpdate to update the quantity in the cart array
    await Cart.findOneAndUpdate(
      { user: userId, product: productId },
      { $set: { quantity } },
      { new: true }
    );

    // Respond with the updated cart
    res.status(200).json({ message: 'Quantity updated successfully!' });
  } catch (error) {
    console.error('Error updating quantity for product in the cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/cart/:userId/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.params.userId;
    console.log('Removing product:', productId, 'from user cart:', userId);

    // Use findOneAndUpdate with $pull to remove the product from the cart array
    await Cart.deleteOne({ user: userId, product: productId });

    // Respond with the updated cart
    res.status(200).json({ message: 'Cart cleared successfully!' });
  } catch (error) {
    console.error('Error removing product from the cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderItems = req.body.orderItems;

    // Iterate over each item in the orderItems array
    for (const item of orderItems) {
      // Calculate the total price for the current item
      const totalPrice = item.price * item.quantity;

      // Create a new order document for the current item
      const order = new Order({
        user: userId,
        product: item.product,
        quantity: item.quantity,
        totalPrice: totalPrice,
      });

      // Save the order to the database
      await order.save();
    }

    // Optionally, you can also remove the ordered items from the user's cart here

    res.status(201).json({ message: 'Order placed successfully!' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Get product by user ID
app.get('/orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming user information is stored in req.user
    const orders = await Order.find({ user: userId }).populate('product');
    // const orders = await Order.find({ user: userId }).populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Assuming you have a route like '/orderedItems' for fetching all ordered items
app.get('/orderedItems', async (req, res) => {
  try {
    // Fetch all orders from the Order model and populate the 'user' and 'product' fields
    const orderedItems = await Order.find().populate('user product');

    // Send the ordered items as a response
    res.status(200).json(orderedItems);
  } catch (error) {
    console.error('Error fetching ordered items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Order status
app.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status, adminComments } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status, adminComments } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Notify user about order status
    // You can use a messaging service, email, or other notification method here
    
    return res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/add/favorites', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if productId and userId are provided
    if (!productId || !userId) {
      return res.status(400).json({ error: 'productId and userId are required' });
    }

    // Check if the product is already in favorites
    let favoriteItem = await Favorite.findOne({ user: userId, product: productId });

    if (!favoriteItem) {
      // If the product is not in favorites, add it
      favoriteItem = new Favorite({ user: userId, product: productId });
    } else {
      // If the product is already in favorites, handle it as needed (e.g., show a message)
      return res.status(200).json({ message: 'Product already in favorites' });
    }

    // Save the favorite item
    await favoriteItem.save();

    res.status(201).json({ message: 'Item added to favorites successfully' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/favorites/:userId', async (req, res) => {
  try {
    const user = req.params.userId;

    // Fetch the user's favorite data based on userId
    const favorites = await Favorite.find({ user }).populate('product'); // Assuming 'productId' is the field you reference in the Favorite schema

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete('/favorites/:userId/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.params.userId;
    console.log('Removing product:', productId, 'from user favorite:', userId);

    // Use findOneAndUpdate with $pull to remove the product from the cart array
    const findAddcart = await Favorite.deleteOne({ user: userId, product: productId });

    console.log(findAddcart);
    // Respond with the updated cart
    res.status(200).json({ message: 'Cart cleared successfully!' });
  } catch (error) {
    console.error('Error removing product from the cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for handling registration
app.post('/register', async (req, res) => {
  // Access request body using req.body
  const { fullName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the new user
    const savedUser = await newUser.save();

    // Send the userId in the response
    res.json({ message: 'Registration successful!', userId: savedUser._id });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Include userRole in the response
    const token = generateToken(user);
    res.json({ token, userId: user._id, userRole: user.role });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/users', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Return the list of users
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find user by userID
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/role/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function generateToken(user) {
  // Example:
  const token = jwt.sign({ userId: user._id, email: user.email }, 'secret', { expiresIn: '1h' });
  return token;
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing Token' });
  }

  jwt.verify(token.replace('Bearer ', ''), 'secret', (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }

    console.log('Decoded Token:', decoded);

    req.user = decoded;
    next();
  });
};
// Add this API endpoint in your Express server
app.get('/products/byType/:typeName', async (req, res) => {
  try {
    const typeName = req.params.typeName;

    // Create a query to find products by type name
    const query = { type: typeName };

    const products = await Product.find(query);

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by type name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/logout', (req, res) => {
  // Handle logout logic here
  res.status(200).send('Logout successful');
});
app.get('/protected-route', verifyToken, (req, res) => {
  const user = req.user;
  res.json({ message: 'Protected route accessed', user });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
