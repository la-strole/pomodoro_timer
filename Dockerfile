FROM nginx:latest
LABEL Name=pomodorotimer_production

# Copy server configuration
COPY ./src/nginx_server.conf /etc/nginx/conf.d/default.conf

# Install other dependencies
WORKDIR /usr/app
COPY ./dist .
