FROM nginx:latest
LABEL Name=pomodorotimer_production Version=0.0.2

# Copy server configuration
COPY ./src/nginx_server.conf /etc/nginx/conf.d/default.conf

# Install other dependencies
WORKDIR /usr/app
COPY ./dist .
