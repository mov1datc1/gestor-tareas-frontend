import Header from "../components/Header";

export default function Home() {
  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-darkGray mb-2">Bienvenidos</h2>
        <p className="text-gray-600">Selecciona una opción del menú para comenzar.</p>
      </div>
    </div>
  );
}
