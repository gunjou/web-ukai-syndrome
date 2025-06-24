const Header = () => {
  return (
    <header className="bg-white p-4 shadow flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-700">Dashboard</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Hai, Admin</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;
