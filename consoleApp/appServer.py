from flask import Flask, request, jsonify
import numpy as np
import openai
import faiss
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development

# Load OpenAI API key from file
api_key_path = os.path.join(os.path.dirname(__file__), 'apiKey.bin')
if os.path.exists(api_key_path):
    with open(api_key_path, 'r') as f:
        openai.api_key = f.read().strip()
else:
    raise ValueError("API key file 'apiKey.bin' not found.")

# Function to generate text embeddings
def get_batch_embeddings(texts, model="text-embedding-ada-002"):
    if not texts:
        print("Warning: Empty text list received for embedding.")
        return None
    try:
        response = openai.Embedding.create(input=texts, model=model)
        return np.array([data['embedding'] for data in response['data']])
    except Exception as e:
        print(f"Error in embedding generation: {e}")
        return None

# Function to build FAISS index
def build_faiss_index(embeddings):
    if embeddings is None or embeddings.shape[0] == 0:
        print("Warning: No valid embeddings for FAISS index.")
        return None
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index

# Function to search FAISS index
def search_faiss(query, index, text_chunks, k=10):
    if index is None:
        print("Warning: FAISS index is empty.")
        return []
    query_embedding = get_batch_embeddings([query])
    if query_embedding is None:
        print("Warning: Failed to generate embedding for query.")
        return []
    
    distances, indices = index.search(query_embedding, k)
    return [text_chunks[idx] for idx in indices[0] if idx < len(text_chunks)]

# Function to query GPT-4o Mini
def query_gpt_4o_mini(query, retrieved_texts, reader_report):
    context = "\n\n".join(retrieved_texts) if retrieved_texts else "No relevant context found."
    
    prompt = f"""
    You are an AI assistant analyzing movie scripts and reader reports. Answer user queries based on the provided data.

    **Reader Report:**
    {reader_report}

    **Movie Script Context:**
    {context}

    **User Query:**
    "{query}"
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI specializing in analyzing movie scripts and reader reports. Use the provided data to answer queries with clarity and insight."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=500
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error querying GPT-4o Mini: {e}")
        return "Error generating response."

@app.route('/query', methods=['POST'])
def query():
    try:
        # Ensure files and query are provided
        if 'movie_script' not in request.files or 'reader_report' not in request.files:
            return jsonify({"error": "Both movie_script and reader_report files are required."}), 400
        if 'query' not in request.form:
            return jsonify({"error": "Query is required."}), 400

        # Read input files
        movie_script = request.files['movie_script'].read().decode('utf-8')
        reader_report = request.files['reader_report'].read().decode('utf-8')
        query_text = request.form['query']

        if not movie_script.strip():
            return jsonify({"error": "Movie script file is empty."}), 400
        if not reader_report.strip():
            return jsonify({"error": "Reader report file is empty."}), 400

        # Split movie script into chunks (for efficient embeddings)
        script_chunks = [movie_script[i:i+500] for i in range(0, len(movie_script), 500)]

        # Generate embeddings and build FAISS index
        embeddings = get_batch_embeddings(script_chunks)
        if embeddings is None:
            return jsonify({"error": "Failed to generate embeddings."}), 500

        index = build_faiss_index(embeddings)
        
        # Retrieve relevant movie script sections (if FAISS index exists)
        retrieved_texts = search_faiss(query_text, index, script_chunks, k=10) if index else []

        # Query GPT-4o Mini
        result = query_gpt_4o_mini(query_text, retrieved_texts, reader_report)

        return jsonify({"result": result})

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
