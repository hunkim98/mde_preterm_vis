from crawler import search_github, get_npm_data, search_all_github, parse_search_result
from dotenv import load_dotenv
import os
import pandas as pd
import csv


def main():
    load_dotenv()
    username = "hunkim98"
    access_token = os.getenv("GITHUB_ACCESS_TOKEN")
    items = search_all_github(username, access_token)

    dict = []
    for item in items:
        dict.append(parse_search_result(item))

    df = pd.DataFrame(dict)
    df.to_csv("github.csv", quoting=csv.QUOTE_ALL, index=False)


main()
