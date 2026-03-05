package com.benko.tikkytokky.data.remote

import android.util.Log
import com.benko.tikkytokky.util.SecurityUtils
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class GeminiKeyInterceptor(private val keyManager: KeyManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var apiKey = runBlocking { keyManager.getNextKey() }
        
        if (apiKey == null) {
            return chain.proceed(chain.request())
        }

        var request = chain.request()
        var url = request.url.newBuilder()
            .setQueryParameter("key", apiKey)
            .build()
        
        request = request.newBuilder().url(url).build()
        var response = chain.proceed(request)

        var retryCount = 0
        val maxRetries = 3

        while (response.code == 429 && retryCount < maxRetries) {
            val currentKey = apiKey ?: break
            Log.w("GeminiKeyInterceptor", "Received 429 for key: ${SecurityUtils.formatKeyForLog(currentKey)}. Retrying with next key...")
            
            runBlocking {
                keyManager.markKeyAsLimited(currentKey)
                apiKey = keyManager.getNextKey()
            }

            val nextKey = apiKey ?: break

            url = request.url.newBuilder()
                .setQueryParameter("key", nextKey)
                .build()
            
            request = request.newBuilder().url(url).build()
            response.close()
            response = chain.proceed(request)
            retryCount++
        }

        return response
    }
}
