from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import pandas as pd
import numpy as np
import openai
import time

t1 = time.time()

with open('apiKey.bin', 'r') as f:
    apiKey = f.read()
openai.api_key = apiKey

def get_batch_embeddings(texts, model="text-embedding-ada-002"):
    response = openai.Embedding.create(input=texts, model=model)
    return [data['embedding'] for data in response['data']]

def load_csv(file_path):
    return pd.read_csv(file_path)

def generate_embeddings_parallel(df, batch_size=50):
    embeddings = []
    batches = [df.iloc[i:i+batch_size].apply(lambda row: ' '.join(row.astype(str)), axis=1).tolist() 
               for i in range(0, len(df), batch_size)]
    with ThreadPoolExecutor() as executor:
        results = list(tqdm(executor.map(get_batch_embeddings, batches), total=len(batches), desc="Generating Investors Embeddings", colour='red'))
    for result in results:
        embeddings.extend(result)
    embeddings = np.array(embeddings)
    np.save('embeddingData/investorEmbeddings.npy', embeddings)
    return embeddings

df = load_csv("dataStuff/synthDataInvestor.csv")
embeddings = generate_embeddings_parallel(df)
print("Investors Embeddings Generated !")

t2 = time.time()
print("Exec Time: " + str(t2-t1) + 'Secs')