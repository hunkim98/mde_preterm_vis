import requests


def get_npm_data(package_name):
    endpoint = "https://registry.npmjs.org/"
    response = requests.get(endpoint + package_name)
    if response.status_code == 200:
        return response.json()
    else:
        return None


def search_github(username, access_token, page=1):
    endpoint = (
        f"https://api.github.com/search/repositories?q=user:{username}&page={page}"
    )
    response = requests.get(
        endpoint, headers={"Authorization": f"token {access_token}"}
    )

    if response.status_code == 200:
        return response.json()
    else:
        return None


def search_all_github(username, access_token):
    response = search_github(username, access_token)
    total_count = response["total_count"]
    max_count = 1000

    items = response["items"]

    current_count = len(items)

    page = 2
    while current_count < total_count and current_count < max_count:
        response = search_github(username, access_token, page)
        items += response["items"]
        current_count += len(response["items"])
        page += 1

    return items


def parse_search_result(item):
    name = item["name"]
    html_url = item["html_url"]
    description = item["description"]
    language = item["language"]
    stars = item["stargazers_count"]
    full_name = item["full_name"]
    topics = ",".join(item["topics"])
    return {
        "name": name,
        "html_url": html_url,
        "full_name": full_name,
        "description": description,
        "language": language,
        "stars": stars,
        "topics": topics,
    }


def get_raw_github_data(full_name, filename, accesstoken):
    response = requests.get(
        "https://api.github.com/repos/" + full_name + "/contents/" + filename,
        headers={
            "Authorization": f"token {accesstoken}",
            "Accept": "application/vnd.github.v3.raw+json",
        },
    )

    if response.status_code == 200:
        return response.json()
    else:
        return None


def get_github_activites(fullname, accesstoken, period="", activity_type="push"):
    all_data = []
    has_next = True

    # initial call of the data
    response = requests.get(
        "https://api.github.com/repos/"
        + fullname
        + "/activity"
        + "?time_period="
        + period
        + "&activity_type="
        + activity_type,
        headers={"Authorization": f"token {accesstoken}"},
    )

    next_link = None

    if response.status_code == 200:
        all_data += response.json()

        link = response.headers.get("Link", None)

        if link is not None and "next" in link:
            next_link = response.headers["Link"].split(";")[0][1:-1]

    while next_link is not None:
        data, next_link = recursive_call_with_link(next_link, accesstoken)
        all_data += data

    # reverse the data
    all_data.reverse()
    return all_data


def recursive_call_with_link(url, accesstoken):
    response = requests.get(
        url,
        headers={"Authorization": f"token {accesstoken}"},
    )

    if response.status_code == 200:
        if "next" in response.headers["Link"]:
            next_link = response.headers["Link"].split(";")[0][1:-1]
            return response.json(), next_link
        else:
            return response.json(), None
    else:
        return None
