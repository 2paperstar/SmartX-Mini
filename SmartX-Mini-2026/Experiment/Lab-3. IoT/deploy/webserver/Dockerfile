FROM ubuntu:24.04
LABEL maintainer="SmartX Labs <mini@smartx.kr>"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        nodejs \
        vim \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY webserver.js .

EXPOSE 80

CMD ["node", "webserver.js"]
