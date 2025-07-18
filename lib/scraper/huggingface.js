import { Client } from "@gradio/client";
import ProxyManager from "../proxyManager.js";
import fs from 'fs';
import path from 'path';

/**
 * Configure proxy for Gradio client
 * @returns {boolean} Success status
 */
async function configureProxy() {
    try {
        const success = await ProxyManager.configureGlobalProxy();
        return success;
    } catch (error) {
        console.log("⚠️ Proxy configuration failed, using direct connection:", error.message);
        return false;
    }
}

/**
 * Generate image using Hugging Face FLUX.1-dev model
 * @param {string} prompt - Text prompt for image generation
 * @param {Object} options - Optional parameters
 * @param {number} options.seed - Seed for generation (default: 0)
 * @param {boolean} options.randomize_seed - Whether to randomize seed (default: true)
 * @param {number} options.width - Image width (default: 256)
 * @param {number} options.height - Image height (default: 256)
 * @param {number} options.guidance_scale - Guidance scale (default: 1)
 * @param {number} options.num_inference_steps - Number of inference steps (default: 1)
 * @returns {Object} Response object with status code and data
 */
async function generateImage(prompt, options = {}) {
    await configureProxy();
    
    try {
        const {
            seed = 0,
            randomize_seed = true,
            width = 256,
            height = 256,
            guidance_scale = 1,
            num_inference_steps = 1
        } = options;

        const client = await Client.connect("black-forest-labs/FLUX.1-dev");
        const result = await client.predict("/infer", {
            prompt,
            seed,
            randomize_seed,
            width,
            height,
            guidance_scale,
            num_inference_steps
        });

        const imageUrl = result.data[0]?.url;
        
        if (!imageUrl) {
            return {
                status: 500,
                error: "Failed to generate image URL"
            };
        }

        return {
            status: 200,
            data: {
                url: imageUrl,
                prompt: prompt
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to generate image"
        };
    }
}

/**
 * Chat with ChatGPT using Hugging Face space
 * @param {string} message - User message
 * @param {Object} options - Optional parameters
 * @param {Array} options.chatbot - Previous chat history (default: [])
 * @param {number} options.chat_counter - Chat counter (default: 0)
 * @param {number} options.top_p - Top p parameter (default: 1)
 * @param {number} options.temperature - Temperature parameter (default: 1)
 * @returns {Object} Response object with status code and data
 */
async function chatGPT(message, options = {}) {
    await configureProxy();
    
    try {
        const {
            chatbot = [],
            chat_counter = 0,
            top_p = 1,
            temperature = 1
        } = options;

        const client = await Client.connect("yuntian-deng/ChatGPT");
        const result = await client.predict("/predict", {
            inputs: message,
            top_p,
            temperature,
            chat_counter,
            chatbot
        });

        const reply_pairs = result.data[0];
        const botReply = reply_pairs.length > 0 ? reply_pairs[reply_pairs.length - 1][1] : "(Kosong)";
        
        if (!botReply || botReply.trim() === "") {
            return {
                status: 500,
                error: "Empty response from ChatGPT"
            };
        }

        return {
            status: 200,
            data: {
                reply: botReply,
                chatbot: reply_pairs,
                chat_counter: chat_counter + 1,
                user_message: message
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to get ChatGPT response"
        };
    }
}

/**
 * Interactive chat session with ChatGPT (for CLI usage)
 * @param {Object} options - Optional parameters
 * @param {number} options.top_p - Top p parameter (default: 1)
 * @param {number} options.temperature - Temperature parameter (default: 1)
 * @returns {Object} Response object with status code
 */
async function startChatSession(options = {}) {
    try {
        const readline = await import("node:readline/promises");
        const process = await import("node:process");
        
        const rl = readline.createInterface({ 
            input: process.stdin, 
            output: process.stdout 
        });
        
        let chatbot = [];
        let chat_counter = 0;
        
        console.log("Percakapan dengan ChatGPT HuggingFace Space");
        console.log("Ketik 'exit' untuk keluar.\n");
        
        while (true) {
            const userMsg = await rl.question("Kamu: ");
            if (userMsg.trim().toLowerCase() === "exit") break;
            
            const response = await chatGPT(userMsg, {
                chatbot,
                chat_counter,
                ...options
            });
            
            if (response.status === 200) {
                console.log("Bot: " + response.data.reply + "\n");
                chatbot = response.data.chatbot;
                chat_counter = response.data.chat_counter;
            } else {
                console.log("Error: " + response.error + "\n");
            }
        }
        
        rl.close();
        console.log("Selesai.");
        
        return {
            status: 200,
            message: "Chat session ended successfully"
        };
        
    } catch (error) {
        return {
            status: 500,
            error: error.message || "Failed to start chat session"
        };
    }
}

/**
 * Chat with Mistral AI using Hugging Face space
 * @param {string} message - User message
 * @param {Object} options - Optional parameters
 * @param {number} options.param_2 - Max tokens (default: 1024)
 * @param {number} options.param_3 - Temperature (default: 0.6)
 * @param {number} options.param_4 - Top P (default: 0.9)
 * @param {number} options.param_5 - Top K (default: 50)
 * @param {number} options.param_6 - Repetition penalty (default: 1.2)
 * @returns {Object} Response object with status code and data
 */
async function mistralAI(message, options = {}) {
    await configureProxy();
    
    try {
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return {
                status: 500,
                error: 'Message is required and must be a non-empty string'
            };
        }

        const {
            param_2 = 1024,
            param_3 = 0.6,
            param_4 = 0.9,
            param_5 = 50,
            param_6 = 1.2
        } = options;

        const client = await Client.connect("hysts/mistral-7b");
        
        const requestPromise = client.predict("/chat", {
            message: message.trim(),
            param_2,
            param_3,
            param_4,
            param_5,
            param_6
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 60000)
        );
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        
        if (!Array.isArray(result.data) || result.data.length === 0) {
            return {
                status: 500,
                error: 'Unexpected response from Mistral AI service'
            };
        }

        const aiReply = result.data[0];
        
        if (!aiReply || aiReply.trim() === "") {
            return {
                status: 500,
                error: "Empty response from Mistral AI"
            };
        }

        return {
            status: 200,
            data: {
                response: aiReply,
                model: 'mistral-7b',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                user_message: message
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to get Mistral AI response"
        };
    }
}

/**
 * Generate image from text using FLUX-Pro-Unlimited model
 * @param {string} prompt - Text prompt for image generation
 * @param {Object} options - Optional parameters
 * @param {number} options.width - Image width (default: 1280)
 * @param {number} options.height - Image height (default: 1280)
 * @param {number} options.seed - Seed for generation (default: 0)
 * @param {boolean} options.randomize - Whether to randomize seed (default: true)
 * @param {string} options.server_choice - Server choice (default: "PixelNet NPU Server")
 * @returns {Object} Response object with status code and data
 */
async function textToImage(prompt, options = {}) {
    await configureProxy();
    
    try {
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return {
                status: 500,
                error: 'Prompt is required and must be a non-empty string'
            };
        }

        const sanitizedPrompt = prompt.trim().substring(0, 500);
        
        const {
            width = 1280,
            height = 1280,
            seed = 0,
            randomize = true,
            server_choice = "PixelNet NPU Server"
        } = options;

        const client = await Client.connect("NihalGazi/FLUX-Pro-Unlimited");
        
        const requestPromise = client.predict("/generate_image", {
            prompt: sanitizedPrompt,
            width,
            height,
            seed,
            randomize,
            server_choice
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 120000)
        );
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        
        const imageData = result.data?.[0];
        
        if (!imageData) {
            return {
                status: 500,
                error: 'Empty response from AI service'
            };
        }

        const { filename, filepath } = await saveImageToTmp(imageData, sanitizedPrompt);

        return {
            status: 200,
            data: {
                prompt: sanitizedPrompt,
                filename: filename,
                filepath: filepath,
                model: 'FLUX-Pro-Unlimited',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                parameters: {
                    width,
                    height,
                    seed,
                    randomize,
                    server_choice
                }
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to generate image from text"
        };
    }
}

/**
 * Save image data to tmp directory
 * @param {*} imageData - Image data from API response
 * @param {string} prompt - Original prompt for filename
 * @returns {Object} Filename and filepath
 */
async function saveImageToTmp(imageData, prompt) {
    try {
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const sanitizedPrompt = prompt.toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 20);
        
        let extension = 'webp';
        const filename = `t2i_${timestamp}_${randomStr}_${sanitizedPrompt}.${extension}`;
        const filepath = path.join(tmpDir, filename);

        if (Array.isArray(imageData)) {
            for (const element of imageData) {
                if (element && typeof element === 'object') {
                    if (element.url) {
                        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                        const response = await fetch(element.url);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        fs.writeFileSync(filepath, buffer);
                        return { filename, filepath };
                    } else if (element.path) {
                        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                        const response = await fetch(element.path);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        fs.writeFileSync(filepath, buffer);
                        return { filename, filepath };
                    }
                }
            }
        } else if (typeof imageData === 'string') {
            if (imageData.startsWith('data:')) {
                const base64Data = imageData.split(',')[1];
                fs.writeFileSync(filepath, base64Data, 'base64');
            } else if (imageData.startsWith('http')) {
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const response = await fetch(imageData);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filepath, buffer);
            } else {
                fs.writeFileSync(filepath, imageData, 'base64');
            }
        } else if (imageData && typeof imageData === 'object') {
            if (imageData.url) {
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const response = await fetch(imageData.url);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filepath, buffer);
            } else if (imageData.data) {
                if (typeof imageData.data === 'string') {
                    if (imageData.data.startsWith('data:')) {
                        const base64Data = imageData.data.split(',')[1];
                        fs.writeFileSync(filepath, base64Data, 'base64');
                    } else {
                        fs.writeFileSync(filepath, imageData.data, 'base64');
                    }
                } else {
                    fs.writeFileSync(filepath, imageData.data);
                }
            }
        }

        return { filename, filepath };
    } catch (error) {
        throw new Error(`Failed to save image: ${error.message}`);
    }
}

