package com.benko.tikkytokky.util

import android.util.Base64

object SecurityUtils {
    private const val XOR_KEY = "tikkytokky_secret_key"

    fun obfuscate(input: String): String {
        val xorResult = input.mapIndexed { index, char ->
            (char.code xor XOR_KEY[index % XOR_KEY.length].code).toChar()
        }.joinToString("")
        return Base64.encodeToString(xorResult.toByteArray(), Base64.NO_WRAP)
    }

    fun deobfuscate(input: String): String {
        val decoded = String(Base64.decode(input, Base64.NO_WRAP))
        return decoded.mapIndexed { index, char ->
            (char.code xor XOR_KEY[index % XOR_KEY.length].code).toChar()
        }.joinToString("")
    }

    fun formatKeyForLog(key: String): String {
        return if (key.length >= 4) {
            key.substring(0, 4) + "****"
        } else {
            "****"
        }
    }
}
