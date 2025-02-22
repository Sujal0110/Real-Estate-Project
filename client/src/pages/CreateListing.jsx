import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: "",
        description: "",
        address: "",
        type: "rent",
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    });
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(formData);

    const handleImageSubmit = async () => {
        if (
            files.length === 0 ||
            files.length + formData.imageUrls.length > 6
        ) {
            return setImageUploadError("You can only upload up to 6 images");
        }

        setUploading(true);
        setImageUploadError(false);

        try {
            const uploadPromises = Array.from(files).map((file) =>
                uploadToCloudinary(file)
            );
            const urls = await Promise.all(uploadPromises);
            setFormData((prevData) => ({
                ...prevData,
                imageUrls: [...prevData.imageUrls, ...urls],
            }));
        } catch (err) {
            setImageUploadError("Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const uploadToCloudinary = async (file) => {
        const CLOUDINARY_URL =
            "https://api.cloudinary.com/v1_1/dnadrpuex/image/upload";
        const UPLOAD_PRESET = "mern-esate"; // Set this in your Cloudinary settings

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Upload failed");
        }

        const data = await res.json();
        return data.secure_url; // Cloudinary returns a secure URL
    };

    const handleRemoveImage = (index) => {
        setFormData((prevData) => ({
            ...prevData,
            imageUrls: prevData.imageUrls.filter((_, i) => i !== index),
        }));
    };

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;

        if (id === "sale" || id === "rent") {
            setFormData((prevData) => ({ ...prevData, type: id }));
        } else if (id === "parking" || id === "furnished" || id === "offer") {
            setFormData((prevData) => ({ ...prevData, [id]: checked }));
        } else {
            setFormData((prevData) => ({ ...prevData, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.imageUrls.length < 1)
            return setError("You must upload at least one image");
        if (+formData.regularPrice < +formData.discountPrice)
            return setError("Discount price must be lower than regular price");

        setLoading(true);
        setError(false);

        try {
            const res = await fetch("/api/listing/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            });

            const data = await res.json();
            setLoading(false);

            if (!data.success) {
                setError(data.message);
            } else {
                navigate(`/listing/${data._id}`);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <main className="p-3 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold text-center my-7">
                Create a Listing
            </h1>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Name"
                        className="border p-3 rounded-lg"
                        id="name"
                        maxLength="62"
                        minLength="10"
                        required
                        onChange={handleChange}
                        value={formData.name}
                    />
                    <textarea
                        placeholder="Description"
                        className="border p-3 rounded-lg"
                        id="description"
                        required
                        onChange={handleChange}
                        value={formData.description}
                    />
                    <input
                        type="text"
                        placeholder="Address"
                        className="border p-3 rounded-lg"
                        id="address"
                        required
                        onChange={handleChange}
                        value={formData.address}
                    />

                    {/* Checkbox Inputs */}
                    <div className="flex gap-6 flex-wrap">
                        {["sale", "rent", "parking", "furnished", "offer"].map(
                            (id) => (
                                <div key={id} className="flex gap-2">
                                    <input
                                        type="checkbox"
                                        id={id}
                                        className="w-5"
                                        onChange={handleChange}
                                        checked={formData[id]}
                                    />
                                    <span>
                                        {id.charAt(0).toUpperCase() +
                                            id.slice(1)}
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {/* Image Upload */}
                    <p className="font-semibold">Images:</p>
                    <div className="flex gap-4">
                        <input
                            onChange={(e) => setFiles(e.target.files)}
                            className="p-3 border rounded w-full"
                            type="file"
                            id="images"
                            accept="image/*"
                            multiple
                        />
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={handleImageSubmit}
                            className="p-3 text-green-700 border rounded">
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                    <p className="text-red-700 text-sm">
                        {imageUploadError && imageUploadError}
                    </p>

                    {/* Display Uploaded Images */}
                    {formData.imageUrls.map((url, index) => (
                        <div
                            key={url}
                            className="flex justify-between p-3 border items-center">
                            <img
                                src={url}
                                alt="listing"
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-3 text-red-700 rounded-lg">
                                Delete
                            </button>
                        </div>
                    ))}

                    <button
                        disabled={loading || uploading}
                        className="p-3 bg-slate-700 text-white rounded-lg">
                        {loading ? "Creating..." : "Create listing"}
                    </button>
                    {error && <p className="text-red-700 text-sm">{error}</p>}
                </div>
            </form>
        </main>
    );
}