/**
 * Edit images using FLUX.1-Kontext-Dev model
 * @param {string} imageUrl - URL of the image to edit
 * @param {string} prompt - Editing prompt
 * @param {Object} options - Optional parameters
 * @param {number} options.seed - Seed for generation (default: 0)
 * @param {boolean} options.randomize_seed - Whether to randomize seed (default: true)
 * @param {number} options.guidance_scale - Guidance scale (default: 1)
 * @param {number} options.steps - Number of steps (default: 1)
 * @returns {Object} Response object with status code and data
 */
async function imageEditor(imageUrl, prompt, options = {}) {
    await configureProxy();
    
    try {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            return {
                status: 500,
                error: 'Image URL is required and must be a non-empty string'
            };
        }

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return {
                status: 500,
                error: 'Prompt is required and must be a non-empty string'
            };
        }

        if (!isValidImageUrl(imageUrl)) {
            return {
                status: 500,
                error: 'Invalid image URL format'
            };
        }

        const {
            seed = 0,
            randomize_seed = true,
            guidance_scale = 1,
            steps = 1
        } = options;

        const imageData = await fetchImageFromUrl(imageUrl);

        const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");
        
        const requestPromise = client.predict("/infer", {
            input_image: imageData.blob,
            prompt: prompt.trim(),
            seed,
            randomize_seed,
            guidance_scale,
            steps
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 120000)
        );
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        
        const processedImageData = result.data;
        
        if (!processedImageData) {
            return {
                status: 500,
                error: 'Empty response from AI service'
            };
        }

        const { filename, filepath } = await saveProcessedImage(processedImageData, imageData.filename, prompt.trim());

        return {
            status: 200,
            data: {
                filename: filename,
                filepath: filepath,
                prompt: prompt.trim(),
                original_url: imageUrl,
                model: 'FLUX.1-Kontext-Dev',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                parameters: {
                    seed,
                    randomize_seed,
                    guidance_scale,
                    steps
                }
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to edit image"
        };
    }
}

