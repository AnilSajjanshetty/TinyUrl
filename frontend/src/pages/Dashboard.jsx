import { useEffect, useState } from "react";
import axios from "axios";
import { FiCopy } from "react-icons/fi";
import Swal from "sweetalert2";
import { config } from "../config/config";

const API = `${config.server}/links`;

export default function Dashboard() {
    const [longUrl, setLongUrl] = useState("");
    const [code, setCode] = useState("");
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");
    const [codeError, setCodeError] = useState("");

    // Fetch all links
    const loadLinks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setLinks(res.data || []);
        } catch (err) {
            setError("Failed to load links");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadLinks();
    }, []);

    // Handle custom code input change
    const handleCodeChange = (e) => {
        const value = e.target.value;
        setCode(value);

        if (value && !/^[A-Za-z0-9]{6,8}$/.test(value)) {
            setCodeError("Custom code must be 6-8 alphanumeric characters (A-Z, a-z, 0-9).");
        } else {
            setCodeError("");
        }
    };

    // Create link
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!longUrl) return setError("Long URL is required");
        if (code && !/^[A-Za-z0-9]{6,8}$/.test(code.trim())) {
            return setError("Custom code must be 6-8 alphanumeric characters.");
        }

        setSubmitLoading(true);

        try {
            await axios.post(API, { longUrl, code });
            setLongUrl("");
            setCode("");
            setCodeError("");
            Swal.fire("Success", "Short link created!", "success");
            loadLinks();
        } catch (err) {
            if (err.response?.status === 409) {
                setError("Code already exists.");
            } else {
                setError("Failed to create link.");
            }
        }

        setSubmitLoading(false);
    };

    // Delete link with confirmation
    const handleDelete = async (linkCode) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (confirm.isConfirmed) {
            await axios.delete(`${API}/${linkCode}`);
            Swal.fire("Deleted!", "Your link has been deleted.", "success");
            loadLinks();
        }
    };

    // Copy to clipboard
    const handleCopy = (url) => {
        navigator.clipboard.writeText(url);
        Swal.fire("Copied!", "Link copied to clipboard.", "success");
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">URL Shortener Dashboard</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 space-y-3">
                <input
                    type="text"
                    placeholder="Enter long URL..."
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />

                <input
                    type="text"
                    placeholder="Optional custom code (6-8 alphanumeric)"
                    value={code}
                    onChange={handleCodeChange}
                    className={`border p-2 w-full rounded focus:outline-none focus:ring-2 ${codeError ? "focus:ring-red-400 border-red-500" : "focus:ring-purple-400"
                        }`}
                />
                {codeError && <p className="text-red-500 text-sm">{codeError}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    disabled={submitLoading || codeError}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                >
                    {submitLoading ? "Creating..." : "Create Short Link"}
                </button>
            </form>

            {/* Loading */}
            {loading && <p>Loading links...</p>}

            {/* Empty */}
            {!loading && links.length === 0 && <p>No links created yet.</p>}

            {/* Desktop Table */}
            <div className="hidden md:block">
                <table className="min-w-full border">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border">Code</th>
                            <th className="p-2 border">Long URL</th>
                            <th className="p-2 border">Total Clicks</th>
                            <th className="p-2 border">Last Clicked</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((l) => (
                            <tr key={l.code} className="border hover:bg-gray-50">
                                <td className="p-2 flex items-center space-x-2">
                                    <a
                                        href={`${config.server}/${l.shortUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-500 font-mono underline hover:text-blue-700 break-all"
                                    >
                                        {l.shortUrl}
                                    </a>
                                    <span
                                        onClick={() => handleCopy(`${config.server}/${l.shortUrl}`)}
                                        className="text-gray-500 hover:text-gray-800 cursor-pointer"
                                        title="Copy URL"
                                    >
                                        <FiCopy size={18} />
                                    </span>
                                </td>
                                <td className="p-2 border break-all">
                                    <a
                                        href={l.longUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        {l.longUrl}
                                    </a>
                                </td>
                                <td className="p-2 border">{l.clickCount}</td>
                                <td className="p-2 border">
                                    {l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "-"}
                                </td>
                                <td className="p-2 border flex space-x-2">
                                    <a
                                        href={`/code/${l.shortUrl}`}
                                        className="flex-1 text-center bg-blue-500 text-white py-1 rounded"
                                    >
                                        Stats
                                    </a>
                                    <span
                                        onClick={() => handleDelete(l.shortUrl)}
                                        className="flex-1 text-center bg-red-500 text-white py-1 rounded cursor-pointer"
                                    >
                                        Delete
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {links.map((l) => (
                    <div key={l.code} className="bg-white p-4 rounded shadow space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold text-gray-700">Code: </span>
                                <a
                                    href={`${config.server}/${l.shortUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 underline hover:text-blue-700 break-all"
                                >
                                    {l.shortUrl}
                                </a>
                            </div>
                            <span
                                onClick={() => handleCopy(`${config.server}/${l.shortUrl}`)}
                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                            >
                                <FiCopy size={18} />
                            </span>
                        </div>

                        <div>
                            <span className="font-semibold text-gray-700">Long URL: </span>
                            <a
                                href={l.longUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline hover:text-blue-800 break-all"
                            >
                                {l.longUrl}
                            </a>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Total Clicks: {l.clickCount}</span>
                            <span>Last: {l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "-"}</span>
                        </div>

                        <div className="flex space-x-2">
                            <a
                                href={`/code/${l.shortUrl}`}
                                className="flex-1 text-center bg-blue-500 text-white py-1 rounded"
                            >
                                Stats
                            </a>
                            <span
                                onClick={() => handleDelete(l.shortUrl)}
                                className="flex-1 text-center bg-red-500 text-white py-1 rounded cursor-pointer"
                            >
                                Delete
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
