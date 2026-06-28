export function extractLocaleString(value: any, lang: "en" | "hi" | "mr" = "en"): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return value[lang] || value["en"] || Object.values(value)[0] || "";
  }
  return String(value);
}
