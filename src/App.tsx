/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { ledLightning } from "./lib/midi/ledLightning";

function App() {
  const callOnce = useRef(false);
  const [lastEvent, setLastEvent] = useState<Uint8Array | undefined>(undefined);
  const [midiAccess, setMIDIAccess] = useState<MIDIAccess | undefined>(
    undefined
  );
  const [midiInputs, setMIDIInputs] = useState<MIDIInput[]>([]);
  const [midiOutputs, setMIDIOutputs] = useState<MIDIOutput[]>([]);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | undefined>(
    undefined
  );

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
      console.log(event.data[1] - 25);
      // event.data[1] - 25 means button index
      // event.data[2] === 0 means note is off
      if (event.data[2] === 0) {
        setLastEvent(undefined);
        ledLightning({
          midiOutputs,
          index: event.data[1] - 25,
          type: 0,
          color: 0,
        });
      } else {
        setLastEvent(event.data);
        ledLightning({
          midiOutputs,
          index: event.data[1] - 25,
          type: 0,
        });
        if (event.data[1] - 25 === 11) {
          setYoutubeVideoId("dQw4w9WgXcQ");
        }
        if (event.data[1] - 25 === 12) {
          setYoutubeVideoId("-qm27ekNEOM");
        }
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
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        {youtubeVideoId && (
          <iframe
            width="1280"
            height="720"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&iv_load_policy=3&modestbranding=1&showinfo=0&loop=1&rel=0&playlist=${youtubeVideoId}`}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        )}
      </div>
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
        <div>
          {!midiAccess && (
            <div>
              <p>No MIDI access</p>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          {
            /*
            8x8 grid 60x60px square buttons
            */
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ display: "flex" }}>
                {Array.from({ length: 9 }).map((_, j) => (
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
                        i + 1 === 9 || j + 1 === 9
                          ? "gray"
                          : lastEvent &&
                            lastEvent[1] - 25 === parseInt(`${i + 1}${j + 1}`)
                          ? `rgb(${lastEvent[0]}, ${lastEvent[1]}, ${lastEvent[2]})`
                          : "white",
                    }}
                  >
                    {i + 1}
                    {j + 1}
                  </div>
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
