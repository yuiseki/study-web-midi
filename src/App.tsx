/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { spec } from "./lib/midi/spec";
import { ledLightning } from "./lib/midi/ledLightning";
import { programmerMode } from "./lib/midi/programmerMode";
import { VisualEffect } from "./components/VisualEffect";
import { AudioVisualizer } from "./components/AudioVisualizer";

function App() {
  // MIDI
  const initializedMIDI = useRef(false);
  const [lastEvent, setLastEvent] = useState<Uint8Array | undefined>(undefined);
  const [midiAccess, setMIDIAccess] = useState<MIDIAccess | undefined>(
    undefined
  );
  const [midiInputs, setMIDIInputs] = useState<MIDIInput[]>([]);
  const [midiOutputs, setMIDIOutputs] = useState<MIDIOutput[]>([]);

  // Audio
  const initializedAudio = useRef(false);
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(
    undefined
  );
  const analyser = useRef<AnalyserNode | undefined>(undefined);
  const bufferLength = useRef<number | undefined>(undefined);
  const [freqDataArray, setFreqDataArray] = useState<Uint8Array | undefined>(
    undefined
  );
  const [timeDataArray, setTimeDataArray] = useState<Uint8Array | undefined>(
    undefined
  );
  const animationId = useRef<number | undefined>(undefined);

  // Initialize Audio device
  useEffect(() => {
    const analyzeAudioData = () => {
      if (!analyser.current) return;

      const newFreqDataArray = new Uint8Array(
        analyser.current.frequencyBinCount
      );
      analyser.current.getByteFrequencyData(newFreqDataArray);
      setFreqDataArray(newFreqDataArray);

      const newTimeDataArray = new Uint8Array(analyser.current.fftSize);
      analyser.current.getByteTimeDomainData(newTimeDataArray);
      setTimeDataArray(newTimeDataArray);

      animationId.current = requestAnimationFrame(analyzeAudioData);
    };

    const init = async () => {
      const newAudioContext = new AudioContext();
      setAudioContext(newAudioContext);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const source = newAudioContext.createMediaStreamSource(stream);

      analyser.current = newAudioContext.createAnalyser();
      analyser.current.fftSize = 32;
      bufferLength.current = analyser.current.frequencyBinCount;

      source.connect(analyser.current);
      console.info("Audio initialized");
      analyzeAudioData();
    };
    if (!initializedAudio.current) {
      initializedAudio.current = true;
      void init();
    }
    return () => {
      audioContext?.close();
      cancelAnimationFrame(animationId.current!);
    };
  }, [audioContext]);

  // Initialize MIDI device
  useEffect(() => {
    if (!initializedMIDI.current) {
      initializedMIDI.current = true;

      const onMIDISuccess = (newMIDI: MIDIAccess) => {
        console.info("onMIDISuccess");
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
        <div>
          {freqDataArray && timeDataArray && (
            <AudioVisualizer
              freqDataArray={freqDataArray}
              timeDataArray={timeDataArray}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "3px",
            flexDirection: "column",
          }}
        >
          {spec.outputIndex.map((row, i) => {
            return (
              <div key={i} style={{ display: "flex", gap: "2px" }}>
                {row.map((col, j) => {
                  return (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 50,
                        height: 50,
                        border: "1px solid black",
                        backgroundColor:
                          i === 0 || j === 8
                            ? "gray"
                            : lastEvent && lastEvent[1] === col
                            ? "lightblue"
                            : "white",
                        userSelect: "none",
                      }}
                    >
                      {col}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
