from crawler import get_github_activites
from dotenv import load_dotenv
import os
import pandas as pd
import csv
import json


def main():
    load_dotenv()
    df = pd.read_csv("github.csv")
    dict = []
    for i in range(0, df.shape[0]):
        item = df.iloc[i]
        full_name = item["full_name"]
        language = item["language"]
        # print(item)
        if language == "TypeScript" or language == "JavaScript":
            data = get_github_activites(full_name, os.getenv("GITHUB_ACCESS_TOKEN"))

            if data is None:
                print(full_name)
                continue

            if len(data) == 0:
                print(full_name + " has no activity")
                continue

            for item in data:
                dict.append(
                    {
                        "full_name": full_name,
                        "timestamp": item["timestamp"],
                        "activity_type": item["activity_type"],
                        "ref": item["ref"],
                    }
                )

    df = pd.DataFrame(dict)
    df.to_csv("activity.csv", quoting=csv.QUOTE_ALL, index=False)


main()
