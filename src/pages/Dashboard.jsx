import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">Statistik 1</div>
          <div className="bg-white p-6 rounded-lg shadow">Statistik 2</div>
          <div className="bg-white p-6 rounded-lg shadow">Statistik 3</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
