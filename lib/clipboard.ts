// 글을 클립보드에 넣습니다.
//
// ★ navigator.clipboard 만 쓰면 **내부망에서 동작하지 않습니다.**
//   브라우저는 이 기능을 HTTPS(또는 localhost)에서만 내줍니다.
//   내부망은 대개 http:// 로 씁니다. 그 경우 navigator.clipboard 자체가
//   아예 없어서, 눌러도 조용히 아무 일도 일어나지 않습니다.
//
//   그래서 옛 방식(execCommand)을 함께 둡니다. 오래된 기능이지만
//   http 에서도 듭니다. 여기서는 그게 유일하게 되는 길입니다.
export async function copyText(text: string): Promise<boolean> {
  // HTTPS 이거나 localhost 면 이쪽이 깔끔합니다.
  if (navigator.clipboard !== undefined && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한을 막아 둔 경우입니다. 아래 옛 방식으로 한 번 더 해 봅니다.
    }
  }

  try {
    const area = document.createElement("textarea");

    area.value = text;
    // 화면 밖에 두되 숨기지는 않습니다. display:none 이면 선택이 안 됩니다.
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
