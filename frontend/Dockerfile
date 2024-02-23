FROM nginx:mainline-alpine3.18-slim
LABEL Name=pomodorotimer_forntend

# Copy the server configuration.
COPY ./src/nginx.conf /etc/nginx/conf.d/default.conf

# Install the other dependencies.
WORKDIR /usr/app
COPY ./dist .
