import { dictionary } from "./dictionary";

export const ledLightning = (params: {
  // MIDI outputs
  midiOutputs: MIDIOutput[];
  // Lightning Type, 0: Static, 1: Flashing, 2: Pulsing, 3: RGB
  type?: number;
  // LED index, must be between 11 and 99
  index?: number;
  // Index color, must be between 1 and 127
  color?: number;
  // Start index color
  startColor?: number;
  // End index color
  endColor?: number;
  // RGB color
  red?: number;
  green?: number;
  blue?: number;
}) => {
  const { midiOutputs, type = 0, index = 36, color = 127 } = params;
  if (!midiOutputs.length) {
    console.error("No MIDI outputs available");
    return;
  }
  const output = midiOutputs[0];
  const header = dictionary.sysEx.header;
  const footer = dictionary.sysEx.footer;
  const command = dictionary.commands.ledLightning;
  const typeValue = type;
  if (typeValue === 0 || typeValue === 2) {
    const colorValue = color;
    const indexValue = index;
    const message = new Uint8Array([
      ...header,
      command,
      typeValue,
      indexValue,
      colorValue,
      ...footer,
    ]);
    output.send(message);
    return;
  }
};
