package com.benko.tikkytokky.data.social

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context

class HashtagManager(private val context: Context) {

    val nicheHashtagClusters = listOf(
        "#nostalgia #2000s #oldtech #maincharacter #vibes2026 #y2kaesthetic #00saesthetic",
        "#limewire #myspace #glitchtech #retrocomputing #aesthetic2026 #throwback",
        "#blackberry #bbm #pingme #2010s #nostalgic #digitalmemories",
        "#earlyyoutube #240p #vintageinternet #glitchart #nostalgiahacker",
        "#frutigeraero #skeuomorphism #2000score #techtrends #nostalgiacore",
        "#digitalrenaissance #oldweb #cybernostalgia #internetarchive #glitch",
        "#y2kfashion #00svibes #nostalgiatrip #retrofuture #techgrowth",
        "#msnmessenger #earlysocialmedia #digitallife #nostalgia2026 #vibe",
        "#ipodclassic #mp3player #musicnostalgia #00stech #growthhacker",
        "#winamp #windowsxp #retroaesthetic #nostalgictech #glitchart2026"
    )

    fun shotgunHashtags(): String {
        val hashtags = nicheHashtagClusters.random()
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Niche Hashtags", hashtags)
        clipboard.setPrimaryClip(clip)
        return hashtags
    }
}
