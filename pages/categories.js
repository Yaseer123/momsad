import Layout from "@/components/layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
    }

    async function saveCategory(ev) {
        ev.preventDefault();
        const data = {
            name,
            parentCategory,
            properties // Assuming you want to save properties along with the category
        };
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setEditedCategory(null);
        } else {
            await axios.post('/api/categories', data);
        }
        setName('');
        setParentCategory('');
        setProperties([]); // Clear properties after saving
        fetchCategories();
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent);
        
        // Assuming you also want to edit properties
        setProperties(category.properties.map(({ name, values }) => ({
            name,
            values: Array.isArray(values) ? values.join(',') : values
        })));
    }
    
    

    function deleteCategory(category) {
        swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            showCancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#d55',
            reverseButtons: true
        }).then(async result => {
            if (result.isConfirmed) {
                const { _id } = category;
                await axios.delete(`/api/categories?_id=${_id}`);
                fetchCategories();
            }
        });
    }

    function addProperty() {
        setProperties(prev => [...prev, { name: '', values: '' }]);
    }

    function handlePropertyNameChange(propertyIndex, newValue) {
        setProperties(prev => {
            const updatedProperties = [...prev];
            updatedProperties[propertyIndex].name = newValue;
            return updatedProperties;
        });
    }

    function handlePropertyValueChange(propertyIndex, newValue) {
        setProperties(prev => {
            const updatedProperties = [...prev];
            updatedProperties[propertyIndex].values = newValue;
            return updatedProperties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties(prev=> {
            return [...prev].filter((p,pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>
                {editedCategory
                    ? `Edit category ${editedCategory.name}`
                    : 'Create new category'}
            </label>

            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input
                        type="text"
                        placeholder={'category name'}
                        onChange={ev => setName(ev.target.value)}
                        value={name}
                    />
                    <select
                        onChange={ev => setParentCategory(ev.target.value)}
                        value={parentCategory}>
                        <option value=''>No parent category</option>
                        {categories.length > 0 && categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button className="btn-default text-sm mb-2"
                        type="button"
                        onClick={addProperty}>
                        Add new property
                    </button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div className="flex gap-1 mb-2" key={index}>
                            <input
                                type="text"
                                className="mb-0"
                                value={property.name}
                                onChange={ev => handlePropertyNameChange(index, ev.target.value)}
                                placeholder="Property name (e.g., color)"
                            />
                            <input
                                type="text"
                                className="mb-0"
                                value={property.values}
                                onChange={ev => handlePropertyValueChange(index, ev.target.value)}
                                placeholder="Values, comma separated"
                            />
                            <button className="btn-default"
                                    onClick={()=>removeProperty(index)}
                                    type="button"
                                    >
                                        Remove
                                    </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName('');
                setParentCategory('');
                setProperties([]);
              }}
              className="btn-default">Cancel</button>
          )}
          <button type="submit"
                  className="btn-primary py-1">
            Save
          </button>
        </div>

            </form>
            {!editedCategory && (
        <table className="basic mt-4">
            <thead>
            <tr>
                <td>Category name</td>
                <td>Parent category</td>
                <td></td>
            </tr>
            </thead>
            <tbody>
            {categories.length > 0 && categories.map(category => (
                <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category?.parent?.name}</td>
                <td>
                    <button
                    onClick={() => editCategory(category)}
                    className="btn-default mr-1"
                    >
                    Edit
                    </button>
                    <button
                    onClick={() => deleteCategory(category)}
                    className="btn-red">Delete</button>
                </td>
                </tr>
            ))}
            </tbody>
            </table>
        )}
            
        </Layout>
    );
}

export default withSwal(({ swal }, ref) => (
    <Categories swal={swal} />
));
