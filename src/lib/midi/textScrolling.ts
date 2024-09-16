import { spec } from "./spec";

export const textScrolling = (params: {
  // MIDI outputs
  midiOutputs: MIDIOutput[];
  // Index color, must be between 1 and 127
  color?: number;
  // Text to display
  text?: string;
  // Show loop the message
  loop?: boolean;
  // Speed, max: 7
  speed?: number;
}) => {
  const {
    midiOutputs,
    color = 127,
    text = "unko",
    loop = false,
    speed = 7,
  } = params;
  if (!midiOutputs.length) {
    console.error("No MIDI outputs available");
    return;
  }
  const output = midiOutputs[0];
  const header = spec.sysEx.header;
  const footer = spec.sysEx.footer;
  const command = spec.commands.textScrolling;
  const colorValue = color;
  const loopValue = loop ? 1 : 0;
  const speedValue = speed;
  const textBuffer = new TextEncoder().encode(text);
  const message = new Uint8Array([
    ...header,
    command,
    loopValue,
    speedValue,
    0,
    colorValue,
    ...textBuffer,
    ...footer,
  ]);
  output.send(message);
};
