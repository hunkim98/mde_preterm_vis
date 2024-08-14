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
