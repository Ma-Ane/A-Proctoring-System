class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._buffer = [];
    }

    process(inputs) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const samples = input[0]; // Float32Array of samples

        // collect samples
        for (let i = 0; i < samples.length; i++) {
            this._buffer.push(samples[i]);
        }

        // ✅ use AudioWorkletGlobalScope's sampleRate — works for any browser rate
        const CHUNK_SIZE = sampleRate * 3;

        if (this._buffer.length >= CHUNK_SIZE) {
            const chunk = this._buffer.slice(0, CHUNK_SIZE);
            this._buffer = this._buffer.slice(CHUNK_SIZE);

            // send to main thread
            this.port.postMessage(
                { type: "chunk", samples: new Float32Array(chunk) },
                [new Float32Array(chunk).buffer]
            );
        }

        return true; // keep processor alive
    }
}

// ✅ must exactly match the string in new AudioWorkletNode(audioContext, "audioProcessor")
registerProcessor("audioProcessor", AudioProcessor);