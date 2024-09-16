import { spec } from "./spec";

export const selectLayout = (params: {
  // MIDI outputs
  midiOutputs: MIDIOutput[];
  // Layout index
  // 0: Session
  // 1: Note
  // 4: Custom mode 1 (Drum Rack)
  // 5: Custom mode 2 (Keys)
  // 6: Custom mode 3 (Lighting mode with Drum Rack layout)
  // 7: Custom mode 4 (Lighting mode with Session layout)
  // 13: DAW Faders
  // 127: Programmer mode
  layout?: number;
}) => {
  const { midiOutputs, layout = 0 } = params;
  if (!midiOutputs.length) {
    console.error("No MIDI outputs available");
    return;
  }
  const output = midiOutputs[0];
  const header = spec.sysEx.header;
  const footer = spec.sysEx.footer;
  const command = spec.commands.selectLayout;
  const layoutValue = layout;
  const message = new Uint8Array([...header, command, layoutValue, ...footer]);
  output.send(message);
};
