export default function StatusBadge({ status }) {
  const color = {
    pendiente: "bg-red-100 text-red-800",
    "en curso": "bg-yellow-100 text-yellow-800",
    finalizado: "bg-green-100 text-green-800",
    "on hold": "bg-purple-100 text-purple-800"
  }[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}>
      {status}
    </span>
  );
}
