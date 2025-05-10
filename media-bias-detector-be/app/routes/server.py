import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load model and tokenizer
model_path = "vsc/models/DeBERTa_98_only_content"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    return text.lower().strip()

def classify_text(text: str) -> str:
    preprocessed_text = preprocess_text(text)
    tokens = tokenizer(preprocessed_text, truncation=True, padding=True, max_length=384, return_tensors='pt').to(device)

    with torch.no_grad():
        output = model(**tokens)
        _, predicted = torch.max(output.logits, 1)

    class_labels = ["Center", "Left", "Right"]
    return class_labels[predicted.item()]

@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    prediction = classify_text(data["text"])
    return jsonify({"prediction": prediction})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
