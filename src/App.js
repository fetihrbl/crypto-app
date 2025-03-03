import "./App.css";
import Axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");

  // API'den veri çekme
  useEffect(() => {
    let cancelRequest = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Axios.get(
          "https://api.coinstats.app/public/v1/coins?skip=0&limit=100&currency=USD"
        );
        if (!cancelRequest) {
          setCrypto(response.data.coins);
        }
      } catch (err) {
        if (!cancelRequest) {
          setError("Failed to fetch data. Please try again.");
        }
      } finally {
        if (!cancelRequest) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelRequest = true;
    };
  }, []);

  // Arama için debounce mekanizması
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Verileri filtreleme ve sıralama
  const sortedCrypto = [...crypto]
    .filter((val) =>
      val.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

  return (
    <div className="App">
      <h1>All Cryptocurrencies</h1>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            {["rank", "name", "symbol", "marketCap", "price", "availableSupply", "volume"].map((key) => (
              <th
                key={key}
                onClick={() => {
                  setSortBy(key);
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                style={{ cursor: "pointer" }}
              >
                {key.toUpperCase()} {sortBy === key ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedCrypto.map((val) => (
            <tr key={val.id}>
              <td>{val.rank}</td>
              <td className="logo">
                <a href={val.websiteUrl}>
                  <img src={val.icon} alt="logo" width="30px" />
                </a>
                <p>{val.name}</p>
              </td>
              <td>{val.symbol}</td>
              <td>${val.marketCap.toLocaleString()}</td>
              <td>${val.price.toFixed(2)}</td>
              <td>{val.availableSupply.toLocaleString()}</td>
              <td>{parseFloat(val.volume).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
