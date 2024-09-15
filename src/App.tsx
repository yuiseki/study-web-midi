/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
const dictionary = {
  sysEx: {
    header: [240, 0, 32, 41, 2, 12],
    footer: [247],
  },
  commands: {
    selectLayout: 0,
    ledLightning: 3,
    textScrolling: 7,
    ledBrightness: 8,
    programmer: 14,
    daw: 16,
    dawClear: 18,
    sessionColor: 20,
    ledSleep: 9,
  },
};

function App() {
  const callOnce = useRef(false);
  const [lastEvent, setLastEvent] = useState<Uint8Array | undefined>(undefined);
  const [midiAccess, setMIDIAccess] = useState<MIDIAccess | undefined>(
    undefined
  );
  const [midiInputs, setMIDIInputs] = useState<MIDIInput[]>([]);
  const [midiOutputs, setMIDIOutputs] = useState<MIDIOutput[]>([]);

  useEffect(() => {
    if (!callOnce.current) {
      console.log("This will only be called once");
      callOnce.current = true;

      const onMIDISuccess = (newMIDI: MIDIAccess) => {
        console.log("onMIDISuccess");
        const midi = newMIDI;
        setMIDIAccess(midi);

        const inputs: MIDIInput[] = [];
        const inputIter = midi.inputs.values();
        for (
          let input = inputIter.next();
          !input.done;
          input = inputIter.next()
        ) {
          inputs.push(input.value);
        }
        setMIDIInputs(inputs);

        const outputs: MIDIOutput[] = [];
        const outputIter = midi.outputs.values();
        for (
          let output = outputIter.next();
          !output.done;
          output = outputIter.next()
        ) {
          outputs.push(output.value);
        }
        setMIDIOutputs(outputs);
      };

      const onMIDIFailure = (msg: any) => {
        console.error("onMIDIFailure", msg);
        setMIDIAccess(undefined);
      };

      navigator
        .requestMIDIAccess({
          sysex: true,
        })
        .then(onMIDISuccess, onMIDIFailure);
    }
  }, []);

  // Listen to MIDI messages
  useEffect(() => {
    if (!midiInputs.length) {
      return;
    }

    const onMIDIMessage = (event: MIDIMessageEvent) => {
      console.log("onMIDIEvent", event.data);
      if (!event.data) {
        return;
      }
      // event.data[2] === 0 means note is off
      if (event.data[2] === 0) {
        setLastEvent(undefined);
      } else {
        setLastEvent(event.data);
      }
    };

    for (let i = 0; i < midiInputs.length; i++) {
      midiInputs[i].onmidimessage = onMIDIMessage;
    }
  }, [midiInputs]);

  const textScrolling = useCallback(
    (params: {
      // Index color, must be between 1 and 127
      color?: number;
      // Text to display
      text?: string;
      // Show loop the message
      loop?: boolean;
      // Speed, max: 7
      speed?: number;
    }) => {
      if (!midiOutputs.length) {
        console.error("No MIDI outputs available");
        return;
      }
      const { color = 127, text = "unko", loop = false, speed = 7 } = params;
      const output = midiOutputs[0];
      const header = dictionary.sysEx.header;
      const footer = dictionary.sysEx.footer;
      const command = dictionary.commands.textScrolling;
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
    },
    [midiOutputs]
  );

  const ledLightning = useCallback(
    (params: {
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
      if (!midiOutputs.length) {
        console.error("No MIDI outputs available");
        return;
      }
      const { type = 0, index = 36, color = 127 } = params;
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
    },
    [midiOutputs]
  );

  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          backgroundColor: lastEvent
            ? `rgb(${lastEvent[0]}, ${lastEvent[1]}, ${lastEvent[2]})`
            : "white",
        }}
      >
        <div>
          {!midiAccess && (
            <div>
              <p>No MIDI access</p>
            </div>
          )}
          <button
            onClick={() =>
              textScrolling({
                text: "unko",
                loop: false,
                speed: 3,
              })
            }
          >
            unko
          </button>
          <button
            onClick={() =>
              ledLightning({
                index: 11,
                type: 2,
              })
            }
          >
            light button
          </button>
        </div>
        <div>
          {
            /*
            8x8 grid 60x60px square buttons
            */
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: "flex" }}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 60,
                      height: 60,
                      border: "1px solid black",
                    }}
                  ></div>
                ))}
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}

export default App;
