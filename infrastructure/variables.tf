variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "environment must be one of: development, staging, production."
  }
}

variable "cors_allowed_origins" {
  description = "List of origins allowed to access the images bucket via CORS"
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:3000"]
}
