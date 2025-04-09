import { useState } from "react";

export default function NewGroupModal({ onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");

  const handleCreate = () => {
    if (groupName.trim()) {
      onCreate(groupName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-darkGray">Nuevo Grupo de Tareas</h2>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Ej: Febrero 2025"
          className="w-full mb-4 border rounded p-2"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded">Crear</button>
        </div>
      </div>
    </div>
  );
}
