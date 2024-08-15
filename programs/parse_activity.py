import os
import pandas as pd
import csv
import json


def main():
    df = pd.read_csv("activity.csv")
    unique_full_names = df["full_name"].unique()

    print(unique_full_names)

    # we will make the unique_full_names as columns for the new dataframe

    # first change the timestampe to date without day but only month such as 2021-01
    df["timestamp"] = pd.to_datetime(df["timestamp"]).dt.to_period("M")

    # get the timestamp
    timestamps = df["timestamp"].unique()

    # now the timestamps will be the index column
    new_df = pd.DataFrame(index=timestamps)

    # I want to count the number of activities regardless of their type

    for full_name in unique_full_names:
        # get the activities for the full_name
        activities = df[df["full_name"] == full_name]

        # count the number of activities for each timestamp
        activity_counts = activities["timestamp"].value_counts()

        # add the activity counts to the new dataframe
        new_df[full_name] = activity_counts

    new_df = new_df.fillna(0)

    # make count int instead of float
    new_df = new_df.astype(int)

    label_json = json.load(open("labels_static.json"))

    label_fullnames = list(label_json.keys())

    # filter columns that do not have empty labels
    new_df = new_df[
        [
            full_name
            for full_name in unique_full_names
            if (full_name in label_fullnames) and label_json[full_name]["labels"] != []
        ]
    ]

    # remove columns that are all 0 for all rows
    new_df = new_df.loc[:, (new_df != 0).any(axis=0)]

    # make the csv to a json too for the frontend
    new_df.to_json("activity_matrix.json", orient="index")

    # add the index for each value in the json
    json_data = json.load(open("activity_matrix.json"))
    json_data = {
        str(key): {**value, "date": str(key)} for key, value in json_data.items()
    }
    json.dump(json_data, open("activity_matrix.json", "w"))

    new_df.to_csv("activity_matrix.csv", quoting=csv.QUOTE_ALL)


main()
