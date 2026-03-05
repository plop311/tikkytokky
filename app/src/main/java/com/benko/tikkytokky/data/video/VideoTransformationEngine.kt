package com.benko.tikkytokky.data.video

import android.content.Context
import android.util.Log
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.ReturnCode
import com.benko.tikkytokky.data.local.SettingsManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.opencv.android.OpenCVLoader
import org.opencv.core.*
import java.io.File
import kotlin.random.Random

class VideoTransformationEngine(
    private val context: Context,
    private val settingsManager: SettingsManager
) {

    init {
        if (OpenCVLoader.initLocal()) {
            Log.i("VideoEngine", "OpenCV loaded successfully")
        } else {
            Log.e("VideoEngine", "OpenCV initialization failed")
        }
    }

    /**
     * Executes a full transformation pipeline including Bitstream Fingerprint Randomization.
     */
    suspend fun transformVideo(inputPath: String, outputPath: String): Boolean = withContext(Dispatchers.IO) {
        val deNoise = settingsManager.deNoiseIntensity.first()
        val randomTransform = settingsManager.randomTransformEnabled.first()
        val horizontalFlip = settingsManager.horizontalFlipEnabled.first()
        val randomizeFingerprint = settingsManager.randomizeFingerprintEnabled.first()
        val hueSatShift = settingsManager.hueSatShiftIntensity.first()

        // 1. Base Transforms
        val hShift = if (randomTransform) Random.nextDouble(-0.05, 0.05) else hueSatShift
        val sShift = if (randomTransform) Random.nextDouble(0.95, 1.05) else 1.0 + hueSatShift
        
        val flipFilter = if (horizontalFlip) ",hflip" else ""
        
        // 2. Fingerprint Randomization Filters (1% Zoom, 0.1 degree Micro-Rotation)
        val fingerprintFilters = if (randomizeFingerprint) {
            ",scale=iw*1.01:-1,pad=iw:ih:(ow-iw)/2:(oh-ih)/2,rotate=0.1*PI/180"
        } else {
            ""
        }

        // 3. Bitstream & Metadata Alteration
        // -map_metadata -1 -> Strip all original tags
        // CRF adjustment -> Changes bitstream pattern
        val crf = if (randomizeFingerprint) Random.nextInt(22, 25) else 23
        
        val ffmpegCommand = "-i \"$inputPath\" -vf \"scale=iw*1.1:-1,crop=iw/1.1:ih/1.1,hue=h=$hShift:s=$sShift$flipFilter$fingerprintFilters\" -c:v libx264 -crf $crf -map_metadata -1 -c:a copy \"$outputPath\""

        Log.d("VideoEngine", "Executing FFmpeg Fingerprint Pipeline: $ffmpegCommand")
        val session = FFmpegKit.execute(ffmpegCommand)
        
        if (ReturnCode.isSuccess(session.returnCode)) {
            Log.i("VideoEngine", "FFmpeg transformation and fingerprint refresh successful")
            processFramesWithOpenCV(outputPath)
            true
        } else {
            Log.e("VideoEngine", "FFmpeg failed with rc ${session.returnCode}")
            false
        }
    }

    /**
     * Implements Bitstream Randomizer: subtle zoom, micro-rotation, metadata stripping, and variable CRF.
     */
    suspend fun randomizeBitstream(inputFile: File, outputFile: File): Boolean = withContext(Dispatchers.IO) {
        val crf = Random.nextInt(22, 25) // 23 +/- 1
        // scale=iw*1.01:-1 -> 1% zoom
        // pad=iw:ih:(ow-iw)/2:(oh-ih)/2 -> center padded to maintain size
        // rotate=0.1*PI/180 -> 0.1 degree rotation
        val ffmpegCommand = "-i \"${inputFile.absolutePath}\" -vf \"scale=iw*1.01:-1,pad=iw:ih:(ow-iw)/2:(oh-ih)/2,rotate=0.1*PI/180\" -c:v libx264 -crf $crf -map_metadata -1 -c:a copy \"${outputFile.absolutePath}\""
        
        Log.d("VideoEngine", "Executing Bitstream Randomizer: $ffmpegCommand")
        val session = FFmpegKit.execute(ffmpegCommand)
        ReturnCode.isSuccess(session.returnCode)
    }

    private fun processFramesWithOpenCV(videoPath: String) {
        Log.d("VideoEngine", "OpenCV Vision Layer active on $videoPath")
        // Implementation for text detection and area-specific inpainting
    }
}
