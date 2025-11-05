import { useState } from "react";

export default function NewGroupModal({ onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    const trimmedName = groupName.trim();

    if (!trimmedName) {
      setErrorMessage("Ingresa un nombre válido.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const shouldClose = await onCreate(trimmedName);

      if (shouldClose === false) {
        setErrorMessage("No se pudo crear el grupo. Inténtalo de nuevo.");
        return;
      }

      setGroupName("");
      onClose();
    } catch (err) {
      console.error("Error creando grupo:", err);
      setErrorMessage("No se pudo crear el grupo. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
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
          className="w-full mb-2 border rounded p-2"
        />
        {errorMessage ? (
          <p className="mb-2 text-sm text-red-600">{errorMessage}</p>
        ) : (
          <div className="mb-2" />
        )}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
