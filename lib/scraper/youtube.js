import ytdl from '@distube/ytdl-core'
import yts from 'yt-search'
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
    const info = await ytdl.getInfo(url)
    
    const videoFormats = info.formats.filter(f => f.hasVideo && f.hasAudio)
    const audioFormats = info.formats.filter(f => f.hasAudio && !f.hasVideo)
    const videoOnlyFormats = info.formats.filter(f => f.hasVideo && !f.hasAudio)
    
    return {
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      views: info.videoDetails.viewCount,
      author: info.videoDetails.author.name,
      uploadDate: info.videoDetails.uploadDate,
      description: info.videoDetails.description?.substring(0, 200) + '...',
      formats: {
        combined: videoFormats.map(f => ({
          quality: f.qualityLabel,
          container: f.container,
          size: f.contentLength ? `${(f.contentLength / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          fps: f.fps,
          itag: f.itag
        })),
        video: videoOnlyFormats.map(f => ({
          quality: f.qualityLabel,
          container: f.container,
          size: f.contentLength ? `${(f.contentLength / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          fps: f.fps,
          itag: f.itag
        })),
        audio: audioFormats.map(f => ({
          quality: `${f.audioBitrate}kbps`,
          container: f.container,
          size: f.contentLength ? `${(f.contentLength / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          itag: f.itag
        }))
      },
      rawInfo: info
    }
  } catch (error) {
    throw new Error(`Get info error: ${error.message}`)
  }
}

/**
 * Download video with specific quality (using stream method)
 * @param {string} url - YouTube video URL
 * @param {string} quality - Quality preference (720p, 480p, highest, lowest)
 * @param {string} outputPath - Optional output path
 * @returns {Promise<Object>} Download result with buffer
 */
export async function youtubeVideo(url, quality = '720p', outputPath = null) {
  try {
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').substring(0, 50)
    
    // Choose format based on quality preference
    let format
    if (quality === 'highest') {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' })
    } else if (quality === 'lowest') {
      format = ytdl.chooseFormat(info.formats, { quality: 'lowestvideo' })
    } else {
      // Try specific quality, fallback to highest if not found
      try {
        format = ytdl.chooseFormat(info.formats, { quality })
      } catch (error) {
        console.log(`⚠️ ${quality} not available, falling back to highest quality`)
        format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' })
      }
    }
    
    if (!format) {
      throw new Error(`No suitable format found for quality: ${quality}`)
    }
    
    // Download as buffer
    return new Promise((resolve, reject) => {
      const chunks = []
      const ytdlStream = ytdl(url, { format })
      
      ytdlStream.on('data', (chunk) => {
        chunks.push(chunk)
      })
      
      ytdlStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        
        resolve({
          success: true,
          title: info.videoDetails.title,
          buffer,
          size: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
          quality: format.qualityLabel || format.quality,
          container: format.container || 'mp4',
          duration: info.videoDetails.lengthSeconds,
          thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
          author: info.videoDetails.author.name
        })
      })
      
      ytdlStream.on('error', (error) => {
        reject(new Error(`Video download error: ${error.message}`))
      })
    })
    
  } catch (error) {
    throw new Error(`YouTube video error: ${error.message}`)
  }
}

/**
 * Download audio only (using stream method)
 * @param {string} url - YouTube video URL
 * @param {string} quality - Audio quality (highest, lowest)
 * @param {string} outputPath - Optional output path
 * @returns {Promise<Object>} Download result with buffer
 */
export async function youtubeAudio(url, quality = 'highest', outputPath = null) {
  try {
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').substring(0, 50)
    
    // Choose audio format
    const format = ytdl.chooseFormat(info.formats, { 
      quality: quality === 'highest' ? 'highestaudio' : 'lowestaudio'
    })
    
    if (!format) {
      throw new Error('No suitable audio format found')
    }
    
    // Download as buffer
    return new Promise((resolve, reject) => {
      const chunks = []
      const ytdlStream = ytdl(url, { format })
      
      ytdlStream.on('data', (chunk) => {
        chunks.push(chunk)
      })
      
      ytdlStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        
        resolve({
          success: true,
          title: info.videoDetails.title,
          buffer,
          size: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
          bitrate: `${format.audioBitrate}kbps`,
          container: format.container || 'mp4',
          duration: info.videoDetails.lengthSeconds,
          thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
          author: info.videoDetails.author.name
        })
      })
      
      ytdlStream.on('error', (error) => {
        reject(new Error(`Audio download error: ${error.message}`))
      })
    })
    
  } catch (error) {
    throw new Error(`YouTube audio error: ${error.message}`)
  }
}

/**
 * Play audio by search query (for music bot functionality)
 * @param {string} query - Search query
 * @returns {Promise<Object>} Audio download info with metadata
 */
export async function youtubePlay(query) {
  try {
    // Search for the video
    const searchResult = await youtubeSearch(query)
    
    // Download audio
    const audioData = await youtubeAudio(searchResult.url, 'highest')
    
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
