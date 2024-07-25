FROM debian:stable-slim
LABEL version=v1.0.0
LABEL av=clamav
WORKDIR /scan

RUN echo "Europe/Stockholm" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt update && apt install -y clamav && \
    freshclam && \
    useradd -u 1000 gab && \
    chown -R gab:gab /scan

COPY --chown=gab:gab . .
RUN chmod +x /scan/scan_script.sh

USER gab

CMD ["/bin/bash", "/scan/scan_script.sh"]