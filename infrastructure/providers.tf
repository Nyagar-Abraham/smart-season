terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "smart-season-terraform-state"
    key            = "smart-season/terraform.tfstate"
    region         = "us-east-1"
    # dynamodb_table = "smart-season-terraform-locks"
    encrypt        = true
    use_lockfile   = true
  }
}

provider "aws" {
  region = var.aws_region
  profile = "default"

  default_tags {
    tags = {
      Project     = "smart-season"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
