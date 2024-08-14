from transformers import pipeline

from transformers import DebertaTokenizer, DebertaModel, AutoTokenizer, AutoModel


def main():

    classifier = pipeline(
        "zero-shot-classification", model="Azma-AI/deberta-base-multi-label-classifier"
    )

    text = "lge-log-analysis"

    candidate_labels = [
        "web editor",
        "algorithms",
        "Artificial Intelligence",
        "visualization",
        "academics",
        "framework",
    ]

    labels = classifier(text, candidate_labels)

    tokenizer = AutoTokenizer.from_pretrained(
        "Azma-AI/deberta-base-multi-label-classifier"
    )

    # microsoft/deberta-v3-base

    model = AutoModel.from_pretrained("Azma-AI/deberta-base-multi-label-classifier")

    inputs = tokenizer(text, return_tensors="pt")

    outputs = model(**inputs)

    sentence_embedding = outputs.last_hidden_state.mean(dim=1)

    # Step 6: Convert to numpy (optional)
    sentence_embedding = sentence_embedding.detach().numpy()

    # Print the sentence embedding
    print(sentence_embedding.shape)

    best_label = labels["labels"][0]

    second_label = labels["labels"][1]

    print(best_label)


main()
