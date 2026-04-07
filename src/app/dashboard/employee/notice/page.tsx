"use client";

import { useEffect, useState } from "react";

export default function EmployeeNotice() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/notice/all")
            .then((res) => res.json())
            .then(setData);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Notices</h1>

            {data.map((n) => (
                <div key={n._id} className="border p-4 mb-3 rounded">
                    <h2 className="font-bold">{n.title}</h2>
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
}