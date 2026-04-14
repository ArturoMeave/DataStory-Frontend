import { useState, useEffect } from "react";
import { Package, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export function Products() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch("http://localhost:3001/api/auth/shopify/data", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((datos) => {
          setProducts(datos.productList || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [token]);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading)
    return (
      <div
        style={{
          color: "var(--color-text-muted)",
          padding: 40,
          textAlign: "center",
        }}
      >
        ⏳ Cargando inventario...
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", width: "300px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 40px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: "var(--color-bg-card)",
          borderRadius: 16,
          border: "1px solid var(--color-border)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              <th style={headerStyle}>Producto</th>
              <th style={headerStyle}>Estado</th>
              <th style={headerStyle}>Inventario</th>
              <th style={headerStyle}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <td style={cellStyle}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          background: "var(--color-bg-surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Package size={18} color="var(--color-text-muted)" />
                      </div>
                    )}
                    <span
                      style={{
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {p.title}
                    </span>
                  </div>
                </td>
                <td style={cellStyle}>
                  {p.status === "active" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#22c55e",
                        fontSize: 13,
                      }}
                    >
                      <CheckCircle2 size={14} /> Activo
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--color-text-muted)",
                        fontSize: 13,
                      }}
                    >
                      Borrador
                    </div>
                  )}
                </td>
                <td style={cellStyle}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        color:
                          p.inventory <= 5
                            ? "var(--color-danger)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      {p.inventory} unidades
                    </span>
                    {p.inventory <= 5 && (
                      <AlertTriangle size={14} color="var(--color-danger)" />
                    )}
                  </div>
                </td>
                <td
                  style={{
                    ...cellStyle,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  ${parseFloat(p.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const headerStyle = {
  padding: "16px 24px",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase" as const,
  letterSpacing: 1,
};
const cellStyle = {
  padding: "16px 24px",
  fontSize: 14,
  color: "var(--color-text-secondary)",
};
