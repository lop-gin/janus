# ---- Base Python ----
# Use an official Python runtime as a parent image
FROM python:3.11-slim AS python-base

# Set environment variables for Python
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# ---- Builder Stage ----
# This stage is for installing dependencies, including any that might need compilation
FROM python-base AS builder

# Set the working directory in the container
WORKDIR /app

# Install build tools if necessary (e.g., gcc for some packages)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev

# Create a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies into the virtual environment
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt


# ---- Runtime Stage ----
# This stage creates the final image with the application and its dependencies
FROM python-base AS runtime

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Make sure scripts in venv are executable
ENV PATH="/opt/venv/bin:$PATH"

# Copy the application code into the container
# This assumes your FastAPI application is in an 'app' directory
COPY ./app ./app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Uvicorn will look for an object named 'app' in the 'app.main' module.
# --host 0.0.0.0 makes the app accessible from outside the container.
# --port 8000 is the port it will listen on.
# --reload is for development, remove it for production for better performance.
# For production, you might also want to increase --workers.
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Note on Environment Variables for Supabase:
# The application expects SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY.
# These should be provided at runtime when starting the container, for example:
# docker run -e SUPABASE_URL="your_url" -e SUPABASE_SERVICE_KEY="your_key" ... <image_name>
# Or using Docker Compose with an .env file.
# Do NOT hardcode these in the Dockerfile.
# Example of declaring them with (optional) default values (not recommended for secrets):
# ENV SUPABASE_URL="default_url_if_any"
# ENV SUPABASE_SERVICE_KEY="default_service_key_if_any"
# ENV SUPABASE_ANON_KEY="default_anon_key_if_any"
