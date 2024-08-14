from crawler import search_github, get_npm_data, search_all_github, parse_search_result
from dotenv import load_dotenv
import os
import pandas as pd
import csv
import json


def main():
    # get unique keys
    load_dotenv()

    df = pd.read_csv("repository.csv")

    # make dependencies column as string
    df["dependencies"] = df["dependencies"].astype(str)

    unique_libs = {}

    for i in range(0, df.shape[0]):
        item = df.iloc[i]
        dependencies = item.get("dependencies", "")

        split_deps = dependencies.split(",")

        for dep in split_deps:
            if "@types" in dep:
                continue
            if "testing" in dep:
                continue
            if dep not in unique_libs:
                unique_libs[dep] = 0
            unique_libs[dep] += 1

    # sort by value
    unique_libs = dict(
        sorted(unique_libs.items(), key=lambda item: item[1], reverse=True)
    )
    print(unique_libs)

    # save as json
    json.dump(unique_libs, open("unique_libs.json", "w"))


main()
