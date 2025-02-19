from flask import Flask, request, jsonify
import numpy as np
import openai
import faiss
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open('apiKey.bin', 'r') as f:
    apiKey = f.read().strip()
openai.api_key = apiKey

# Function to generate text embeddings
def get_batch_embeddings(texts, model="text-embedding-ada-002"):
    response = openai.Embedding.create(input=texts, model=model)
    return np.array([data['embedding'] for data in response['data']])

# Function to build FAISS index
def build_faiss_index(embeddings):
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index

# Function to search FAISS index
def search_faiss(query, index, text_chunks, k=10):
    query_embedding = get_batch_embeddings([query])
    distances, indices = index.search(query_embedding, k)
    
    retrieved_texts = [text_chunks[idx] for idx in indices[0] if idx < len(text_chunks)]
    return retrieved_texts

# Function to query GPT-4o Mini with relevant data
def query_gpt_4o_mini(query, retrieved_texts, reader_report):
    context = "\n\n".join(retrieved_texts)  # Movie script snippets
    prompt = f"""
    You are an AI assistant analyzing movie scripts and reader reports. Answer user queries based on the provided data.

    **Reader Report:**
    {reader_report}

    **Movie Script Context:**
    {context}

    **User Query:**
    "{query}"
    """
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

@app.route('/query', methods=['POST'])
def query():
    # Check for file inputs
    if 'movie_script' not in request.files or 'reader_report' not in request.files:
        return jsonify({"error": "Both movie_script and reader_report files are required."}), 400
    if 'query' not in request.form:
        return jsonify({"error": "Query is required."}), 400
    
    # Read input files
    movie_script = request.files['movie_script'].read().decode('utf-8')
    reader_report = request.files['reader_report'].read().decode('utf-8')
    query_text = request.form['query']

    # Split movie script into chunks (to optimize embedding processing)
    script_chunks = [movie_script[i:i+500] for i in range(0, len(movie_script), 500)]

    # Generate embeddings only once for the movie script
    embeddings = get_batch_embeddings(script_chunks)
    index = build_faiss_index(embeddings)

    # Retrieve relevant movie script sections
    retrieved_texts = search_faiss(query_text, index, script_chunks, k=10)

    # Query GPT-4o Mini with both retrieved script sections & full reader report
    result = query_gpt_4o_mini(query_text, retrieved_texts, reader_report)

    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True, port=5000)