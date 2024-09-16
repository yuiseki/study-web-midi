/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { spec } from "./lib/midi/spec";
import { ledLightning } from "./lib/midi/ledLightning";
import { programmerMode } from "./lib/midi/programmerMode";
import { VisualEffect } from "./components/VisualEffect";

function App() {
  const callOnce = useRef(false);
  const [lastEvent, setLastEvent] = useState<Uint8Array | undefined>(undefined);
  const [midiAccess, setMIDIAccess] = useState<MIDIAccess | undefined>(
    undefined
  );
  const [midiInputs, setMIDIInputs] = useState<MIDIInput[]>([]);
  const [midiOutputs, setMIDIOutputs] = useState<MIDIOutput[]>([]);

  // Initialize MIDI device
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

  // Switch to programmer mode and listen to MIDI messages
  useEffect(() => {
    if (!midiInputs.length) {
      return;
    }
    if (!midiOutputs.length) {
      return;
    }

    programmerMode({
      midiOutputs,
      mode: 1,
    });

    const onMIDIMessage = (event: MIDIMessageEvent) => {
      console.log("onMIDIEvent", event.data);
      if (!event.data) {
        return;
      }
      console.log(event.data[1]);
      // event.data[1] means button index
      // event.data[2] === 0 means note is off
      if (event.data[2] === 0) {
        //setLastEvent(undefined);
        ledLightning({
          midiOutputs,
          index: event.data[1],
          type: 0,
          color: 0,
        });
      } else {
        setLastEvent(event.data);
        ledLightning({
          midiOutputs,
          index: event.data[1],
          type: 0,
          color: event.data[1],
        });
      }
    };

    for (let i = 0; i < midiInputs.length; i++) {
      midiInputs[i].onmidimessage = onMIDIMessage;
    }
  }, [midiInputs, midiOutputs]);

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
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <div>
            {!midiAccess && (
              <div>
                <p>No MIDI access</p>
              </div>
            )}
          </div>
          <div>{lastEvent && <VisualEffect index={lastEvent[1]} />}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {
            /*
            8x8 grid 60x60px square buttons
            */
            spec.outputIndex.map((row, i) => {
              return (
                <div key={i} style={{ display: "flex" }}>
                  {row.map((col, j) => {
                    return (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: 60,
                          height: 60,
                          border: "1px solid black",
                          backgroundColor:
                            i === 0 || j === 8
                              ? "gray"
                              : lastEvent && lastEvent[1] === col
                              ? `rgb(${lastEvent[0]}, ${lastEvent[1]}, ${lastEvent[2]})`
                              : "white",
                        }}
                      >
                        {col}
                      </div>
                    );
                  })}
                </div>
              );
            })
          }
        </div>
      </div>
    </>
  );
}

export default App;
