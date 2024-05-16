import { mongooseConnect } from "@/lib/mongoose";
import Category from "@/models/category";

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();

    try {
        switch (method) {
            case 'GET':
                const categories = await Category.find().populate('parent');
                res.status(200).json(categories);
                break;
            case 'POST':
                const { name, parentCategory, properties } = req.body;
                const categoryDoc = await Category.create({
                    name,
                    parent: parentCategory, // No need for || undefined here
                    properties: properties.map(p => ({
                        name: p.name,
                        values: p.values.split(','),
                    })),
                });
                res.status(201).json(categoryDoc);
                break;
            case 'PUT':
                const { _id, name: newName, parentCategory: newParentCategory, properties: newProperties } = req.body;
                const updatedCategoryDoc = await Category.findByIdAndUpdate(_id, {
                    name: newName,
                    parent: newParentCategory,
                    properties: newProperties.map(p => ({
                        name: p.name,
                        values: p.values.split(','),
                    })),
                }, { new: true }); // Return the updated document
                res.status(200).json(updatedCategoryDoc);
                break;
            case 'DELETE':
                const { _id: deleteId } = req.query;
                await Category.findByIdAndDelete(deleteId);
                res.status(200).json({ message: 'Category deleted successfully' });
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
