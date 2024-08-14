# MDE Preterm Visualization

This is a repository for doing data visualization for MDE Preterm data visualization class. I attempt to try to visualize my code repository based on their package.json file

## Setup

You need python to do the parsing and crawling. I used python 3.9.6

If you would like to crawl yourself, create a virtual environment for python using the command below

```bash
$ python -m venv .venv
```

After that activate the environment

```bash
$ source .venv/bin/activate
```

Now go in to the `programs` directory

```bash
$ cd programs
```

Then proceed to execute any code in your interest

```bash
$ python3 crawl_github.py
```

Remember that if you would like to your private repositories you must get an access token from github api and create an .env file with that token. You can copy the `.env.example` and rename the copied file to `.env` and then write your own access token.