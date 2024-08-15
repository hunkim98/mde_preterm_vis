from transformers import pipeline

from transformers import DebertaTokenizer, DebertaModel, AutoTokenizer, AutoModel
import json
import pandas as pd

THRESHOLD = 0.3


def main():

    classifier = pipeline(
        "zero-shot-classification", model="Azma-AI/deberta-base-multi-label-classifier"
    )

    candidate_labels = [
        "editor",
        "web development",
        "artificial intelligence",
        "data visualization",
        "mathematics",
        "art",
        "blockchain",
    ]

    tokenizer = AutoTokenizer.from_pretrained(
        "Azma-AI/deberta-base-multi-label-classifier"
    )

    # microsoft/deberta-v3-base

    model = AutoModel.from_pretrained("Azma-AI/deberta-base-multi-label-classifier")

    df = pd.read_csv("github.csv")

    temp_json = {}

    for i in range(0, df.shape[0]):
        item = df.iloc[i]
        name = item["name"]
        full_name = item["full_name"]
        description = item.get("description", "")
        language = item["language"]
        stars = item["stars"]
        url = item["html_url"]

        # check if the description is nan
        if type(description) is float:
            description = ""
            continue

        text = name + " : " + description

        labels = classifier(text, candidate_labels)

        inputs = tokenizer(text, return_tensors="pt")

        outputs = model(**inputs)

        sentence_embedding = outputs.last_hidden_state.mean(dim=1)

        # Step 6: Convert to numpy (optional)
        sentence_embedding = sentence_embedding.detach().numpy()

        # Print the sentence embedding

        best_label = labels["labels"][0]

        labels_above_threshold = [
            labels["labels"][i]
            for i in range(len(labels["labels"]))
            if labels["scores"][i] > THRESHOLD
        ]

        if len(labels_above_threshold) == 0:
            labels_above_threshold = []

        print(labels_above_threshold)

        temp_json[full_name] = {
            "full_name": full_name,
            "name": name,
            "description": description,
            "stars": str(stars),
            "language": language,
            "labels": labels_above_threshold,
            "url": url,
            # "embedding": sentence_embedding.tolist(),
        }

    json.dump(temp_json, open("labels.json", "w"))


main()