/**
 * Validate image URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid image URL
 */
function isValidImageUrl(url) {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

/**
 * Fetch image from URL and convert to blob
 * @param {string} imageUrl - Image URL
 * @returns {Object} Image data with blob and metadata
 */
async function fetchImageFromUrl(imageUrl) {
    try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetch(imageUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            throw new Error('URL does not point to an image');
        }

        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            throw new Error('Image file too large. Maximum 10MB allowed.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const imageBlob = new Blob([buffer], { type: contentType });
        
        return {
            blob: imageBlob,
            filename: extractFilenameFromUrl(imageUrl) || 'image.jpg',
            contentType: contentType
        };
    } catch (error) {
        throw new Error(`Failed to fetch image from URL: ${error.message}`);
    }
}

/**
 * Extract filename from URL
 * @param {string} url - URL to extract filename from
 * @returns {string|null} Extracted filename
 */
function extractFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop();
        
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasImageExt = imageExtensions.some(ext => 
            filename.toLowerCase().endsWith(ext)
        );
        
        return hasImageExt ? filename : null;
    } catch {
        return null;
    }
}

/**
 * Save processed image to tmp directory
 * @param {*} imageData - Processed image data from API
 * @param {string} originalFilename - Original filename
 * @param {string} prompt - Editing prompt
 * @returns {Object} Filename and filepath
 */
