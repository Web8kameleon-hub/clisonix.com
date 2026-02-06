FROM python:3.11-slim

WORKDIR /app

# Copy root-level content factory modules
COPY blerina_core.py /app/
COPY eap_layer.py /app/
COPY clx_publisher.py /app/
COPY content_factory.py /app/

# Copy service requirements and code
COPY services/content-factory/requirements.txt /app/
COPY services/content-factory/main.py /app/

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8005

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
