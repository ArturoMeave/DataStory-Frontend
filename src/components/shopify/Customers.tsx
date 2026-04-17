import { useState, useEffect } from "react";
import { Search, Star, Mail, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { BASE_URL } from "../../services/api.service";

export function Customers() {
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch(`${BASE_URL}/api/auth/shopify/data`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((datos) => {
          setCustomers(datos.customerList || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [token]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
        ⏳ Cargando base de datos de clientes...
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
            placeholder="Buscar por nombre o email..."
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
              <th style={headerStyle}>Cliente</th>
              <th style={headerStyle}>Contacto</th>
              <th style={headerStyle}>Pedidos</th>
              <th style={headerStyle}>Valor Total</th>
              <th style={headerStyle}>Segmento</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={cellStyle}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "var(--color-bg-surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Mail size={14} /> {c.email}
                      {c.verified && (
                        <span
                          title="Email Verificado"
                          style={{ display: "flex", cursor: "help" }}
                        >
                          <ShieldCheck size={14} color="#22c55e" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={cellStyle}>{c.ordersCount} compras</td>
                  <td
                    style={{
                      ...cellStyle,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    ${c.totalSpent.toFixed(2)}
                  </td>
                  <td style={cellStyle}>
                    {c.totalSpent > 100 ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#eab308",
                          background: "rgba(234,179,8,0.1)",
                        }}
                      >
                        <Star size={12} /> Cliente VIP
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-text-secondary)",
                          background: "var(--color-bg-surface)",
                        }}
                      >
                        Estándar
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  No se encontraron clientes.
                </td>
              </tr>
            )}
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
