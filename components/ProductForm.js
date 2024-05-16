/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import SpinnerComponent from "./spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({ 
    _id,  
    title: existingTitle,
    description: existingDescription,
    price: existingPrice,
    images: existingImages,
    category: assignedCategory,
}) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [category, setCategory] = useState(assignedCategory || '');
    const [productProperties, setProductProperties] = useState({});
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState(existingImages || []);
    const [goToProduct, setGoToProduct] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();
    
    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        }).catch(error => {
            console.error("Error fetching categories:", error);
        });
    }, []);

    function goBack() {
        router.push('/products');
    }

    async function saveProduct(ev) {
        ev.preventDefault();
        const data = { title, description, price, images, category };
        try {
            if (_id) {
                await axios.put(`/api/products/${_id}`, data);
            } else {
                await axios.post('/api/products', data);
                setGoToProduct(true);
            }
        } catch (error) {
            console.error("Error saving product:", error);
        }
    }

    if (goToProduct) {
        router.push('/products');
        return null;
    }

    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            try {
                const data = new FormData();
                for (const file of files) {
                    data.append('file', file);
                }
                const res = await axios.post('/api/upload', data);
                setImages(oldImages => [...oldImages, ...res.data.links]);
            } catch (error) {
                console.error("Error uploading images:", error);
            } finally {
                setIsUploading(false);
            }
        }
    }

    function updateImagesOrder(newImages) {
        setImages(newImages.map(item => item));
    }

    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({ _id }) => _id === category);
        if (catInfo) {
            propertiesToFill.push(...catInfo.properties);
            while (catInfo?.parent?._id) {
                const parentCat = categories.find(({ _id }) => _id === catInfo.parent._id);
                if (parentCat) {
                    propertiesToFill.push(...parentCat.properties);
                    catInfo = parentCat;
                } else {
                    break;
                }
            }
        }
    }
    
    function setProductProp(propName, value) {
        setProductProperties(prev => ({
            ...prev,
            [propName]: value
        }));
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
            <label>Category</label>
            <select 
                value={category} 
                onChange={ev => setCategory(ev.target.value)}
            >
                <option value="">Uncategorized</option>
                {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
            {propertiesToFill.map(p => (
                <div className="flex gap-1" key={p.name}>
                    <div>{p.name}</div>
                    <select
                        value={productProperties[p.name] || ''}
                        onChange={ev => setProductProp(p.name, ev.target.value)}
                    >
                        {Array.isArray(p.values) && p.values.map(v => (
    <option key={v} value={v}>{v}</option>
))}

                    </select>
                </div>
            ))}
            <label>Photos</label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable 
                    list={images}
                    className="flex flex-wrap gap-1"
                    setList={updateImagesOrder}
                >
                    {images.map(link => (
                        <div key={link} className="h-24">
                            <img src={link} alt="" className="rounded-lg"/>
                        </div>
                    ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 p-1 flex items-center">
                        <SpinnerComponent />
                    </div>
                )}
                <label className="w-24 h-24 text-center flex items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>
                        Upload
                    </div>
                    <input type="file" className="hidden" onChange={uploadImages} />
                </label>
                {!images.length && (
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
            <button type="submit" className="btn-primary" onClick={goBack}>Save</button>
        </form>
    );
}
