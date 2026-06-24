export function FaviconMark({ fontSize }: { fontSize: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1814",
        border: "3px solid #c8973d",
        borderRadius: "18%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: fontSize * 1.15,
          height: fontSize * 1.15,
          borderRadius: "50%",
          border: "2px solid rgba(200, 151, 61, 0.55)",
          color: "#e8b85a",
          fontSize,
          fontWeight: 600,
        }}
      >
        ✦
      </div>
    </div>
  );
}
