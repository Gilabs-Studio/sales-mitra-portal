export function formatDateOnly(value?: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2) {
    return "-";
  }
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}
