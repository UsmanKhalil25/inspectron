FROM python:3.13-slim

WORKDIR /app

ENV PYTHONPATH=/app/src

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN playwright install-deps
RUN playwright install chromium

COPY . .

CMD ["bash"]
