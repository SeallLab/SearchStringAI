# Use a lightweight Python base image
FROM pytorch/pytorch:2.9.0-cuda12.8-cudnn9-runtime

# Set working directory inside container
WORKDIR /app

# Copy only dependencies first (better caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt --verbose

# Copy the entire project into the container
COPY . .

# Expose the port Gunicorn will run on
EXPOSE 5000

# Run Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
