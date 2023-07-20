FROM node:lts-bullseye-slim
LABEL Name=pomodorotimer_test Version=0.0.1
# Install required dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    bzip2 \
    libgtk-3-0 \
    libasound2 \
    libdbus-glib-1-2 \
    libx11-xcb1 \
    firefox-esr
  #  && rm -rf /var/lib/apt/lists/*
# Set an environment variable for headless mode
ENV MOZ_HEADLESS=1

# Copy server configuration
COPY ./src/nginx_server.conf /etc/nginx/sites-enabled
# Download geckodriver in $PATH folder
COPY ./src/geckodriver /usr/local/bin/

# Install other dependencies
WORKDIR /usr/app
COPY ./package.json .
RUN npm install


# Run test
# RUN npm run test
