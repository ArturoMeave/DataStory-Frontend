import { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageX,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { BASE_URL } from "../../services/api.service";

export function Orders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
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
          setOrders(datos.orderList || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [token]);

  // Buscador por número de pedido o nombre del cliente
  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()),
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
        ⏳ Cargando historial de pedidos...
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
            placeholder="Buscar pedido o cliente..."
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
              <th style={headerStyle}>Pedido</th>
              <th style={headerStyle}>Fecha</th>
              <th style={headerStyle}>Cliente</th>
              <th style={headerStyle}>Pago</th>
              <th style={headerStyle}>Envío</th>
              <th style={headerStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={cellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      <Receipt size={16} color="var(--color-text-muted)" />
                      {o.orderNumber}
                    </div>
                  </td>
                  <td style={cellStyle}>
                    {new Date(o.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={cellStyle}>{o.customer}</td>

                  {/* Lógica de colores para el Pago */}
                  <td style={cellStyle}>
                    {o.financialStatus === "paid" ? (
                      <span
                        style={badgeStyle("#22c55e", "rgba(34,197,94,0.1)")}
                      >
                        <CheckCircle2 size={12} /> Pagado
                      </span>
                    ) : (
                      <span
                        style={badgeStyle("#eab308", "rgba(234,179,8,0.1)")}
                      >
                        <Clock size={12} /> Pendiente
                      </span>
                    )}
                  </td>

                  {/* Lógica de colores para el Envío */}
                  <td style={cellStyle}>
                    {o.fulfillmentStatus === "fulfilled" ? (
                      <span
                        style={badgeStyle("#3b82f6", "rgba(59,130,246,0.1)")}
                      >
                        <Truck size={12} /> Enviado
                      </span>
                    ) : (
                      <span
                        style={badgeStyle(
                          "var(--color-text-secondary)",
                          "var(--color-bg-surface)",
                        )}
                      >
                        <PackageX size={12} /> Por enviar
                      </span>
                    )}
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    ${o.total.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  No se encontraron pedidos.
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
const badgeStyle = (color: string, bg: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  color: color,
  background: bg,
});
