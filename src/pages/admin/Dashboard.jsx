//import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const Dashboard = () => {
  return (
    <div className="flex w-full min-h-[100dvh] bg-custom-bg">
      {/* <Sidebar /> */}
      <div className="flex-1">
        <Header />
        <main></main>
      </div>
    </div>
  );
};

export default Dashboard;
