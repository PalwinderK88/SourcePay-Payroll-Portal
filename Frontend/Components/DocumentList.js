export default function DocumentList({ documents }) {
    if (!documents || documents.length === 0) {
      return <p>No documents available.</p>;
    }
  
    return (
      <table className="min-w-full border">
        <thead>
          <tr className="border-b bg-gray-200">
            <th className="p-2 text-left">Document Type</th>
            <th className="p-2 text-left">Download</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b">
              <td className="p-2">{doc.doc_type}</td>
              <td className="p-2">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }