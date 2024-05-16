import { mongooseConnect } from "@/lib/mongoose";
import Product from "@/models/product";

export default async function handle(req, res) {
    const { method } = req;

    await mongooseConnect();

    try {
        switch (method) {
            case 'GET':
                if (req.query?.id) {
                    const product = await Product.findOne({ _id: req.query.id });
                    res.status(200).json(product);
                } else {
                    const products = await Product.find();
                    res.status(200).json(products);
                }
                break;
            case 'POST':
                const { title, description, price, images, category } = req.body;
                const productDoc = await Product.create({
                    title, description, price, images, category
                });
                res.status(201).json(productDoc);
                break;
            case 'PUT':
                const { _id: productId, ...updatedFields } = req.body;
                await Product.findByIdAndUpdate(productId, updatedFields);
                res.status(200).json(true);
                break;
            case 'DELETE':
                if (req.query.id) {
                    await Product.deleteOne({ _id: req.query.id });
                    res.status(200).json(true);
                } else {
                    res.status(400).json({ error: 'Product ID is required for deletion' });
                }
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