async function saveProcessedImage(imageData, originalFilename, prompt) {
    try {
        const tmpDir = path.join(process.cwd(), 'tmp', 'image-editor');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const originalExt = path.extname(originalFilename).toLowerCase() || '.webp';
        
        const filename = `image_editor_${timestamp}_${randomStr}_${path.basename(originalFilename, originalExt)}${originalExt}`;
        const filepath = path.join(tmpDir, filename);
        
        if (Array.isArray(imageData)) {
            const firstElement = imageData[0];
            
            if (firstElement && typeof firstElement === 'object') {
                if (firstElement.url) {
                    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                    const response = await fetch(firstElement.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(filepath, buffer);
                    return { filename, filepath };
                } else if (firstElement.path) {
                    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                    const response = await fetch(firstElement.path);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(filepath, buffer);
                    return { filename, filepath };
                }
            }
            
            throw new Error('Unable to extract image from array response');
        }
        
        if (typeof imageData === 'string') {
            if (imageData.startsWith('data:')) {
                const base64Data = imageData.split(',')[1];
                fs.writeFileSync(filepath, base64Data, 'base64');
            } else if (imageData.startsWith('http')) {
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const response = await fetch(imageData);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filepath, buffer);
            } else {
                fs.writeFileSync(filepath, imageData, 'base64');
            }
        } else if (Buffer.isBuffer(imageData)) {
            fs.writeFileSync(filepath, imageData);
        } else if (imageData && typeof imageData === 'object') {
            if (imageData.url) {
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const response = await fetch(imageData.url);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filepath, buffer);
            } else if (imageData.data) {
                if (typeof imageData.data === 'string') {
                    if (imageData.data.startsWith('data:')) {
                        const base64Data = imageData.data.split(',')[1];
                        fs.writeFileSync(filepath, base64Data, 'base64');
                    } else {
                        fs.writeFileSync(filepath, imageData.data, 'base64');
                    }
                } else {
                    fs.writeFileSync(filepath, imageData.data);
                }
            } else {
                throw new Error(`Unsupported object format. Keys: ${Object.keys(imageData).join(', ')}`);
            }
        } else {
            throw new Error(`Unsupported image data format: ${typeof imageData}`);
        }

        return { filename, filepath };
    } catch (error) {
        throw new Error(`Failed to save processed image: ${error.message}`);
    }
}

