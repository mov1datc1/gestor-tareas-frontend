import { useState, useEffect } from "react";

export default function EditTaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task);

  useEffect(() => {
    setForm(task);
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-darkGray">Editar Tarea</h2>

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Título"
          className="w-full mb-2 border rounded p-2"
        />
        <input
          type="text"
          name="owner"
          value={form.owner}
          onChange={handleChange}
          placeholder="Responsable"
          className="w-full mb-2 border rounded p-2"
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full mb-2 border rounded p-2"
        />
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notas"
          className="w-full mb-2 border rounded p-2"
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded">Guardar</button>
        </div>
      </div>
    </div>
  );
}
