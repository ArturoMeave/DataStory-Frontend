import { Link } from "react-router-dom";
import {
  BarChart2,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Shield,
  Zap,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Sube tu CSV",
    description:
      "Arrastra tu archivo y tus datos se procesan al instante en tu navegador. Sin servidores intermedios, sin esperas.",
  },
  {
    icon: TrendingUp,
    title: "Gráficos y predicciones",
    description:
      "Visualiza ingresos, gastos y tendencias en segundos. Con proyección automática de los próximos 3 meses.",
  },
  {
    icon: Sparkles,
    title: "Análisis con IA",
    description:
      "Groq Llama analiza tus números y genera un resumen ejecutivo, tareas accionables y responde tus preguntas.",
  },
  {
    icon: Shield,
    title: "Detector de anomalías",
    description:
      "Algoritmo estadístico que detecta picos inusuales en tus datos y te avisa antes de que sean un problema.",
  },
  {
    icon: Zap,
    title: "Conecta Stripe",
    description:
      "Importa tus ventas de los últimos 90 días directamente desde Stripe. Sin necesidad de exportar nada.",
  },
  {
    icon: MessageSquare,
    title: "Chat con tus datos",
    description:
      'Pregúntale a la IA sobre tu negocio en lenguaje natural. "¿Cuál fue mi mejor mes?" y obtén respuesta inmediata.',
  },
];

const stats = [
  { value: "< 5s", label: "Para analizar un CSV" },
  { value: "3", label: "Meses de predicción" },
  { value: "2σ", label: "Umbral de anomalías" },
  { value: "100%", label: "Procesado en tu navegador" },
];

export function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-accent-dim)",
                border: "1px solid var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart2 size={14} color="var(--color-accent)" />
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              DataStory
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="primary" size="sm">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "100px 24px 80px",
          textAlign: "center",
        }}
      >
        {/* Glow de fondo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 400,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, rgba(124,106,255,0.10) 0%, transparent 70%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 14px",
              borderRadius: 20,
              background: "var(--color-accent-dim)",
              border: "1px solid rgba(124,106,255,0.3)",
              marginBottom: 28,
            }}
          >
            <Sparkles size={12} color="var(--color-accent)" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-accent)",
              }}
            >
              Análisis financiero con IA para pequeñas empresas
            </span>
          </div>

          {/* Título */}
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 60px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--color-text-primary)",
              maxWidth: 800,
              margin: "0 auto 24px",
            }}
          >
            Convierte tu Excel en{" "}
            <span style={{ color: "var(--color-accent)" }}>
              decisiones inteligentes
            </span>
          </h1>

          {/* Descripción */}
          <p
            style={{
              fontSize: 18,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto 40px",
            }}
          >
            Sube un CSV aburrido. Obtén gráficos interactivos, predicciones y un
            análisis completo generado por IA en menos de 5 segundos.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link to="/auth">
              <Button variant="primary" size="lg">
                Empezar gratis
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                Ver demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: "var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
          }}
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: "var(--color-bg-card)",
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                {value}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              marginBottom: 12,
            }}
          >
            Todo lo que necesitas
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-secondary)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            De un CSV a un panel de control completo con IA en un solo paso.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-accent-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={18} color="var(--color-accent)" />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        <div
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "64px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow interior */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 600,
              height: 300,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, rgba(124,106,255,0.08) 0%, transparent 70%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                marginBottom: 12,
              }}
            >
              Empieza a analizar tus datos hoy
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-text-secondary)",
                marginBottom: 32,
                maxWidth: 400,
                margin: "0 auto 32px",
              }}
            >
              Gratis, sin tarjeta de crédito y sin instalación.
            </p>
            <Link to="/auth">
              <Button variant="primary" size="lg">
                Crear cuenta gratis
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          © 2025 DataStory — Construido con React, Node.js, Prisma y Groq
        </p>
      </footer>
    </div>
  );
}
