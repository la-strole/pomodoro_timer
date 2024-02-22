FROM python:slim-bullseye

# Copy files and virtual environments (be sure to not include .env file with tokens)
ADD ./pyproject.toml /home

RUN apt update

# Install curl
RUN apt install curl -y

WORKDIR /home
# Install environment
# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Install poetry dependencies
RUN ~/.local/bin/poetry config virtualenvs.create false \ 
    && ~/.local/bin/poetry install --no-root --with deploy

ADD ./pomodoro_server /home/pomodoro_server

WORKDIR /home/pomodoro_server

# Copy the entrypoint script into the container
COPY ./scripts/entrypoint.sh /home/pomodoro_server/entrypoint.sh
RUN chmod +x /home/pomodoro_server/entrypoint.sh

# Command to run the application using Gunicorn
# Set the entrypoint script as the default command
ENTRYPOINT ["/home/pomodoro_server/entrypoint.sh"]
