export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="https://movidatci.com/wp-content/uploads/2022/02/cropped-movida_azul_150x150-192x192.png"
          alt="Movida Logo"
          className="h-10 w-10 rounded-full"
        />
        <h1 className="text-lg font-bold text-darkGray tracking-wide">
          TRANSFORMANDO NEGOCIOS
        </h1>
      </div>
    </header>
  );
}
