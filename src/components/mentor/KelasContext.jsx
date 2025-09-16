import { createContext, useState, useEffect } from "react";
import Api from "../../utils/Api";

export const KelasContext = createContext();

export const KelasProvider = ({ children }) => {
  const [kelasList, setKelasList] = useState([]);
  const [kelasUser, setKelasUser] = useState(null);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await Api.get("/paket-kelas/mentor");
        const data = res.data.data || [];
        setKelasList(data);

        const id = localStorage.getItem("kelas");
        if (id) {
          const aktif = data.find((k) => k.id_paketkelas == id);
          setKelasUser(aktif || data[0]);
        } else {
          setKelasUser(data[0]);
          if (data[0]) localStorage.setItem("kelas", data[0].id_paketkelas);
        }
      } catch (err) {
        console.error("Gagal fetch data kelas:", err);
      }
    };
    fetchKelas();
  }, []);

  const gantiKelas = (kelas) => {
    setKelasUser(kelas);
    localStorage.setItem("kelas", kelas.id_paketkelas);
  };

  return (
    <KelasContext.Provider value={{ kelasList, kelasUser, gantiKelas }}>
      {children}
    </KelasContext.Provider>
  );
};
