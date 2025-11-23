import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { config } from "../config/config";

export default function StatsPage() {
    const { code } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [code]);

    const loadStats = async () => {
        try {
            const res = await axios.get(`${config.server}/links/${code}`);
            setData(res.data);
        } catch (err) {
            setData(null);
        }
        setLoading(false);
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen text-lg">
                Loading stats...
            </div>
        );

    if (!data)
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-3">
                    Code Not Found
                </h2>
                <Link to="/" className="text-blue-600 underline">
                    Go Back
                </Link>
            </div>
        );

    const lastAccess =
        data.clickTimestamps.length > 0
            ? new Date(
                data.clickTimestamps[data.clickTimestamps.length - 1]
            ).toLocaleString()
            : "Never accessed";

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Link Stats</h1>
                <Link to="/" className="text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Card */}
            <div className="bg-white shadow-xl rounded-xl p-6 border">
                {/* Short Code */}
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Code:  <a
                            href={`${config.server}/${data.shortUrl}`}
                            target="_blank"
                            className="text-blue-500 text-lg font-mono underline hover:text-blue-700 break-all"
                        >
                            {data.shortUrl}
                        </a>
                    </h2>
                </div>
                {/* Long URL */}
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Original URL:</h2>
                    <a
                        href={data.longUrl}
                        target="_blank"
                        className="text-blue-600 underline break-all hover:text-blue-800"
                    >
                        {data.longUrl}
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-100 p-4 rounded-lg shadow">
                        <p className="text-gray-500 text-sm">Total Clicks</p>
                        <p className="text-2xl font-bold">{data.clickCount}</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg shadow">
                        <p className="text-gray-500 text-sm">Last Access</p>
                        <p className="font-medium">{lastAccess}</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg shadow">
                        <p className="text-gray-500 text-sm">Created At</p>
                        <p className="font-medium">
                            {new Date(data.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* History */}
                <h2 className="text-lg font-semibold mt-8">Access History</h2>

                {data.clickTimestamps.length === 0 ? (
                    <p className="text-gray-500 mt-2">No clicks yet.</p>
                ) : (
                    <div className="mt-3 max-h-56 overflow-y-auto border rounded p-3 bg-gray-50">
                        <ul className="space-y-2">
                            {data.clickTimestamps.map((ts, i) => (
                                <li
                                    key={i}
                                    className="p-2 bg-white shadow border rounded text-sm"
                                >
                                    {new Date(ts).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
