from crawler import search_github, get_npm_data, search_all_github, parse_search_result
from dotenv import load_dotenv
import os
import pandas as pd
import csv
import json


def main():
    # read csv
    df = pd.read_csv("npm.csv")
    df["keywords"] = df["keywords"].astype(str)
    parent = {}
    keywords = {}
    for i in range(0, df.shape[0]):
        item = df.iloc[i]
        keyword = item["keywords"]
        if keyword == "":
            continue
        split_keywords = keyword.split(",")
        for k in split_keywords:
            if k not in parent:
                parent[k] = []
                parent[k].append(item["dependency"])
            else:
                parent[k].append(item["dependency"])
            if k not in keywords:
                keywords[k] = 0
            keywords[k] += 1

    keywords = dict(sorted(keywords.items(), key=lambda item: item[1], reverse=True))
    # save as json
    data = []
    for key in keywords.keys():
        concatted_parents = map(str, parent[key])
        parents = ",".join(concatted_parents)
        data.append({"keyword": key, "count": keywords[key], "parents": parents})

    # change data to csv
    df = pd.DataFrame(data)
    df["count"] = df["count"].astype(int)
    df.to_csv("keywords.csv", quoting=csv.QUOTE_ALL, index=False)

    # json.dump(keywords, open("keywords.json", "w"))


main()
