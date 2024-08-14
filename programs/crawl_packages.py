import pandas as pd
from crawler import get_raw_github_data
from dotenv import load_dotenv
import os
import json
import csv


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
            data = get_raw_github_data(
                full_name, "package.json", os.getenv("GITHUB_ACCESS_TOKEN")
            )

            if data is None:
                print(full_name)
                continue
            description = data.get("description", "")
            keywords = ",".join(data.get("keywords", []))
            dependencies = data.get("dependencies", {})
            dependency_list = list(dependencies.keys())
            dependency_str = ",".join(dependency_list)
            dict.append(
                {
                    "full_name": full_name,
                    "description": description,
                    "keywords": keywords,
                    "dependencies": dependency_str,
                }
            )

    df = pd.DataFrame(dict)
    df.to_csv("repository.csv", quoting=csv.QUOTE_ALL, index=False)


main()
