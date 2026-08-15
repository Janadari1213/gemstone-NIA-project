FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY results/ ./results/
EXPOSE 5000
WORKDIR /app/backend
CMD ["python", "app.py"]
