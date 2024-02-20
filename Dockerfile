FROM nginx:latest
LABEL Name=pomodorotimer_production

# Copy the server configuration.
COPY ./src/nginx.conf /etc/nginx/conf.d/default.conf

# Install the other dependencies.
WORKDIR /usr/app
COPY ./dist .
