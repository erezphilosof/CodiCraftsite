// Codi's Robot Dubbing Studio - Audio Processing and Controls

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const recordBtn = document.getElementById('ds-record-btn');
    const timerEl = document.getElementById('ds-timer');
    const statusEl = document.getElementById('ds-status');
    const playbackContainer = document.getElementById('ds-playback-container');
    const playBtn = document.getElementById('ds-play-btn');
    
    // Filters and SFX buttons
    const filterBtns = document.querySelectorAll('.ds-filter-btn');
    const sfxBtns = document.querySelectorAll('.ds-sfx-btn');
    
    // Actions
    const downloadBtn = document.getElementById('ds-download-btn');
    const shareBtn = document.getElementById('ds-share-btn');
    
    // Canvas Visualizer
    const canvas = document.getElementById('ds-visualizer');
    const canvasCtx = canvas.getContext('2d');

    // Audio State Variables
    let audioCtx = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let recordStartTime = 0;
    let timerInterval = null;
    let recordedBlob = null;
    let recordedAudioBuffer = null;
    let activeSource = null;
    let isRecording = false;
    let isPlaying = false;
    let currentFilter = 'codi'; // default filter

    // Visualizer State
    let analyser = null;
    let dataArray = null;
    let animationId = null;

    // Set canvas resolution
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize Web Audio Context
    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Draw ambient visualizer line when idle
    function drawIdleVisualizer() {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 3;
        
        // Codi Theme Gradients: Cyan/Indigo/Pink
        const grad = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, '#ff007f');
        grad.addColorStop(0.5, '#a78bfa');
        grad.addColorStop(1, '#00ffea');
        canvasCtx.strokeStyle = grad;
        
        canvasCtx.beginPath();
        const sliceWidth = canvas.width / 100;
        let x = 0;
        
        for (let i = 0; i < 100; i++) {
            const angle = (i * 0.15) + (Date.now() * 0.004);
            const y = (canvas.height / 2) + Math.sin(angle) * 4;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.stroke();
        animationId = requestAnimationFrame(drawIdleVisualizer);
    }
    drawIdleVisualizer();

    // Active Visualizer drawing function (for recording and playing)
    function drawActiveVisualizer() {
        if (!analyser) return;
        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteTimeDomainData(dataArray);
        
        canvasCtx.lineWidth = 3;
        const grad = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, '#ff007f');
        grad.addColorStop(0.5, '#a78bfa');
        grad.addColorStop(1, '#00ffea');
        canvasCtx.strokeStyle = grad;
        
        canvasCtx.beginPath();
        const bufferLength = analyser.frequencyBinCount;
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * (canvas.height / 2);
            
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
        animationId = requestAnimationFrame(drawActiveVisualizer);
    }

    // Setup recorder
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }

    async function toggleRecording() {
        initAudio();
        
        if (isRecording) {
            // STOP RECORDING
            isRecording = false;
            recordBtn.classList.remove('recording');
            statusEl.textContent = 'ההקלטה הושלמה! מעבד אודיו... ⏳';
            
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            clearInterval(timerInterval);
            
            // Stop mic stream track
            if (mediaRecorder && mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            
            cancelAnimationFrame(animationId);
            drawIdleVisualizer();
        } else {
            // START RECORDING
            if (isPlaying) stopPlayback();
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                isRecording = true;
                recordBtn.classList.add('recording');
                statusEl.textContent = 'מקליט... דברו יחד למיקרופון! 🎙️';
                
                // Set visualizer to mic stream
                const source = audioCtx.createMediaStreamSource(stream);
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                
                cancelAnimationFrame(animationId);
                drawActiveVisualizer();

                // Setup MediaRecorder
                audioChunks = [];
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };
                
                mediaRecorder.onstop = async () => {
                    recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const arrayBuffer = await recordedBlob.arrayBuffer();
                    
                    // Decode into AudioBuffer for local processing
                    audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
                        recordedAudioBuffer = buffer;
                        statusEl.textContent = 'הקלטה מוכנה. בחרו פילטר והשמיעו! 🎧';
                        playbackContainer.style.display = 'block';
                        
                        // Enable actions
                        downloadBtn.classList.remove('disabled');
                        shareBtn.classList.remove('disabled');
                    }, (err) => {
                        console.error('Audio decode failed:', err);
                        statusEl.textContent = 'שגיאה בעיבוד האודיו. נסו שוב.';
                    });
                };

                mediaRecorder.start();
                recordStartTime = Date.now();
                timerEl.textContent = '00:00';
                
                timerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - recordStartTime) / 1000);
                    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
                    const secs = String(elapsed % 60).padStart(2, '0');
                    timerEl.textContent = `${mins}:${secs}`;
                }, 1000);
                
            } catch (err) {
                console.error('Mic access denied or error:', err);
                statusEl.textContent = 'לא ניתן לגשת למיקרופון. אנא אשרו הרשאת מיקרופון בדפדפן.';
            }
        }
    }

    // Playback Handling
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                stopPlayback();
            } else {
                startPlayback();
            }
        });
    }

    function startPlayback() {
        if (!recordedAudioBuffer) return;
        initAudio();
        
        isPlaying = true;
        playBtn.classList.add('playing');
        playBtn.querySelector('span').textContent = 'עצור השמעה 🛑';
        statusEl.textContent = 'משמיע את הקול הרובוטי שלכם... 🤖';
        
        // Create audio graph
        activeSource = audioCtx.createBufferSource();
        activeSource.buffer = recordedAudioBuffer;
        
        // Apply Selected Filter Graph
        const filterNode = applyFilterGraph(audioCtx, activeSource, currentFilter);
        
        // Connect to analyser for visuals
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        filterNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        cancelAnimationFrame(animationId);
        drawActiveVisualizer();

        activeSource.onended = () => {
            if (isPlaying) stopPlayback();
        };

        activeSource.start(0);
    }

    function stopPlayback() {
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.querySelector('span').textContent = 'השמיעו את הדיבוב ▶️';
        statusEl.textContent = 'ההשמעה נעצרה.';
        
        if (activeSource) {
            try {
                activeSource.stop();
            } catch (e) {}
            activeSource = null;
        }
        
        cancelAnimationFrame(animationId);
        drawIdleVisualizer();
    }

    // Audio Filters DSP Graph Creator
    function applyFilterGraph(context, sourceNode, filterName) {
        let lastNode = sourceNode;
        
        if (filterName === 'codi') {
            // Metallic Codi Robot: Walkie-talkie highpass + Tremolo + Distortion
            const hpFilter = context.createBiquadFilter();
            hpFilter.type = 'highpass';
            hpFilter.frequency.setValueAtTime(600, context.currentTime);
            
            // Distortion (WaveShaper)
            const shaper = context.createWaveShaper();
            shaper.curve = makeDistortionCurve(60);
            
            // Tremolo Modulation Node
            const tremoloGain = context.createGain();
            const lfo = context.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(45, context.currentTime); // Fast modulation
            
            const lfoGain = context.createGain();
            lfoGain.gain.setValueAtTime(0.7, context.currentTime);
            
            lfo.connect(lfoGain);
            lfoGain.connect(tremoloGain.gain);
            lfo.start();
            
            // Chain
            lastNode.connect(hpFilter);
            hpFilter.connect(shaper);
            shaper.connect(tremoloGain);
            
            lastNode = tremoloGain;
            
        } else if (filterName === 'hacker') {
            // Secret Hacker: Pitch down (slow rate) + Bitcrusher/Distortion + Lowpass
            // Slow down playback to lower pitch (classic dark hacker voice)
            sourceNode.playbackRate.setValueAtTime(0.75, context.currentTime);
            
            const lpFilter = context.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.setValueAtTime(1000, context.currentTime);
            
            const shaper = context.createWaveShaper();
            shaper.curve = makeDistortionCurve(100);
            
            lastNode.connect(shaper);
            shaper.connect(lpFilter);
            
            lastNode = lpFilter;
            
        } else if (filterName === 'space') {
            // Space Alien: Rapid vibrating vibrato using delay node
            const delay = context.createDelay();
            delay.delayTime.setValueAtTime(0.01, context.currentTime);
            
            // LFO to modulate delay (frequency modulation/vibrato)
            const lfo = context.createOscillator();
            lfo.frequency.setValueAtTime(12, context.currentTime); // vibrating speed
            
            const lfoGain = context.createGain();
            lfoGain.gain.setValueAtTime(0.008, context.currentTime); // vibrato depth
            
            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            lfo.start();
            
            // High feedback loop to sound cosmic
            const feedback = context.createGain();
            feedback.gain.setValueAtTime(0.4, context.currentTime);
            
            delay.connect(feedback);
            feedback.connect(delay);
            
            lastNode.connect(delay);
            lastNode = delay;
        }
        
        return lastNode;
    }

    // Custom Distortion curve creator helper
    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // Filter Buttons Selection
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = e.currentTarget;
            targetBtn.classList.add('active');
            currentFilter = targetBtn.getAttribute('data-filter');
            
            // Restart audio if playing to hear changes immediately
            if (isPlaying) {
                stopPlayback();
                startPlayback();
            }
        });
    });

    // Sound FX Triggers
    sfxBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sfxType = e.currentTarget.getAttribute('data-sfx');
            playRetroSFX(sfxType);
        });
    });

    // Synthesize Retro Sound Effects
    function playRetroSFX(type) {
        initAudio();
        const ctx = audioCtx;
        
        if (type === 'laser') {
            // Laser Sweep Sound
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.35);
            
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
            
        } else if (type === 'explosion') {
            // Explosion White Noise Sound
            const bufferSize = ctx.sampleRate * 0.6; // 0.6 seconds
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            noise.start();
            noise.stop(ctx.currentTime + 0.6);
            
        } else if (type === 'game') {
            // Retro 8-bit game start arpeggio
            const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));
                
                gain.gain.setValueAtTime(0.0, ctx.currentTime + (idx * 0.08));
                gain.gain.setValueAtTime(0.08, ctx.currentTime + (idx * 0.08) + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.08) + 0.12);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + (idx * 0.08));
                osc.stop(ctx.currentTime + (idx * 0.08) + 0.15);
            });
            
        } else if (type === 'victory') {
            // Victory melody (cheerful major chord)
            const victoryNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            victoryNotes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.1));
                
                gain.gain.setValueAtTime(0.0, ctx.currentTime + (idx * 0.1));
                gain.gain.setValueAtTime(0.1, ctx.currentTime + (idx * 0.1) + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.1) + 0.25);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + (idx * 0.1));
                osc.stop(ctx.currentTime + (idx * 0.1) + 0.3);
            });
        }
    }

    // WAV File Exporter (uses Web Audio OfflineAudioContext to render the DSP)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            if (!recordedAudioBuffer) return;
            statusEl.textContent = 'מייצא קובץ סאונד מונפש... 📥';
            
            const duration = recordedAudioBuffer.duration;
            const sampleRate = recordedAudioBuffer.sampleRate;
            
            // Hack for hacker mode length change
            const speedRatio = currentFilter === 'hacker' ? 0.75 : 1.0;
            const renderDuration = duration / speedRatio;
            
            const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            const offlineCtx = new OfflineCtx(1, sampleRate * renderDuration, sampleRate);
            
            const source = offlineCtx.createBufferSource();
            source.buffer = recordedAudioBuffer;
            source.playbackRate.setValueAtTime(speedRatio, 0);
            
            const outputNode = applyFilterGraph(offlineCtx, source, currentFilter);
            outputNode.connect(offlineCtx.destination);
            
            source.start(0);
            
            try {
                const renderedBuffer = await offlineCtx.startRendering();
                const wavBlob = audioBufferToWav(renderedBuffer);
                
                const url = URL.createObjectURL(wavBlob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Codi_Robot_Dubbing_${Date.now()}.wav`;
                document.body.appendChild(a);
                a.click();
                
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
                
                statusEl.textContent = 'קובץ הדיבוב הורד בהצלחה! 📥🎉';
            } catch (err) {
                console.error('Offline rendering failed:', err);
                statusEl.textContent = 'ייצוא הקובץ נכשל. אנא נסו שוב.';
            }
        });
    }

    // Share Button WhatsApp Link Generator
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const text = `הקלטנו דיבוב רובוטי מגניב במכונת הדיבוב של קודיקראפט! 🎙️🤖 כנסו גם אתם יחד עם הילדים לעמוד הבית והקליטו את הקול שלכם: ${window.location.origin}`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // WAV Encoder Helper Function (RIFF WAVE layout standard format)
    function audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // 1 = raw PCM data
        const bitDepth = 16;
        
        let result;
        if (numOfChan === 2) {
            result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
        } else {
            result = buffer.getChannelData(0);
        }
        
        const bufferLength = result.length * 2;
        const arrayBuffer = new ArrayBuffer(44 + bufferLength);
        const view = new DataView(arrayBuffer);
        
        // RIFF Identifier
        writeString(view, 0, 'RIFF');
        // File length
        view.setUint32(4, 36 + bufferLength, true);
        // WAVE Identifier
        writeString(view, 8, 'WAVE');
        // Format chunk identifier
        writeString(view, 12, 'fmt ');
        // Format chunk length
        view.setUint32(16, 16, true);
        // Sample format (raw PCM)
        view.setUint16(20, format, true);
        // Channel count
        view.setUint16(22, numOfChan, true);
        // Sample rate
        view.setUint32(24, sampleRate, true);
        // Byte rate (sample rate * block align)
        view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
        // Block align (channel count * bytes per sample)
        view.setUint16(32, numOfChan * (bitDepth / 8), true);
        // Bits per sample
        view.setUint16(34, bitDepth, true);
        // Data chunk identifier
        writeString(view, 36, 'data');
        // Data chunk length
        view.setUint32(40, bufferLength, true);
        
        // Write PCM Audio Data
        floatTo16BitPCM(view, 44, result);
        
        return new Blob([view], { type: 'audio/wav' });
    }

    function interleave(inputL, inputR) {
        const length = inputL.length + inputR.length;
        const result = new Float32Array(length);
        
        let index = 0;
        let inputIndex = 0;
        
        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
});
