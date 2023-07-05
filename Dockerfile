FROM nginx:stable-alpine3.17-slim
LABEL Name=pomodorotimer Version=0.0.1
#configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx_server.conf /etc/nginx/conf.d/
#copy site
COPY . /usr/share/nginx/html
RUN rm /usr/share/nginx/html/nginx_server.conf
EXPOSE 80