/**
 * Enhance image quality using Face-Real-ESRGAN model
 * @param {string} imageUrl - URL of the image to enhance
 * @param {string} size - Enhancement size ("2x" or "4x", default: "2x")
 * @returns {Object} Response object with status code and data
 */
async function imageEnhancer(imageUrl, size = '2x') {
    await configureProxy();
    
    try {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            return {
                status: 500,
                error: 'Image URL is required and must be a non-empty string'
            };
        }

        const supportedSizes = ['2x', '4x'];
        if (!supportedSizes.includes(size)) {
            return {
                status: 500,
                error: `Unsupported size. Supported sizes: ${supportedSizes.join(', ')}`
            };
        }

        if (!isValidImageUrl(imageUrl)) {
            return {
                status: 500,
                error: 'Invalid image URL format'
            };
        }

        const imageData = await fetchImageFromUrl(imageUrl);

        const client = await Client.connect("doevent/Face-Real-ESRGAN");
        
        const requestPromise = client.predict("/predict", {
            image: imageData.blob,
            size: size
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 120000)
        );
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        
        const enhancedImageData = result.data;
        
        if (!enhancedImageData) {
            return {
                status: 500,
                error: 'Empty response from AI service'
            };
        }

        const { filename, filepath } = await saveEnhancedImage(enhancedImageData, imageData.filename);

        return {
            status: 200,
            data: {
                filename: filename,
                filepath: filepath,
                enhancement_size: size,
                original_url: imageUrl,
                model: 'Face-Real-ESRGAN',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to enhance image"
        };
    }
}

/**
 * Save enhanced image to tmp directory
 * @param {*} imageData - Enhanced image data from API
 * @param {string} originalFilename - Original filename
 * @returns {Object} Filename and filepath
 */
async function saveEnhancedImage(imageData, originalFilename) {
    try {
        const tmpDir = path.join(process.cwd(), 'tmp', 'remini');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const originalExt = path.extname(originalFilename).toLowerCase() || '.webp';
        
        const filename = `remini_${timestamp}_${randomStr}${originalExt}`;
        const filepath = path.join(tmpDir, filename);
        
        if (Array.isArray(imageData)) {
            const firstElement = imageData[0];
            
            if (firstElement && typeof firstElement === 'object') {
                if (firstElement.url) {
                    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                    const response = await fetch(firstElement.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(filepath, buffer);
                    return { filename, filepath };
                } else if (firstElement.path) {
                    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                    const response = await fetch(firstElement.path);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(filepath, buffer);
                    return { filename, filepath };
                }
            }
            
            throw new Error('Unable to extract image from array response');
        }
        
        if (typeof imageData === 'string') {
            if (imageData.startsWith('data:')) {
                const base64Data = imageData.split(',')[1];
                fs.writeFileSync(filepath, base64Data, 'base64');
            } else if (imageData.startsWith('http')) {
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const response = await fetch(imageData);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filepath, buffer);
            } else {
                fs.writeFileSync(filepath, imageData, 'base64');
            }
        } else if (Buffer.isBuffer(imageData)) {
            fs.writeFileSync(filepath, imageData);
        } else if (imageData && typeof imageData === 'object') {
            if (imageData.url) {
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const response = await fetch(imageData.url);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filepath, buffer);
            } else if (imageData.data) {
                if (typeof imageData.data === 'string') {
                    if (imageData.data.startsWith('data:')) {
                        const base64Data = imageData.data.split(',')[1];
                        fs.writeFileSync(filepath, base64Data, 'base64');
                    } else {
                        fs.writeFileSync(filepath, imageData.data, 'base64');
                    }
                } else {
                    fs.writeFileSync(filepath, imageData.data);
                }
            } else {
                throw new Error(`Unsupported object format. Keys: ${Object.keys(imageData).join(', ')}`);
            }
        } else {
            throw new Error(`Unsupported image data format: ${typeof imageData}`);
        }

        return { filename, filepath };
    } catch (error) {
        throw new Error(`Failed to save enhanced image: ${error.message}`);
    }
}

