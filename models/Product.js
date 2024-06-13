const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productID: { type: Number, unique: true },
    name: String,
    title: String,
    price: String,
    image: String,
    category: String,
    year: String,
    rate: Number,
    model: String,
    createdAt: { type: Date, default: Date.now }, // Add a createdAt field
    updatedAt: Date // Add an updatedAt field
});

productSchema.pre('save', async function (next) {
    // Update the updatedAt field whenever the document is modified
    this.updatedAt = new Date();
    
    if (!this.productID) {
        try {
            const lastProduct = await mongoose.model('Product').findOne({}, {}, { sort: { 'productID': -1 } });
            const newProductID = lastProduct ? lastProduct.productID + 1 : 1;
            this.productID = newProductID;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

productSchema.pre('findOneAndDelete', async function(next) {
    try {
        const productId = this.getQuery()._id;
        await mongoose.model('Cart').deleteMany({ product: productId });
        next();
    } catch (error) {
        next(error);
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
