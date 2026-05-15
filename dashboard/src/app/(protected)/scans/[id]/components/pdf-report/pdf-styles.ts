import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  background: "#0a0a0a",
  surface: "#171717",
  border: "#262626",
  textPrimary: "#e5e5e5",
  textSecondary: "#a3a3a3",
  textMuted: "#737373",
  emerald: "#10b981",
  emeraldLight: "#064e3b",
  red: "#ef4444",
  redLight: "#450a0a",
  orange: "#f97316",
  orangeLight: "#431407",
  amber: "#eab308",
  amberLight: "#422006",
  blue: "#3b82f6",
  blueLight: "#172554",
  muted: "#737373",
  mutedLight: "#262626",
};

export const SEVERITY_PDF_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  CRITICAL: {
    label: "Critical",
    color: COLORS.red,
    bg: COLORS.redLight,
  },
  HIGH: {
    label: "High",
    color: COLORS.orange,
    bg: COLORS.orangeLight,
  },
  MEDIUM: {
    label: "Medium",
    color: COLORS.amber,
    bg: COLORS.amberLight,
  },
  LOW: {
    label: "Low",
    color: COLORS.blue,
    bg: COLORS.blueLight,
  },
  INFO: {
    label: "Info",
    color: COLORS.muted,
    bg: COLORS.mutedLight,
  },
};

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export const globalStyles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 40,
    paddingVertical: 32,
    fontSize: 10,
    color: COLORS.textPrimary,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  headerMeta: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  textMono: {
    fontFamily: "Courier",
    fontSize: 8,
    color: COLORS.textSecondary,
  },
  textSmall: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  textSecondary: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 1.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
