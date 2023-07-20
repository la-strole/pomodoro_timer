FROM node
LABEL Name=pomodorotimer_test Version=0.0.1
#configuration
RUN apt update
# Download geckodriver in $PATH folder
WORKDIR /usr/local/bin
RUN wget -O /usr/local/bin/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-linux64.tar.gz
RUN tar -xvzf geckodriver.tar.gz
RUN rm geckodriver.tar.gz
# Install other dependencies
WORKDIR /usr/app
COPY ./package.json .
RUN npm install

# Run test
# RUN npm run test
