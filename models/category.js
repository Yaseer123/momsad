import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Assuming the name is required
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    properties: [{
        // Define the structure of properties
        name: String,
        values: [String] // Assuming values is an array of strings
    }]
});

// Export the Category model
export default mongoose.models.Category || mongoose.model('Category', categorySchema);
