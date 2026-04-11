/**
 * Example of AIPageGenerator integration in the admin panel
 * This is a template you can copy into your pages page
 */

"use client";

import { useState, useEffect } from "react";
import AIPageGenerator from "@/components/admin/AIPageGenerator";

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export default function AdminPagesExample() {
  const [pages, setPages] = useState<Page[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load pages
  useEffect(() => {
    const loadPages = async () => {
      try {
        const res = await fetch("/api/pages");
        const data = await res.json();
        setPages(data);
      } catch (error) {
        console.error("Error loading pages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);

  const handlePageGenerated = async (pageId: string) => {
    // Reload pages
    const res = await fetch("/api/pages");
    const data = await res.json();
    setPages(data);
    setShowAIGenerator(false);

    // Redirect to edit the page
    window.location.href = `/admin/pages/${pageId}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">📄 Pages</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAIGenerator(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            🤖 Generate with AI
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            ➕ New Page
          </button>
        </div>
      </div>

      {/* Pages list */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pages found. Create a new one or generate with AI!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">URL</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{page.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      /{page.slug}
                    </td>
                    <td className="px-4 py-3">
                      {page.isPublished ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Published
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIPageGenerator
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}