/**
 * Remove background from image using not-lain/background-removal model
 * @param {string} imageUrl - URL of the image to remove background from
 * @returns {Object} Response object with status code and data
 */
async function removeBackground(imageUrl) {
    await configureProxy();
    
    try {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            return {
                status: 500,
                error: 'Image URL is required and must be a non-empty string'
            };
        }

        if (!isValidImageUrl(imageUrl)) {
            return {
                status: 500,
                error: 'Invalid image URL format'
            };
        }

        const client = await Client.connect("not-lain/background-removal");
        
        const requestPromise = client.predict("/text", { 
            image: imageUrl 
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 60000)
        );
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        
        if (!Array.isArray(result.data) || !Array.isArray(result.data[0]) || result.data[0].length < 1) {
            return {
                status: 500,
                error: 'Unexpected response from background removal service'
            };
        }
        
        const removedUrl = result.data[0][0]?.url;
        if (!removedUrl) {
            return {
                status: 500,
                error: 'Failed to get removed background image URL'
            };
        }

        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetch(removedUrl);
        if (!response.ok) {
            return {
                status: 500,
                error: 'Failed to download removed background image'
            };
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { filename, filepath } = await saveRemovedBgImage(buffer, imageUrl);

        return {
            status: 200,
            data: {
                filename: filename,
                filepath: filepath,
                original_url: imageUrl,
                model: 'not-lain/background-removal',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        };

    } catch (error) {
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to remove background"
        };
    }
}

/**
 * Save removed background image to tmp directory
 * @param {Buffer} imageBuffer - Image buffer data
 * @param {string} originalUrl - Original image URL
 * @returns {Object} Filename and filepath
 */
async function saveRemovedBgImage(imageBuffer, originalUrl) {
    try {
        const tmpDir = path.join(process.cwd(), 'tmp', 'removebg');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filename = `removebg_${timestamp}_${randomStr}.png`;
        const filepath = path.join(tmpDir, filename);

        fs.writeFileSync(filepath, imageBuffer);

        return { filename, filepath };
    } catch (error) {
        throw new Error(`Failed to save removed background image: ${error.message}`);
    }
}

/**
 * Enhance image quality using Finegrain Image Enhancer (V2)
 * @param {string} imageUrl - URL of the image to enhance
 * @param {Object} options - Optional parameters
 * @param {string} options.prompt - Enhancement prompt (default: "")
 * @param {string} options.negative_prompt - Negative prompt (default: "")
 * @param {number} options.seed - Seed for generation (default: 42)
 * @param {number} options.upscale_factor - Upscale factor (default: 2)
 * @param {number} options.controlnet_scale - ControlNet scale (default: 0.6)
 * @param {number} options.controlnet_decay - ControlNet decay (default: 1)
 * @param {number} options.condition_scale - Condition scale (default: 6)
 * @param {number} options.tile_width - Tile width (default: 112)
 * @param {number} options.tile_height - Tile height (default: 144)
 * @param {number} options.denoise_strength - Denoise strength (default: 0.35)
 * @param {number} options.num_inference_steps - Number of inference steps (default: 18)
 * @param {string} options.solver - Solver type (default: "DDIM")
 * @returns {Object} Response object with status code and data
 */
