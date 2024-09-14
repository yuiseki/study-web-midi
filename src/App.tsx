/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const callOnce = useRef(false);
  const [lastEvent, setLastEvent] = useState(undefined);

  useEffect(() => {
    if (!callOnce.current) {
      console.log("This will only be called once");
      callOnce.current = true;

      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

      let midi = null;
      const inputs: any[] = [];
      const outputs: any[] = [];

      function onMIDISuccess(m) {
        console.log("onMIDISuccess()呼ばれたと？");
        midi = m;
        const it = midi.inputs.values();
        for (let o = it.next(); !o.done; o = it.next()) {
          inputs.push(o.value);
        }
        const ot = midi.outputs.values();
        for (let o = ot.next(); !o.done; o = ot.next()) {
          outputs.push(o.value);
        }

        for (let cnt = 0; cnt < inputs.length; cnt++) {
          inputs[cnt].onmidimessage = onMIDIEvent;
        }
      }

      function onMIDIFailure(msg) {
        console.log("onMIDIFailure()呼ばれただと？:" + msg);
      }

      function onMIDIEvent(e) {
        console.log("onMIDIEvent()呼ばれたと？");
        console.log(e.data);
        if (e.data[2] != 0) {
          // なにかをうけとったときの処理
          setLastEvent(e.data);
        }
      }

      function sendMIDINoteOn(note) {
        if (outputs.length > 0) {
          outputs[0].send([0x90, note, 0x7f]);
        }
      }
    }
  }, []);

  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: lastEvent
            ? `rgb(${lastEvent[0]}, ${lastEvent[1]}, ${lastEvent[2]})`
            : "white",
        }}
      >
        <h1>lastEvent</h1>
        <pre>{JSON.stringify(lastEvent, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;
