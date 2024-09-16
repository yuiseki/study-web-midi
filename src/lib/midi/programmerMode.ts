import { spec } from "./spec";

export const programmerMode = (params: {
  // MIDI outputs
  midiOutputs: MIDIOutput[];
  // Programmer mode, 0: Off, 1: On
  mode?: number;
}) => {
  const { midiOutputs, mode = 0 } = params;
  if (!midiOutputs.length) {
    console.error("No MIDI outputs available");
    return;
  }
  const output = midiOutputs[0];
  const header = spec.sysEx.header;
  const footer = spec.sysEx.footer;
  const command = spec.commands.programmer;
  const modeValue = mode;
  const message = new Uint8Array([...header, command, modeValue, ...footer]);
  output.send(message);
};
