// offscreen.js - FFmpeg.WASM processing for tikkytokky

let ffmpeg = null;

async function initFFmpeg() {
    if (ffmpeg) return ffmpeg;

    // Assuming FFmpeg is loaded via script tag in offscreen.html
    const { createFFmpeg, fetchFile } = FFmpeg;
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    return ffmpeg;
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "TRANSFORM_VIDEO") {
        try {
            const instance = await initFFmpeg();
            const { videoBlob, options } = message;

            const inputName = 'input.mp4';
            const outputName = 'output.mp4';

            instance.FS('writeFile', inputName, await FFmpeg.fetchFile(videoBlob));

            // Bitstream Fingerprint Randomizer Parameters
            const crf = options.randomize ? Math.floor(Math.random() * 3) + 22 : 23; // 22-24

            // FFmpeg Filter Chain:
            // 1. subtle zoom (scale=1.01)
            // 2. micro-rotation (rotate=0.1)
            // 3. Metadata stripping (-map_metadata -1)
            const filterChain = "scale=iw*1.01:-1,pad=iw:ih:(ow-iw)/2:(oh-ih)/2,rotate=0.1*PI/180";

            await instance.run(
                '-i', inputName,
                '-vf', filterChain,
                '-c:v', 'libx264',
                '-crf', crf.toString(),
                '-map_metadata', '-1',
                '-c:a', 'copy',
                outputName
            );

            const data = instance.FS('readFile', outputName);
            const processedBlob = new Blob([data.buffer], { type: 'video/mp4' });

            // Send back as data URL because Blobs can't be sent directly via message passing in some contexts
            // but for Offscreen to Background, we might need a workaround or ArrayBuffer
            const reader = new FileReader();
            reader.onloadend = () => {
                chrome.runtime.sendMessage({
                    type: "TRANSFORM_COMPLETE",
                    dataUrl: reader.result,
                    requestId: message.requestId
                });
            };
            reader.readAsDataURL(processedBlob);

        } catch (error) {
            console.error("WASM Transformation Error:", error);
            chrome.runtime.sendMessage({
                type: "TRANSFORM_ERROR",
                error: error.message,
                requestId: message.requestId
            });
        }
    }
});
