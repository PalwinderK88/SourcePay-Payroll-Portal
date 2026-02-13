import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Documents() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/api/documents/');
        setDocuments(res.data);
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Documents</h1>
      <ul>
        {documents.map(d => (
          <li key={d.id}>
            {d.doc_type} - <a href={d.file_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}