import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";


export default function ProductForm({ 
    _id,  
    title:existingtitle,
    description:existingdescription,
    price:existingprice,
    images
    }) {
    const [title, setTitle] = useState(existingtitle || '');
    const [description, setDescription] = useState(existingdescription || '');
    const [price, setPrice] = useState(existingprice || '');
    const [goToProduct, setGoToProduct] = useState(false);
    const router = useRouter(); // Initialize useRouter
    function goBack() {
        router.push('/products');
    }

    async function saveProduct(ev) {
        ev.preventDefault();
        const data = { title, description, price };
        if (_id) {
            // update
            await axios.put('/api/products',{...data,_id});
        }else {
            // create
            await axios.post('/api/products', data);
            setGoToProduct(true);
        }
    }

    // Redirect using Next.js router
    if (goToProduct) {
        router.push('/products');
        return null; // You can return null here or a loading indicator
    } 
    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            
            const res = await axios.post('/api/upload', data);
            console.log(res.data);
            
        }
        console.log(ev);
    }
    
    

    return (
        <form onSubmit={saveProduct}>
            <h1>New Product</h1>
            <label>Product name</label>
            <input
                type="text"
                placeholder="Product name"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
           <label>
    Photos
</label>
<div className="mb-2">
    <label className="w-24 h-24 text-center flex
                        items-center justify-center
                        text-sm gap-1 text-gray-500
                        rounded-lg bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        <div>
            Upload
        </div>
        <input type="file" className="hidden" onChange={uploadImages} />
    </label>
    {(!images && !ProductForm.length) && (
        <div>No photos in this product</div>
    )}
</div>

            

            <label>Description</label>
            <textarea
                placeholder="Description"
                value={description}
                onChange={ev => setDescription(ev.target.value)}
            />

            <label>Price (in USD)</label>
            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={ev => setPrice(ev.target.value)}
            />

            <button type="submit" className="btn-primary"  onClick={goBack}>Save</button>
        </form>
    );
}
