import Obat from "./Obat";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const FolderContent = () => {
  const { folder } = useParams();

  if (folder === "obat") return <Obat />;
  // Bisa tambah else if untuk folder lain...

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {folder.replace(/-/g, " ")}
      </h2>
      <p>
        Ini adalah konten default untuk folder{" "}
        <b>{folder.replace(/-/g, " ")}</b>.
      </p>
    </div>
  );
};

export default Obat;
