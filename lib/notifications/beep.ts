// 장애가 났을 때 나는 소리입니다.
//
// ★ 소리 파일을 두지 않습니다.
//   인터넷이 없는 내부망에 파일을 하나 더 옮겨야 하고, 브라우저마다 못 읽는
//   형식이 있습니다. 소리를 **그 자리에서 만들어** 냅니다. 파일이 필요 없습니다.

const HZ = 880; // 라(A5). 사무실 소음 위로 잘 뚫고 올라옵니다.
const LENGTH_SEC = 0.18;
const GAP_SEC = 0.12;
// 두 번 울립니다. 한 번이면 다른 프로그램 소리로 흘려듣습니다.
const TIMES = 2;
const VOLUME = 0.15;

let context: AudioContext | null = null;

/**
 * 소리를 낼 준비를 합니다. **사람이 화면을 누를 때** 부르세요.
 *
 * ★ 브라우저는 사람이 한 번 누르기 전에는 소리를 내지 못하게 막습니다.
 *   (페이지가 멋대로 소리를 내는 것을 막는 장치입니다)
 *   장애가 난 다음에 만들면 그 소리는 그냥 묻힙니다. 미리 열어 둡니다.
 */
export function unlockBeep(): void {
  try {
    context ??= new AudioContext();

    // 열어 뒀어도 브라우저가 도로 재워 둘 수 있습니다. 누를 때마다 깨웁니다.
    if (context.state === "suspended") void context.resume();
  } catch {
    // 소리를 못 내는 환경입니다. 목록과 화면 표시는 그대로 됩니다.
  }
}

/** 소리를 낼 수 있는 상태인지입니다. 아니면 화면에 안내를 띄웁니다. */
export function canBeep(): boolean {
  return context !== null && context.state === "running";
}

export function beep(): void {
  const ctx = context;

  if (ctx === null || ctx.state !== "running") return;

  for (let index = 0; index < TIMES; index += 1) {
    const at = ctx.currentTime + index * (LENGTH_SEC + GAP_SEC);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 네모파(square)라야 "삑" 하고 들립니다. 사인파는 부드러워 묻힙니다.
    osc.type = "square";
    osc.frequency.value = HZ;

    // 갑자기 켜고 끄면 "톡" 하는 잡음이 함께 납니다. 아주 짧게 올리고 내립니다.
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(VOLUME, at + 0.01);
    gain.gain.setValueAtTime(VOLUME, at + LENGTH_SEC - 0.01);
    gain.gain.linearRampToValueAtTime(0, at + LENGTH_SEC);

    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + LENGTH_SEC);
  }
}
