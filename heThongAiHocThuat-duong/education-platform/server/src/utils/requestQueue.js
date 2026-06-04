// Global rate limiter for Gemini API
// Ensures requests don't exceed ~1 per 2 seconds to avoid 429 errors

class RequestQueue {
  constructor(minIntervalMs = 2000) {
    this.queue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minIntervalMs = minIntervalMs;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const { fn, resolve, reject } = this.queue.shift();

    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const delayNeeded = Math.max(0, this.minIntervalMs - timeSinceLastRequest);

    if (delayNeeded > 0) {
      await new Promise(r => setTimeout(r, delayNeeded));
    }

    try {
      this.lastRequestTime = Date.now();
      const result = await fn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.isProcessing = false;
      setImmediate(() => this.process());
    }
  }
}

// Global queue instance for Gemini
// Free tier: 15 RPM (1 per 4s), use 2.5s for balance
const geminiQueue = new RequestQueue(2500); // 2.5 seconds between requests

module.exports = { RequestQueue, geminiQueue };
