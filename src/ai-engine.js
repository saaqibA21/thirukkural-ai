/**
 * TOP-NOTCH Neural AI Engine (STABLE GLOBAL CORE)
 * This connects to the Neural Transformer engine
 * that is loaded directly into the browser's global scope.
 */

export class KuralAI {
  constructor(dataset) {
    this.dataset = dataset;
    this.model = null;
    this.embeddings = null;
    this.isReady = false;
  }

  async init() {
    console.log("Neural System: Powering Up...");
    
    try {
        // Wait for the global engine (injected in index.html) to heartbeat
        let retries = 100; // Increased to 10 seconds for robustness
        while (!window.neural_engine && retries > 0) {
            await new Promise(r => setTimeout(r, 100));
            retries--;
        }

        if (!window.neural_engine) {
            throw new Error("Neural Core: Global Signal Lost. Please check your connection.");
        }

        const { pipeline } = window.neural_engine;
        
        // Load the specialized Transformer model (Brilliant AI)
        // This downloads ~20MB into the browser's cache once.
        this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        console.log("Encoding Wisdom: 1,330 Verses...");
        
        // Process text for every Kural to build the neural semantic space
        const texts = this.dataset.map(k => `${k.explanation} ${k.Translation}`);
        this.embeddings = [];
        
        // Use batching to prevent main-thread locking
        for (let i = 0; i < texts.length; i += 100) {
           const batch = texts.slice(i, i + 100);
           const batchEmbeds = await Promise.all(batch.map(text => this.getEmbedding(text)));
           this.embeddings.push(...batchEmbeds);
        }
        
        this.isReady = true;
        console.log("Neural Matrix: Online. Local Knowledge Armed.");
    } catch (err) {
        console.error("Neural Initialization Error:", err);
        throw err;
    }
  }

  async getEmbedding(text) {
    // Generate the meaning vector
    const output = await this.model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  // Calculate semantic distance (Cosine Similarity)
  dotProduct(vecA, vecB) {
    let product = 0;
    for (let i = 0; i < vecA.length; i++) {
        product += vecA[i] * vecB[i];
    }
    return product;
  }

  async ask(question) {
    if (!this.isReady) return { answer: "Neural Core is still indexing...", sources: [] };

    // Convert question to vector
    const userVector = await this.getEmbedding(question);

    // Compute semantic closeness to all 1,330 Kurals
    const scores = this.embeddings.map((kVector, index) => {
        const similarity = this.dotProduct(userVector, kVector);
        return { index, score: similarity };
    });

    // Best matches go to the top
    const topMatches = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const primaryKural = this.dataset[topMatches[0].index];
    const confidence = Math.round(topMatches[0].score * 100);
    
    const answer = `Based on my Neural Semantic Analysis (Confidence: ${confidence}%):

Your query is most profoundly addressed in Verse #${primaryKural.Number}. 

Thiruvalluvar teaches: "${primaryKural.explanation}" — which means ${primaryKural.Translation.toLowerCase().replace('.', '')}. 

I have mapped ${topMatches.length} related neural patterns to provide this perspective:`;

    return {
      answer,
      sources: topMatches.map(m => this.dataset[m.index])
    };
  }
}
