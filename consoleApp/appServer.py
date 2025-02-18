'''
POST Body:
{
  "csv_file": "path_to_your_file/investor_data.csv",
  "channel": "investors" | "startups",
  "query": "List investors who prefer the Technology sector"
}

Result:
{
    "result": "Here is the list of investors who prefer the Technology sector: ..."
}
'''

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import openai
import faiss
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open('apiKey.bin', 'r') as f:
    apiKey = f.read() 
openai.api_key = apiKey

def get_batch_embeddings(texts, model="text-embedding-ada-002"):
    response = openai.Embedding.create(input=texts, model=model)
    return np.array([data['embedding'] for data in response['data']])

def build_faiss_index(embeddings):
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index

def search_faiss(query, index, k=17):
    query_embedding = get_batch_embeddings([query])
    distances, indices = index.search(query_embedding, k)
    return indices[0], distances[0]

def query_gpt_4o_mini(query, retrieved_indices, df):
    retrieved_data = "\n".join([str(df.iloc[idx].to_dict()) for idx in retrieved_indices])
    

    print(retrieved_data)
    prompt = f"""
    You are an expert AI assistant specialized in analyzing startup / investor data. Your task is to provide concise, relevant, and actionable answers to the user query based on the provided data.

    Data context:
    {retrieved_data}

    User Query: "{query}"

    Your answer should directly address the user's query based on the context and data provided. If the answer is not explicitly found, provide the most relevant information or indicate uncertainty.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": '''You are an expert AI assistant specializing in analyzing startup and investor data. Your goal is to provide highly relevant, clear, and concise answers to user queries based on the given dataset.

Instructions:
Context Awareness:

Use only the retrieved data for your responses.
If the exact answer isn’t available, provide the most relevant insights based on the data.
Avoid guessing—state if the information is insufficient.
User-Friendly Formatting:

Use bullet points for lists.
Highlight key data points.
Keep answers structured and readable.
Engagement & Clarity:

Summarize complex information simply.
If a query is unclear, suggest a more specific question.
Avoid excessive jargon—make it easy to understand.
Response Optimization:

Prioritize actionable insights.
Compare and contrast relevant data points if applicable.
Where useful, suggest next steps or additional queries the user might ask.
use emojis to make the response more engaging.

dont use ** and ## in your response'''},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=2500, 
        top_p=1.0, 
        frequency_penalty=0.0, 
        presence_penalty=0.0 
    )
    return response['choices'][0]['message']['content']

def perform_query(query, index, df):
    indices, distances = search_faiss(query, index)
    answer = query_gpt_4o_mini(query, indices, df)
    return answer

@app.route('/query', methods=['POST'])
def query():

    if 'csv_file' not in request.files:
        print("Error: CSV file is missing")
        return jsonify({"error": "CSV file is required."}), 400
    
    if 'query' not in request.form:
        print("Error: Query is missing")
        return jsonify({"error": "Query is required."}), 400
    
    csv_file = request.files['csv_file']
    channel = request.form.get("channel", "startups")  
    embedding_file = (
        "/Volumes/ReserveDisk/OpenSourceContribution/aXtrStuff/SSpoc/consoleApp/embeddingData/investorEmbeddings.npy"
        if channel == "investors"
        else "/Volumes/ReserveDisk/OpenSourceContribution/aXtrStuff/SSpoc/consoleApp/embeddingData/startupEmbeddings.npy"
    )


    query_text = request.form['query']
    df = pd.read_csv(csv_file)
    embeddings = np.load(embedding_file)
    index = build_faiss_index(embeddings)
    result = perform_query(query_text, index, df)
    print(result)
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True,port=5000)