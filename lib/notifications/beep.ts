
const HZ = 880;
const LENGTH_SEC = 0.18;
const GAP_SEC = 0.12;
const TIMES = 2;
const VOLUME = 0.15;

let context: AudioContext | null = null;

export function unlockBeep(): void {
  try {
    context ??= new AudioContext();

    if (context.state === "suspended") void context.resume();
  } catch {
  }
}

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

    osc.type = "square";
    osc.frequency.value = HZ;

    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(VOLUME, at + 0.01);
    gain.gain.setValueAtTime(VOLUME, at + LENGTH_SEC - 0.01);
    gain.gain.linearRampToValueAtTime(0, at + LENGTH_SEC);

    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + LENGTH_SEC);
  }
}
