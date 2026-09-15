export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard !== undefined && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
    }
  }

  try {
    const area = document.createElement("textarea");

    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";

    document.body.appendChild(area);
    area.select();

    const copied = document.execCommand("copy");

    area.remove();

    return copied;
  } catch {
    return false;
  }
}
