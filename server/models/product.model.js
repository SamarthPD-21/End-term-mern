import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    productId: {
        type: Number,
        required: false,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;