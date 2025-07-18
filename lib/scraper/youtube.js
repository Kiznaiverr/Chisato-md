import { search, ytmp3, ytmp4 } from '@vreden/youtube_scraper'
import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

/**
 * Search YouTube videos
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export async function youtubeSearch(query) {
  try {
    const results = await yts(query)
    if (!results.videos.length) {
      throw new Error('No videos found')
    }
    
    const video = results.videos[0]
    return {
      title: video.title,
      url: video.url,
      duration: video.duration.text,
      thumbnail: video.thumbnail,
      views: video.views,
      ago: video.ago,
      author: video.author.name
    }
  } catch (error) {
    throw new Error(`YouTube search error: ${error.message}`)
  }
}

/**
 * Get video info and available formats
 * @param {string} url - YouTube video URL
 * @returns {Promise<Object>} Video info and formats
 */
export async function youtubeInfo(url) {
  try {
    const result = await ytmp4(url)
    
    if (!result.status) {
      throw new Error('Failed to get video info')
    }
    
    return {
      title: result.metadata.title,
      duration: result.metadata.timestamp,
      thumbnail: result.metadata.thumbnail,
      views: result.metadata.views,
      author: result.metadata.author.name,
      uploadDate: result.metadata.ago,
      description: result.metadata.description?.substring(0, 200) + '...',
      quality: result.download?.quality,
      availableQuality: result.download?.availableQuality,
      rawInfo: result
    }
  } catch (error) {
    throw new Error(`Get info error: ${error.message}`)
  }
}

/**
 * Download video with specific quality
 * @param {string} url - YouTube video URL
 * @param {string} quality - Quality preference
 * @param {string} outputPath - Optional output path
 * @returns {Promise<Object>} Download result with buffer
 */
export async function youtubeVideo(url, quality = '720', outputPath = null) {
  try {
    let requestedQuality = quality
    if (quality === 'highest') {
      requestedQuality = '1080'
    } else if (quality === 'lowest') {
      requestedQuality = '144'
    } else {
      requestedQuality = quality.replace('p', '')
    }
    
    let result = await ytmp4(url, requestedQuality)
    
    if (!result.status || !result.download?.status) {
      result = await ytmp4(url, '1080')
      if (!result.status || !result.download?.status) {
        throw new Error('Failed to get video download link')
      }
    }
    
    const response = await axios.get(result.download.url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)
    
    return {
      success: true,
      title: result.metadata.title,
      buffer,
      size: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      quality: result.download.quality,
      container: 'mp4',
      duration: result.metadata.timestamp,
      thumbnail: result.metadata.thumbnail,
      author: result.metadata.author.name,
      filename: result.download.filename,
      availableQuality: result.download.availableQuality
    }
    
  } catch (error) {
    throw new Error(`YouTube video error: ${error.message}`)
  }
}

/**
 * Download audio only
 * @param {string} url - YouTube video URL
 * @param {string} quality - Audio quality
 * @param {string} outputPath - Optional output path
 * @returns {Promise<Object>} Download result with buffer
 */
export async function youtubeAudio(url, quality = '256', outputPath = null) {
  try {
    let requestedQuality = quality
    if (quality === 'highest') {
      requestedQuality = '320'
    } else if (quality === 'lowest') {
      requestedQuality = '128'
    }
    
    let result = await ytmp3(url, requestedQuality)
    
    if (!result.status || !result.download?.status) {
      result = await ytmp3(url, '320')
      if (!result.status || !result.download?.status) {
        throw new Error('Failed to get audio download link')
      }
    }
    
    const response = await axios.get(result.download.url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)
    
    return {
      success: true,
      title: result.metadata.title,
      buffer,
      size: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      bitrate: result.download.quality,
      container: 'mp3',
      duration: result.metadata.timestamp,
      thumbnail: result.metadata.thumbnail,
      author: result.metadata.author.name,
      filename: result.download.filename,
      availableQuality: result.download.availableQuality
    }
    
  } catch (error) {
    throw new Error(`YouTube audio error: ${error.message}`)
  }
}

/**
 * Play audio by search query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Audio download info with metadata
 */
export async function youtubePlay(query) {
  try {
    const searchResult = await youtubeSearch(query)
    const audioData = await youtubeAudio(searchResult.url, '256')
    
    return {
      title: searchResult.title,
      duration: searchResult.duration,
      thumbnail: searchResult.thumbnail,
      views: searchResult.views,
      author: searchResult.author,
      buffer: audioData.buffer,
      size: audioData.size,
      bitrate: audioData.bitrate,
      container: audioData.container
    }
  } catch (error) {
    throw new Error(`YouTube play error: ${error.message}`)
  }
}

export default { 
  youtubeSearch, 
  youtubeInfo, 
  youtubeVideo, 
  youtubeAudio, 
  youtubePlay 
}
