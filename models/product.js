import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category' }
});

export default models.Product || model('Product', productSchema);