async function imageEnhancerV2(imageUrl, options = {}) {
    // Configure proxy for this request
    await configureProxy();
    
    try {
        // Validate inputs
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            return {
                status: 500,
                error: 'Image URL is required and must be a non-empty string'
            };
        }

        // Validate URL format
        if (!isValidImageUrl(imageUrl)) {
            return {
                status: 500,
                error: 'Invalid image URL format'
            };
        }

        const {
            prompt = "",
            negative_prompt = "",
            seed = 42,
            upscale_factor = 2,
            controlnet_scale = 0.6,
            controlnet_decay = 1,
            condition_scale = 6,
            tile_width = 112,
            tile_height = 144,
            denoise_strength = 0.35,
            num_inference_steps = 18,
            solver = "DDIM"
        } = options;

        // Fetch image from URL
        const imageData = await fetchImageFromUrl(imageUrl);

        const client = await Client.connect("finegrain/finegrain-image-enhancer");
        
        const requestPromise = client.predict("/process", {
            input_image: imageData.blob,
            prompt,
            negative_prompt,
            seed,
            upscale_factor,
            controlnet_scale,
            controlnet_decay,
            condition_scale,
            tile_width,
            tile_height,
            denoise_strength,
            num_inference_steps,
            solver
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 180000) // 3 minutes timeout
        );
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        
        const enhancedImageData = result.data;
        
        if (!enhancedImageData || !Array.isArray(enhancedImageData) || enhancedImageData.length === 0) {
            return {
                status: 500,
                error: 'Empty response from AI service'
            };
        }

        // Extract the first enhanced image URL
        const firstImage = enhancedImageData[0];
        if (!Array.isArray(firstImage) || firstImage.length === 0 || !firstImage[0]?.url) {
            return {
                status: 500,
                error: 'No enhanced image URL found in response'
            };
        }

        const enhancedImageUrl = firstImage[0].url;

        // Download and save enhanced image to tmp directory
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetch(enhancedImageUrl);
        if (!response.ok) {
            return {
                status: 500,
                error: 'Failed to download enhanced image'
            };
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to tmp directory
        const { filename, filepath } = await saveEnhancedImageV2(buffer, imageData.filename);

        return {
            status: 200,
            data: {
                filename: filename,
                filepath: filepath,
                enhanced_url: enhancedImageUrl,
                upscale_factor: upscale_factor,
                original_url: imageUrl,
                model: 'finegrain-image-enhancer',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                parameters: {
                    prompt,
                    negative_prompt,
                    seed,
                    upscale_factor,
                    controlnet_scale,
                    controlnet_decay,
                    condition_scale,
                    tile_width,
                    tile_height,
                    denoise_strength,
                    num_inference_steps,
                    solver
                }
            }
        };

    } catch (error) {
        // Mark proxy as failed if error occurred
        ProxyManager.markProxyAsFailed();
        
        return {
            status: 500,
            error: error.message || "Failed to enhance image with V2"
        };
    }
}

/**
 * Save enhanced image V2 to tmp directory
 * @param {Buffer} imageBuffer - Image buffer data
 * @param {string} originalFilename - Original filename
 * @returns {Object} Filename and filepath
 */
async function saveEnhancedImageV2(imageBuffer, originalFilename) {
    try {
        // Ensure tmp directory exists
        const tmpDir = path.join(process.cwd(), 'tmp', 'enhancer-v2');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const originalExt = path.extname(originalFilename).toLowerCase() || '.webp';
        
        const filename = `enhancer_v2_${timestamp}_${randomStr}${originalExt}`;
        const filepath = path.join(tmpDir, filename);

        // Save image buffer to file
        fs.writeFileSync(filepath, imageBuffer);

        return { filename, filepath };
    } catch (error) {
        throw new Error(`Failed to save enhanced image V2: ${error.message}`);
    }
}

export { generateImage, chatGPT, startChatSession, mistralAI, textToImage, imageEditor, imageEnhancer, imageEnhancerV2, removeBackground };
